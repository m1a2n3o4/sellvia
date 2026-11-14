import OpenAI from 'openai';
import { prisma } from '@/lib/db/prisma';
import { SITE } from '@/lib/site';
import { PLATFORM_SYSTEM_PROMPT } from './platform-kb';
import { platformAutoReply, sendPlatformImage } from './platform';
import { findStoreByTrigger, getActiveStore, setActiveStore, clearActiveStore, answerAsStore } from './demo-ai';

/** Cost / abuse limits for the platform number. Tune here. */
export const PLATFORM_LIMITS = {
  maxUserMessagesPerDay: 25, // per sender, rolling 24h
  maxGlobalAiRepliesPerDay: 1500, // all senders, rolling 24h (cost cap)
  maxInputChars: 500, // longer messages are truncated
  maxOutputTokens: 300,
  historyMessages: 6, // prior turns sent to the model
  historyWindowHours: 24,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Photos to send right after the text reply (consumed by sendPendingImages). */
const pendingImages = new Map<string, { url: string; caption: string }[]>();
export async function sendPendingImages(from: string) {
  const phone = from.replace(/\D/g, '');
  const imgs = pendingImages.get(phone);
  pendingImages.delete(phone);
  for (const img of imgs || []) await sendPlatformImage(phone, img.url, img.caption);
}

const replyTool: OpenAI.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'platform_reply',
    description: 'Reply to the user on WhatsApp.',
    parameters: {
      type: 'object',
      properties: {
        reply: { type: 'string', description: 'Plain-text WhatsApp reply, max 120 words.' },
        handoff: { type: 'boolean', description: 'True if the SatyaSell team should follow up with this person.' },
        handoffNote: { type: 'string', description: 'One-line summary for the team (only if handoff).' },
      },
      required: ['reply', 'handoff'],
    },
  },
};

const LIMIT_REACHED_MSG = `You've reached today's chat limit with our assistant. For anything else please call ${SITE.phoneDisplay} or email ${SITE.email}, and our team will help you. 🙏`;
const NON_TEXT_MSG = `Thanks for your message! I can read text messages only. Please type your question about SatyaSell, or call ${SITE.phoneDisplay}.`;
const OPTOUT_MSG = 'You have been unsubscribed and will not receive further messages from this number. Reply START anytime to resume.';
const MENU_MSG = 'Back to the SatyaSell assistant. Ask me anything about SatyaSell - features, pricing or how to get started.';
const OPTIN_MSG = 'Welcome back! Ask me anything about SatyaSell.';

function sanitize(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, PLATFORM_LIMITS.maxInputChars);
}

/**
 * Returns the reply text to send, or null to stay silent.
 * Never throws: any failure degrades to the static keyword reply.
 */
export async function handlePlatformMessage(input: {
  from: string;
  name?: string;
  text: string;
  messageType: string;
}): Promise<string | null> {
  const { from, name, messageType } = input;
  const phone = from.replace(/\D/g, '');

  try {
    if (messageType !== 'text') return NON_TEXT_MSG;

    const text = sanitize(input.text);
    if (!text) return platformAutoReply('');

    const now = Date.now();
    const since = new Date(now - DAY_MS);
    const upper = text.toUpperCase();

    // --- Opt-out / opt-in ---------------------------------------------
    if (/^(STOP|UNSUBSCRIBE)$/.test(upper)) {
      await prisma.platformMessage.create({ data: { phone, role: 'optout', content: upper } });
      return OPTOUT_MSG;
    }
    const lastPref = await prisma.platformMessage.findFirst({
      where: { phone, role: { in: ['optout', 'optin'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (/^START$/.test(upper)) {
      await prisma.platformMessage.create({ data: { phone, role: 'optin', content: upper } });
      return OPTIN_MSG;
    }
    if (lastPref?.role === 'optout') return null; // respect opt-out

    // --- Per-sender limit ------------------------------------------------
    const userCount = await prisma.platformMessage.count({
      where: { phone, role: 'user', createdAt: { gte: since } },
    });
    await prisma.platformMessage.create({ data: { phone, role: 'user', content: text } });
    if (userCount >= PLATFORM_LIMITS.maxUserMessagesPerDay) {
      return userCount === PLATFORM_LIMITS.maxUserMessagesPerDay ? LIMIT_REACHED_MSG : null;
    }

    // --- Global cost cap -------------------------------------------------
    const globalCount = await prisma.platformMessage.count({
      where: { role: 'assistant', createdAt: { gte: since } },
    });
    const apiKey = process.env.OPENAI_API_KEY;
    if (globalCount >= PLATFORM_LIMITS.maxGlobalAiRepliesPerDay || !apiKey) {
      if (!apiKey) console.error('[PlatformAI] OPENAI_API_KEY missing, using static reply');
      return platformAutoReply(text);
    }

    // --- Demo store mode (e.g. "Hi VR Tech") --------------------------------
    if (/^(MENU|EXIT|BACK)$/.test(upper)) {
      await clearActiveStore(phone);
      await prisma.platformMessage.create({ data: { phone, role: 'assistant', content: MENU_MSG } });
      return MENU_MSG;
    }
    let active: Awaited<ReturnType<typeof getActiveStore>> = null;
    try {
      active = await getActiveStore(phone);
      const opened = await findStoreByTrigger(text);
      if (opened && opened.id !== active?.store.id) {
        await setActiveStore(phone, opened.id);
        active = await getActiveStore(phone);
      }
    } catch (e) {
      console.error('[PlatformAI] Demo store lookup failed (tables missing?), using normal assistant:', e);
      active = null;
    }
    if (active && globalCount < PLATFORM_LIMITS.maxGlobalAiRepliesPerDay && apiKey) {
      const hist = await prisma.platformMessage.findMany({
        where: { phone, role: { in: ['user', 'assistant'] }, createdAt: { gt: active.since } },
        orderBy: { createdAt: 'desc' },
        take: PLATFORM_LIMITS.historyMessages + 1,
      });
      const priorStore = hist.reverse().slice(0, -1).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const ans = await answerAsStore({ store: active.store, history: priorStore, text });
      if (ans) {
        await prisma.platformMessage.create({ data: { phone, role: 'assistant', content: ans.reply } });
        if (ans.handoff) {
          await createHandoff(phone, name, String(ans.handoffNote), active.store.name).catch((e) =>
            console.error('[PlatformAI] Handoff failed:', e)
          );
        }
        // Photos are sent after the text reply by the caller via this deferred hook
        pendingImages.set(phone, ans.images);
        return ans.reply;
      }
    }

    // --- AI reply ----------------------------------------------------------
    const history = await prisma.platformMessage.findMany({
      where: {
        phone,
        role: { in: ['user', 'assistant'] },
        createdAt: { gte: new Date(now - PLATFORM_LIMITS.historyWindowHours * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      take: PLATFORM_LIMITS.historyMessages + 1, // +1: includes the message just stored
    });
    const prior = history.reverse().slice(0, -1); // drop the current message

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: PLATFORM_LIMITS.maxOutputTokens,
      messages: [
        { role: 'system', content: PLATFORM_SYSTEM_PROMPT },
        ...prior.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: text },
      ],
      tools: [replyTool],
      tool_choice: { type: 'function', function: { name: 'platform_reply' } },
    });

    const call = completion.choices[0]?.message?.tool_calls?.[0] as { function: { arguments: string } } | undefined;
    const parsed = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;
    const reply: string = (parsed?.reply || '').toString().trim().slice(0, 900) || platformAutoReply(text);

    await prisma.platformMessage.create({ data: { phone, role: 'assistant', content: reply } });

    if (parsed?.handoff) {
      await createHandoff(phone, name, String(parsed.handoffNote || text)).catch((e) =>
        console.error('[PlatformAI] Handoff failed:', e)
      );
    }
    return reply;
  } catch (err) {
    console.error('[PlatformAI] Error, falling back to static reply:', err);
    return messageType === 'text' ? platformAutoReply(input.text || '') : NON_TEXT_MSG;
  }
}

/** Creates a lead in the existing Enquiries list (Super Admin → Enquiries). One per sender per 24h. */
async function createHandoff(phone: string, name: string | undefined, note: string, label?: string) {
  const mobile = phone.slice(-10);
  const recent = await prisma.enquiry.findFirst({
    where: { mobile, createdAt: { gte: new Date(Date.now() - DAY_MS) }, message: { startsWith: '[WhatsApp]' } },
  });
  if (recent) return;
  await prisma.enquiry.create({
    data: {
      name: (name || 'WhatsApp user').slice(0, 100),
      mobile,
      message: `[WhatsApp]${label ? ` [${label}]` : ''} ${note}`.slice(0, 1000),
    },
  });
}

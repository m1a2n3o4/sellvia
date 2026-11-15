import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { prisma } from '@/lib/db/prisma';
import { sendWhatsAppMessage, markMessageAsRead, sendTypingIndicator } from '@/lib/whatsapp/client';
import { processMessageWithAI, processImageWithAI } from '@/lib/whatsapp/ai';
import { verifyMetaWebhookSignature } from '@/lib/whatsapp/webhook-security';
import { handleCommerceFlow, getOrCreateConversationState } from '@/lib/whatsapp/commerce';
import { getActiveCartForChat, formatCartMessage } from '@/lib/cart/cart-service';
import { downloadWhatsAppMedia, transcribeAudio } from '@/lib/whatsapp/media';
import { getPlatformPhoneNumberId, sendPlatformText } from '@/lib/whatsapp/platform';
import { handlePlatformMessage, sendPendingImages } from '@/lib/whatsapp/platform-ai';
import { getTenantToken } from '@/lib/whatsapp/tenant-token';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Allow up to 30 seconds on Vercel Pro

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'bizmanager_webhook_verify';

// GET - Meta webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Webhook] Verified successfully');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// POST - Incoming WhatsApp messages
export async function POST(request: NextRequest) {
  let rawBody: string;
  let body: any;

  try {
    rawBody = await request.text();
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ status: 'ok' });
  }

  const signature = request.headers.get('x-hub-signature-256');
  // Signature check against the Meta app secret (covers every number connected through our app)
  const appSecret = process.env.META_APP_SECRET || '';
  const sigOk = !!appSecret && verifyMetaWebhookSignature(rawBody, signature, appSecret);

  const incoming: IncomingMessage[] = [];

  // Meta can batch several entries / changes / messages / statuses in one request: handle all of them
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change?.value;
      if (!value) continue;

      // Message status updates (fire-and-forget)
      for (const status of value.statuses || []) {
        waitUntil(handleStatusUpdate(status));
      }

      for (const message of value.messages || []) {
        const parsed = extractMessage(message);
        const phoneNumberId = value.metadata?.phone_number_id;
        if (!parsed || !parsed.messageContent || !phoneNumberId) continue;
        incoming.push({
          phoneNumberId,
          customerPhone: message.from,
          customerName: value.contacts?.find((c: any) => c.wa_id === message.from)?.profile?.name || value.contacts?.[0]?.profile?.name || null,
          waMessageId: message.id,
          rawBody,
          signature,
          sigOk,
          ...parsed,
        });
      }
    }
  }

  if (incoming.length) {
    // Return 200 to Meta IMMEDIATELY and process in the background, in order.
    // Meta retries slow/failed deliveries, so every message id is claimed once (dedupe) before it is handled.
    waitUntil(
      (async () => {
        for (const msg of incoming) {
          try {
            await processIncomingMessage(msg);
          } catch (error) {
            console.error('[Webhook] Background processing error:', error);
          }
        }
      })()
    );
  }

  return NextResponse.json({ status: 'ok' });
}

function extractMessage(message: any): { messageContent: string; messageType: string; mediaId: string | null } | null {
  let messageContent = '';
  let messageType = 'text';
  let mediaId: string | null = null;

  switch (message?.type) {
    case 'text':
      messageContent = message.text?.body || '';
      break;
    case 'image':
      messageContent = message.image?.caption || '[Image received]';
      messageType = 'image';
      mediaId = message.image?.id || null;
      break;
    case 'audio':
      messageContent = '[Voice message received]';
      messageType = 'audio';
      mediaId = message.audio?.id || null;
      break;
    case 'video':
      messageContent = message.video?.caption || '[Video received]';
      messageType = 'video';
      break;
    case 'document':
      messageContent = message.document?.caption || '[Document received]';
      messageType = 'document';
      break;
    case 'location':
      messageContent = `[Location: ${message.location?.latitude}, ${message.location?.longitude}]`;
      messageType = 'location';
      break;
    case 'interactive':
      messageContent =
        message.interactive?.button_reply?.title ||
        message.interactive?.list_reply?.title ||
        '[Interactive reply]';
      messageType = 'interactive';
      break;
    default:
      messageContent = '[Unsupported message type]';
  }
  return { messageContent, messageType, mediaId };
}

/** Claim a message id exactly once (atomic insert). Returns false if it was already handled. */
async function claimMessage(waMessageId: string): Promise<boolean> {
  if (!waMessageId) return true;
  try {
    await prisma.webhookMessageSeen.create({ data: { messageId: waMessageId } });
    if (Math.random() < 0.01) {
      // housekeeping: forget ids older than 7 days
      prisma.webhookMessageSeen
        .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
        .catch(() => {});
    }
    return true;
  } catch (e: any) {
    if (e?.code === 'P2002') return false; // already processed: skip (no duplicate reply)
    console.error('[Webhook] Dedupe check failed, processing anyway:', e?.code || e?.message);
    return true; // never drop a customer message because of a dedupe-table problem
  }
}

// ============================================
// Background message processing
// ============================================

interface IncomingMessage {
  phoneNumberId: string;
  customerPhone: string;
  customerName: string | null;
  waMessageId: string;
  messageContent: string;
  messageType: string;
  mediaId: string | null;
  rawBody: string;
  signature: string | null;
  sigOk: boolean; // signature valid for META_APP_SECRET
}

async function processIncomingMessage(msg: IncomingMessage) {
  const { phoneNumberId, customerPhone, customerName, waMessageId, messageType, mediaId } = msg;
  let { messageContent } = msg;

  // Same message id delivered twice (Meta retry / batch overlap): handle it only once
  if (!(await claimMessage(waMessageId))) {
    console.log('[Webhook] Duplicate message skipped:', waMessageId);
    return;
  }

  // Messages sent to SatyaSell's own platform number are not tenant chats
  if (phoneNumberId && phoneNumberId === getPlatformPhoneNumberId()) {
    // Demo number: signature is checked but NOT enforced yet (log-only) so the demo keeps working
    if (!msg.sigOk) {
      const platformSecret = process.env.PLATFORM_APP_SECRET || '';
      const okWithPlatformSecret = !!platformSecret && verifyMetaWebhookSignature(msg.rawBody, msg.signature, platformSecret);
      if (!okWithPlatformSecret) console.warn('[Webhook] Platform number: signature not verified (log-only, not rejected)');
    }
    console.log('[Webhook] Inbound on platform number from', customerPhone);
    // Blue ticks + "typing..." (one Meta call does both; shows until we reply, max ~25s)
    const platformToken = process.env.PLATFORM_WHATSAPP_TOKEN;
    const typingStart = Date.now();
    if (platformToken && waMessageId) {
      await sendTypingIndicator({ phoneNumberId, accessToken: platformToken, messageId: waMessageId });
    }
    const reply = await handlePlatformMessage({
      from: customerPhone,
      name: customerName || undefined,
      text: messageContent || '',
      messageType,
    });
    if (reply) {
      // Keep "typing..." visible for at least ~1.5s so quick replies still feel natural
      const wait = 1500 - (Date.now() - typingStart);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      await sendPlatformText(customerPhone, reply);
      await sendPendingImages(customerPhone);
    }
    return;
  }

  // Find the store that owns this WhatsApp number
  const storedInfo = await prisma.businessInfo.findFirst({
    where: { whatsappPhoneNumberId: phoneNumberId },
  });

  if (!storedInfo) {
    // Unknown number: acknowledge (already 200) and log
    console.warn('[Webhook] Message for unknown phone number ID, ignored:', phoneNumberId);
    return;
  }

  // From here on, businessInfo.whatsappToken is the DECRYPTED token of the store that owns this number
  const businessInfo = { ...storedInfo, whatsappToken: getTenantToken(storedInfo) };
  const tenantId = businessInfo.tenantId;

  // Verify the Meta signature: META_APP_SECRET (our app), or a legacy per-store secret (manual setups)
  const validForStore =
    msg.sigOk ||
    (!!storedInfo.whatsappAppSecret &&
      verifyMetaWebhookSignature(msg.rawBody, msg.signature, storedInfo.whatsappAppSecret));
  if (!validForStore) {
    console.error('[Webhook] Invalid or missing Meta signature for phone number ID:', phoneNumberId);
    return;
  }

  // Run chat lookup + typing indicator in PARALLEL
  // sendTypingIndicator both marks as read (blue ticks) AND shows "typing..." to customer
  const [existingChat] = await Promise.all([
    prisma.whatsAppChat.findUnique({
      where: { tenantId_customerPhone: { tenantId, customerPhone } },
    }),
    businessInfo.whatsappToken
      ? sendTypingIndicator({ phoneNumberId, accessToken: businessInfo.whatsappToken, messageId: waMessageId }).catch(() => {})
      : Promise.resolve(),
  ]);

  // Create or update chat
  let chat;
  if (!existingChat) {
    chat = await prisma.whatsAppChat.create({
      data: {
        tenantId,
        customerPhone,
        customerName,
        lastMessage: messageContent,
        lastMessageAt: new Date(),
        unreadCount: 1,
      },
    });
  } else {
    chat = await prisma.whatsAppChat.update({
      where: { id: existingChat.id },
      data: {
        customerName: customerName || existingChat.customerName,
        lastMessage: messageContent,
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
      },
    });
  }

  // Save incoming message + get conversation state in PARALLEL
  const [, conversationState] = await Promise.all([
    prisma.whatsAppMessage.create({
      data: {
        tenantId,
        chatId: chat.id,
        waMessageId,
        sender: 'customer',
        senderPhone: customerPhone,
        content: messageContent,
        messageType: messageType as any,
        status: 'delivered',
      },
    }),
    getOrCreateConversationState(chat.id),
  ]);

  // Process with AI if enabled
  const aiSupportedTypes = ['text', 'interactive', 'audio', 'image'];
  if (
    !businessInfo.aiEnabled ||
    !businessInfo.openaiKey ||
    !aiSupportedTypes.includes(messageType)
  ) {
    return;
  }

  if (!businessInfo.whatsappToken) {
    return;
  }

  try {
    // Feature 6: Voice note — transcribe audio to text via Whisper
    if (messageType === 'audio' && mediaId) {
      const media = await downloadWhatsAppMedia({
        mediaId,
        accessToken: businessInfo.whatsappToken,
      });
      if (media) {
        const transcribed = await transcribeAudio({
          audioBuffer: media.buffer,
          mimeType: media.mimeType,
          openaiKey: businessInfo.openaiKey,
        });
        if (transcribed) {
          messageContent = transcribed;
        } else {
          await sendWhatsAppMessage({
            phoneNumberId,
            accessToken: businessInfo.whatsappToken,
            to: customerPhone,
            message: "Sorry, I couldn't understand your voice message. Could you please type your message instead?",
          });
          return;
        }
      } else {
        await sendWhatsAppMessage({
          phoneNumberId,
          accessToken: businessInfo.whatsappToken,
          to: customerPhone,
          message: "Sorry, I couldn't process your voice message. Could you please type your message instead?",
        });
        return;
      }
    }

    // Feature 7: Image — analyze with GPT-4o-mini Vision for product matching
    if (messageType === 'image' && mediaId) {
      const media = await downloadWhatsAppMedia({
        mediaId,
        accessToken: businessInfo.whatsappToken,
      });
      if (media) {
        const visionResult = await processImageWithAI({
          tenantId,
          imageBuffer: media.buffer,
          mimeType: media.mimeType,
          customerCaption: messageContent !== '[Image received]' ? messageContent : undefined,
          openaiKey: businessInfo.openaiKey,
        });
        if (visionResult) {
          // Feed vision analysis to AI as the message content
          messageContent = visionResult;
        }
      }
      // If media download failed, messageContent stays as "[Image received]" and AI will handle gracefully
    }

    // Only pass productId/quantity to AI when conversation is actively in progress (not idle)
    // This prevents stale product references from old conversations leaking into new ones
    const isActiveConversation = conversationState.step !== 'idle';

    // Fetch active cart context for AI (if cart exists)
    let cartSummary: string | undefined;
    let cartItemCount: number | undefined;
    if (conversationState.cartId || conversationState.step === 'shopping') {
      const activeCart = await getActiveCartForChat(chat.id);
      if (activeCart && activeCart.items.length > 0) {
        cartSummary = formatCartMessage(activeCart);
        cartItemCount = activeCart.items.length;
      }
    }

    const aiResult = await processMessageWithAI({
      tenantId,
      customerPhone,
      customerMessage: messageContent,
      openaiKey: businessInfo.openaiKey,
      conversationStep: conversationState.step,
      conversationProductId: isActiveConversation ? (conversationState.productId || undefined) : undefined,
      conversationQuantity: isActiveConversation ? (conversationState.quantity || undefined) : undefined,
      cartSummary,
      cartItemCount,
      businessInfo, // Pass pre-fetched data to avoid duplicate query
    });

    const skipAiReply =
      aiResult.action === 'collect_address' ||
      aiResult.action === 'add_to_cart' ||
      aiResult.action === 'remove_from_cart' ||
      aiResult.action === 'view_cart' ||
      aiResult.action === 'checkout';

    // Send AI reply + execute commerce flow
    if (!skipAiReply) {
      const sendResult = await sendWhatsAppMessage({
        phoneNumberId,
        accessToken: businessInfo.whatsappToken,
        to: customerPhone,
        message: aiResult.reply,
      });

      // Save AI reply + update chat in PARALLEL
      await Promise.all([
        prisma.whatsAppMessage.create({
          data: {
            tenantId,
            chatId: chat.id,
            waMessageId: sendResult.messageId,
            sender: 'ai',
            content: aiResult.reply,
            messageType: 'text',
            status: sendResult.success ? 'sent' : 'failed',
            isAiGenerated: true,
          },
        }),
        prisma.whatsAppChat.update({
          where: { id: chat.id },
          data: {
            lastMessage: aiResult.reply,
            lastMessageAt: new Date(),
          },
        }),
      ]);
    }

    // Execute commerce flow
    if (aiResult.action !== 'none') {
      await handleCommerceFlow({
        tenantId,
        chatId: chat.id,
        customerPhone,
        customerName,
        phoneNumberId,
        accessToken: businessInfo.whatsappToken,
        aiResult,
        razorpayKeyId: businessInfo.razorpayKeyId,
        razorpayKeySecret: businessInfo.razorpayKeySecret,
        paymentGateway: businessInfo.paymentGateway,
        cashfreeAppId: businessInfo.cashfreeAppId,
        cashfreeSecretKey: businessInfo.cashfreeSecretKey,
      });
    }
  } catch (error: any) {
    console.error('[Webhook] AI processing error:', error?.message || error, error?.stack);
    // Send fallback reply so customer doesn't get silence
    try {
      await sendWhatsAppMessage({
        phoneNumberId,
        accessToken: businessInfo.whatsappToken,
        to: customerPhone,
        message: 'Sorry, I\'m having a brief issue. Please try again in a moment.',
      });
    } catch {
      console.error('[Webhook] Fallback reply also failed');
    }
  }
}

async function handleStatusUpdate(status: { id: string; status: string; timestamp: string }) {
  try {
    const waMessageId = status.id;
    const newStatus = status.status;
    if (!waMessageId || !['sent', 'delivered', 'read', 'failed'].includes(newStatus)) return;
    await prisma.whatsAppMessage.updateMany({
      where: { waMessageId },
      data: { status: newStatus as any },
    });
  } catch (error) {
    console.error('[Webhook] Status update error:', error);
  }
}

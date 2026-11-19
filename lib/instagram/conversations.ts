// Instagram DM conversations: list, thread, and send a reply (24-hour rule enforced on the server).
// Outgoing messages are stored in instagram_messages with raw.direction = 'out' (no schema change needed);
// sender_id always holds the CUSTOMER's id, so a conversation = one sender_id.
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { decryptSecret } from '@/lib/crypto/secrets';
import { GraphError, sendInstagramText } from './graph';

export const WINDOW_MS = 24 * 60 * 60 * 1000;
const isOut = (raw: unknown) => !!raw && typeof raw === 'object' && (raw as { direction?: string }).direction === 'out';

export interface ConversationSummary {
  senderId: string; igAccountId: string; lastText: string | null; lastAt: string; lastDirection: 'in' | 'out';
  lastInboundAt: string | null; windowOpen: boolean; windowExpiresAt: string | null; messageCount: number;
  /** Filled in best-effort by attachProfiles(). */
  username?: string; name?: string;
}
export interface ThreadMessage { mid: string; direction: 'in' | 'out'; text: string | null; at: string }

const windowInfo = (lastInbound: Date | null) => {
  const exp = lastInbound ? new Date(lastInbound.getTime() + WINDOW_MS) : null;
  return { windowOpen: !!exp && exp.getTime() > Date.now(), windowExpiresAt: exp ? exp.toISOString() : null };
};

/** Conversations grouped by sender, newest first. */
export async function listConversations(tenantId: string): Promise<ConversationSummary[]> {
  const rows = await prisma.instagramMessage.findMany({
    where: { tenantId }, orderBy: { receivedAt: 'desc' }, take: 1000,
    select: { senderId: true, igAccountId: true, text: true, raw: true, receivedAt: true },
  });
  const map = new Map<string, ConversationSummary & { _in: Date | null }>();
  for (const r of rows) {
    const out = isOut(r.raw);
    let c = map.get(r.senderId);
    if (!c) {
      c = { senderId: r.senderId, igAccountId: r.igAccountId, lastText: r.text, lastAt: r.receivedAt.toISOString(), lastDirection: out ? 'out' : 'in',
        lastInboundAt: null, windowOpen: false, windowExpiresAt: null, messageCount: 0, _in: null };
      map.set(r.senderId, c);
    }
    c.messageCount++;
    if (!out && !c._in) c._in = r.receivedAt; // rows are newest-first, so the first inbound is the latest
  }
  return Array.from(map.values()).map(({ _in, ...c }) => ({ ...c, lastInboundAt: _in ? _in.toISOString() : null, ...windowInfo(_in) }));
}

/** Messages of one conversation, oldest first (latest 200). */
export async function getThread(tenantId: string, senderId: string): Promise<{ messages: ThreadMessage[]; windowOpen: boolean; windowExpiresAt: string | null }> {
  const rows = await prisma.instagramMessage.findMany({
    where: { tenantId, senderId }, orderBy: { receivedAt: 'desc' }, take: 200,
    select: { mid: true, text: true, raw: true, receivedAt: true },
  });
  const lastIn = rows.find((r) => !isOut(r.raw))?.receivedAt ?? null;
  const messages = rows.reverse().map((r) => ({ mid: r.mid, direction: (isOut(r.raw) ? 'out' : 'in') as 'in' | 'out', text: r.text, at: r.receivedAt.toISOString() }));
  return { messages, ...windowInfo(lastIn) };
}

export type SendResult =
  | { ok: true; metaResponse: unknown; mid: string }
  | { ok: false; code: 'BAD_INPUT' | 'NO_CONVERSATION' | 'WINDOW_CLOSED' | 'NOT_CONNECTED' | 'META_ERROR'; message: string; lastInboundAt?: string; meta?: { httpStatus: number; code?: number; subcode?: number; message: string } };

export async function sendReply(tenantId: string, senderId: string, textRaw: string): Promise<SendResult> {
  const text = String(textRaw ?? '').trim();
  if (!/^\d{5,30}$/.test(senderId) || text.length < 1 || text.length > 1000) return { ok: false, code: 'BAD_INPUT', message: 'Write a message of 1 to 1000 characters.' };

  // Only people who have messaged this tenant can be replied to (blocks sending to arbitrary ids).
  const recent = await prisma.instagramMessage.findMany({
    where: { tenantId, senderId }, orderBy: { receivedAt: 'desc' }, take: 50, select: { igAccountId: true, raw: true, receivedAt: true },
  });
  const lastIn = recent.find((r) => !isOut(r.raw));
  if (!lastIn) return { ok: false, code: 'NO_CONVERSATION', message: 'This customer has not messaged you, so you cannot message them.' };

  // Instagram only allows replies within 24 hours of the customer's last message.
  if (Date.now() - lastIn.receivedAt.getTime() > WINDOW_MS) {
    return { ok: false, code: 'WINDOW_CLOSED', lastInboundAt: lastIn.receivedAt.toISOString(),
      message: 'The 24-hour reply window has closed. You can reply again when this customer messages you.' };
  }

  const acct = await prisma.instagramAccount.findFirst({ where: { igAccountId: lastIn.igAccountId, tenantId, status: 'active' }, select: { tokenEnc: true } });
  const token = acct ? decryptSecret(acct.tokenEnc) : null;
  if (!acct || !token) return { ok: false, code: 'NOT_CONNECTED', message: 'Instagram is not connected for this business. Reconnect it and try again.' };

  try {
    const res = await sendInstagramText(lastIn.igAccountId, token, senderId, text) as { message_id?: string; recipient_id?: string };
    const mid = res.message_id || `out-${crypto.randomUUID()}`;
    await prisma.instagramMessage.createMany({
      data: [{ mid, tenantId, igAccountId: lastIn.igAccountId, senderId, text, raw: { direction: 'out', response: res } }], skipDuplicates: true,
    });
    return { ok: true, metaResponse: res, mid };
  } catch (e) {
    const g = e as GraphError;
    console.error('[Instagram] send failed', { status: g.status, code: g.code, subcode: g.subcode, message: g.message });
    return { ok: false, code: 'META_ERROR', message: 'Instagram did not accept the message.', meta: { httpStatus: g.status, code: g.code, subcode: g.subcode, message: g.message } };
  }
}

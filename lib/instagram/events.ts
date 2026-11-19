import { prisma } from '@/lib/db/prisma';

interface Entry { id?: string; messaging?: any[]; changes?: { field?: string; value?: unknown }[] }

/** Routes each webhook entry to its tenant by entry.id, stores DMs (de-duplicated by message id). */
export async function handleInstagramEvents(payload: { entry?: Entry[] }): Promise<void> {
  for (const entry of payload.entry || []) {
    if (!entry.id) continue;
    const acct = await prisma.instagramAccount.findFirst({ where: { igAccountId: entry.id, status: 'active' }, select: { tenantId: true } });
    if (!acct) continue; // not one of ours, or disconnected

    for (const m of entry.messaging || []) {
      if (!m?.message || m.message.is_echo || !m.message.mid || !m.sender?.id) continue; // skip our own sent messages
      await prisma.instagramMessage.createMany({
        data: [{ mid: m.message.mid, tenantId: acct.tenantId, igAccountId: entry.id, senderId: String(m.sender.id), text: m.message.text ?? null, raw: m }],
        skipDuplicates: true,
      });
      // Hook for later: AI reply / Inbox. Not wired yet (no auto-replies are sent).
    }
    for (const c of entry.changes || []) {
      if (c.field === 'comments') console.log('[Instagram] comment event received for tenant', acct.tenantId); // handled later; content not stored
    }
  }
}

import { prisma } from '@/lib/db/prisma';
import { decryptSecret } from '@/lib/crypto/secrets';
import { graph } from './graph';

/**
 * Disconnect Instagram for a tenant: stop webhook delivery (best effort), wipe the stored token,
 * mark the account disconnected, and optionally delete the stored messages.
 */
export async function disconnectInstagram(tenantId: string, deleteMessages: boolean) {
  const accounts = await prisma.instagramAccount.findMany({ where: { tenantId, status: 'active' }, select: { igAccountId: true, tokenEnc: true } });
  if (accounts.length === 0) return { disconnected: 0, messagesDeleted: 0 };

  for (const a of accounts) {
    const token = decryptSecret(a.tokenEnc);
    if (!token) continue;
    try { await graph(`${a.igAccountId}/subscribed_apps`, { method: 'DELETE', token }); }
    catch (e) { console.warn('[Instagram] unsubscribe on disconnect failed (continuing)', (e as Error).message); }
  }
  await prisma.instagramAccount.updateMany({ where: { tenantId, status: 'active' }, data: { status: 'disconnected', tokenEnc: '' } });
  const messagesDeleted = deleteMessages ? (await prisma.instagramMessage.deleteMany({ where: { tenantId } })).count : 0;
  return { disconnected: accounts.length, messagesDeleted };
}

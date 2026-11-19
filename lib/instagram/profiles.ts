// Best-effort lookup of a customer's Instagram username/name from their Instagram-scoped id.
// Cached in memory (per server instance); failures are cached briefly so we never hammer Meta.
import { prisma } from '@/lib/db/prisma';
import { decryptSecret } from '@/lib/crypto/secrets';
import { graph, GraphError } from './graph';
import type { ConversationSummary } from './conversations';

interface Prof { username?: string; name?: string; at: number; failed?: boolean }
const cache = new Map<string, Prof>();
const OK_TTL = 6 * 3600 * 1000;
const FAIL_TTL = 30 * 60 * 1000;
const MAX_PER_CALL = 8;
let warned = false;

export async function attachProfiles(tenantId: string, convs: ConversationSummary[]): Promise<void> {
  const fresh = (id: string) => { const p = cache.get(id); return p && Date.now() - p.at < (p.failed ? FAIL_TTL : OK_TTL) ? p : null; };
  const unknown = convs.filter((c) => !fresh(c.senderId)).slice(0, MAX_PER_CALL);

  if (unknown.length > 0) {
    const acct = await prisma.instagramAccount.findFirst({ where: { igAccountId: unknown[0].igAccountId, tenantId, status: 'active' }, select: { tokenEnc: true } });
    const token = acct ? decryptSecret(acct.tokenEnc) : null;
    if (token) {
      await Promise.allSettled(unknown.map(async (c) => {
        try {
          const r = await graph<{ username?: string; name?: string }>(c.senderId, { token, params: { fields: 'name,username' } });
          cache.set(c.senderId, { username: r.username, name: r.name, at: Date.now() });
        } catch (e) {
          cache.set(c.senderId, { at: Date.now(), failed: true });
          if (!warned) { warned = true; const g = e as GraphError; console.warn('[Instagram] profile lookup failed (showing id instead)', { status: g.status, code: g.code, subcode: g.subcode, message: g.message }); }
        }
      }));
    }
  }
  for (const c of convs) { const p = fresh(c.senderId); if (p && !p.failed) { c.username = p.username; c.name = p.name; } }
}

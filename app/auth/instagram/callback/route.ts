// Instagram OAuth redirect URI: https://www.satyasell.com/auth/instagram/callback
// Verifies the signed state AND that the logged-in client is the tenant who started the flow,
// exchanges the code, finds the granted Instagram accounts, stores the token encrypted and
// subscribes each account to webhooks.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { encryptSecret } from '@/lib/crypto/secrets';
import { getIgConfig } from '@/lib/instagram/config';
import { graph, GraphError } from '@/lib/instagram/graph';
import { readState } from '@/lib/instagram/state';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const back = (request: NextRequest, status: string) => NextResponse.redirect(new URL(`/auth/instagram/result?status=${status}`, request.url));

export async function GET(request: NextRequest) {
  const conf = getIgConfig();
  if (!conf.ok) { console.error('[Instagram] callback: not configured, missing', conf.missing.join(', ')); return back(request, 'unavailable'); }
  const { cfg } = conf;
  const p = request.nextUrl.searchParams;

  if (p.get('error') || p.get('error_reason')) return back(request, 'denied');

  const tenantId = readState(p.get('state'), cfg.stateSecret);
  if (!tenantId) return back(request, 'invalid');

  // The person finishing the login must be the client who started it (blocks login CSRF / account takeover).
  try { if ((await getTenantId(request)) !== tenantId) return back(request, 'invalid'); } catch { return NextResponse.redirect(new URL('/client/login', request.url)); }

  const code = p.get('code');
  if (!code) return back(request, 'invalid');

  try {
    const tok = await graph<{ access_token: string }>('oauth/access_token', {
      params: { client_id: cfg.appId, client_secret: cfg.appSecret, redirect_uri: cfg.redirectUri, code },
    });
    const token = tok.access_token;

    const accounts = await graph<{ data?: { id: string; username?: string }[] }>('me/assigned_instagram_accounts', { token, params: { fields: 'id,username' } });
    if (!accounts.data?.length) return back(request, 'noaccount');

    let metaUserId: string | null = null;
    try { metaUserId = (await graph<{ id: string }>('me', { token, params: { fields: 'id' } })).id; } catch { /* best effort */ }

    const tokenEnc = encryptSecret(token);
    for (const ig of accounts.data) {
      const existing = await prisma.instagramAccount.findUnique({ where: { igAccountId: ig.id }, select: { tenantId: true, status: true } });
      if (existing && existing.status === 'active' && existing.tenantId !== tenantId) {
        console.warn('[Instagram] account already connected to another tenant, refusing', ig.id);
        return back(request, 'taken');
      }
      await prisma.instagramAccount.upsert({
        where: { igAccountId: ig.id },
        create: { igAccountId: ig.id, tenantId, username: ig.username ?? null, metaUserId, tokenEnc, status: 'active' },
        update: { tenantId, username: ig.username ?? null, metaUserId, tokenEnc, status: 'active' },
      });
      try {
        await graph(`${ig.id}/subscribed_apps`, { method: 'POST', token, params: { subscribed_fields: 'messages,messaging_postbacks,messaging_seen,comments' } });
      } catch (e) {
        const g = e as GraphError;
        console.warn('[Instagram] webhook subscribe failed', { ig: ig.id, status: g.status, code: g.code, subcode: g.subcode, message: g.message });
      }
    }
    return back(request, 'connected');
  } catch (e) {
    const g = e as GraphError;
    console.error('[Instagram] callback error', { status: g.status, code: g.code, subcode: g.subcode, message: g.message });
    return back(request, 'error');
  }
}

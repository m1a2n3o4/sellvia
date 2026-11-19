// "Connect Instagram" entry point. The logged-in client (existing client_token cookie) is sent to Meta's
// Unified login dialog with a signed, expiring state that ties the result to their tenant.
import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/middleware';
import { getIgConfig } from '@/lib/instagram/config';
import { makeState } from '@/lib/instagram/state';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const conf = getIgConfig();
  if (!conf.ok) {
    console.error('[Instagram] start: not configured, missing', conf.missing.join(', '));
    return NextResponse.redirect(new URL('/auth/instagram/result?status=unavailable', request.url));
  }
  let tenantId: string;
  try { tenantId = await getTenantId(request); } catch { return NextResponse.redirect(new URL('/client/login', request.url)); }

  const { cfg } = conf;
  const url = new URL('https://www.facebook.com/dialog/oauth');
  url.search = new URLSearchParams({
    client_id: cfg.appId,
    config_id: cfg.configId,
    display: 'popup',
    override_default_response_type: 'true',
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    state: makeState(tenantId, cfg.stateSecret),
  }).toString();
  return NextResponse.redirect(url.toString());
}

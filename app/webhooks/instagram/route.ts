// Instagram webhooks: https://www.satyasell.com/webhooks/instagram
import { NextRequest, NextResponse } from 'next/server';
import { getIgConfig, getVerifyToken } from '@/lib/instagram/config';
import { verifyWebhookSignature } from '@/lib/instagram/state';
import { handleInstagramEvents } from '@/lib/instagram/events';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Verification handshake
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const token = getVerifyToken();
  const given = (p.get('hub.verify_token') || '').trim();
  if (token && p.get('hub.mode') === 'subscribe' && given === token) {
    return new NextResponse(p.get('hub.challenge') || '', { status: 200, headers: { 'content-type': 'text/plain' } });
  }
  // Diagnostics only (never the token itself): why did verification fail?
  console.warn('[Instagram] webhook verify rejected', { mode: p.get('hub.mode'), tokenConfigured: !!token, configuredLength: token.length, givenLength: given.length });
  return new NextResponse('Forbidden', { status: 403 });
}

// Events. The signature is checked over the raw body, so read text() before parsing.
export async function POST(request: NextRequest) {
  const conf = getIgConfig();
  const secret = conf.ok ? conf.cfg.appSecret : (process.env.IG_APP_SECRET || '');
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get('x-hub-signature-256'), secret)) {
    console.warn('[Instagram] webhook POST rejected: bad or missing signature', { hasHeader: !!request.headers.get('x-hub-signature-256'), secretConfigured: !!secret, bodyLength: raw.length });
    return new NextResponse('Invalid signature', { status: 401 });
  }
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return new NextResponse('Bad request', { status: 400 }); }
  console.log('[Instagram] webhook POST received', { object: payload?.object, entries: payload?.entry?.length ?? 0 });
  try {
    await handleInstagramEvents(payload);
  } catch (e) {
    console.error('[Instagram] webhook processing failed', (e as Error).message);
    return new NextResponse('Error', { status: 500 }); // Meta retries; duplicates are ignored by message id
  }
  return new NextResponse('OK', { status: 200 });
}

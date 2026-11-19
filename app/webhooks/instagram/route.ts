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
  if (token && p.get('hub.mode') === 'subscribe' && p.get('hub.verify_token') === token) {
    return new NextResponse(p.get('hub.challenge') || '', { status: 200, headers: { 'content-type': 'text/plain' } });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// Events. The signature is checked over the raw body, so read text() before parsing.
export async function POST(request: NextRequest) {
  const conf = getIgConfig();
  const secret = conf.ok ? conf.cfg.appSecret : (process.env.IG_APP_SECRET || process.env.META_APP_SECRET || '');
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get('x-hub-signature-256'), secret)) {
    return new NextResponse('Invalid signature', { status: 401 });
  }
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return new NextResponse('Bad request', { status: 400 }); }
  try {
    await handleInstagramEvents(payload);
  } catch (e) {
    console.error('[Instagram] webhook processing failed', (e as Error).message);
    return new NextResponse('Error', { status: 500 }); // Meta retries; duplicates are ignored by message id
  }
  return new NextResponse('OK', { status: 200 });
}

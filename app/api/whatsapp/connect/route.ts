import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { encryptSecret, decryptSecret } from '@/lib/crypto/secrets';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const GRAPH = 'https://graph.facebook.com/v21.0';
const ID_RE = /^\d{5,25}$/;

interface GraphError {
  message?: string;
  code?: number;
  error_subcode?: number;
  type?: string;
}

/** Calls the Graph API. Never logs tokens; logs Meta error codes only. */
async function graph<T = any>(
  label: string,
  path: string,
  opts: { token?: string; method?: 'GET' | 'POST'; form?: Record<string, string>; json?: unknown } = {}
): Promise<{ ok: boolean; data: T & { error?: GraphError }; status: number }> {
  const headers: Record<string, string> = {};
  let body: string | undefined;
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(opts.form).toString();
  } else if (opts.json) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  }
  const res = await fetch(`${GRAPH}${path}`, { method: opts.method || 'GET', headers, body });
  const data = (await res.json().catch(() => ({}))) as T & { error?: GraphError };
  if (!res.ok || data.error) {
    console.error(`[WhatsApp Connect] ${label} failed:`, {
      status: res.status,
      code: data.error?.code,
      subcode: data.error?.error_subcode,
      type: data.error?.type,
      message: data.error?.message,
    });
    return { ok: false, data, status: res.status };
  }
  return { ok: true, data, status: res.status };
}

function fail(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * POST /api/whatsapp/connect
 * Body: { code, phone_number_id, waba_id, business_id }
 * The tenant always comes from the session, never from the body.
 * Idempotent: reconnecting the same number updates the existing row.
 */
export async function POST(request: NextRequest) {
  let tenantId: string;
  try {
    tenantId = await getTenantId(request);
  } catch {
    return fail(401, 'Please log in again.');
  }

  try {
    const body = await request.json().catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code : '';
    const phoneNumberId = String(body.phone_number_id ?? '');
    const wabaId = String(body.waba_id ?? '');
    const businessId = body.business_id ? String(body.business_id) : null;

    if (!ID_RE.test(phoneNumberId) || !ID_RE.test(wabaId) || (businessId && !ID_RE.test(businessId))) {
      return fail(400, 'The WhatsApp signup result was incomplete. Please try connecting again.');
    }

    // Dev-only mock (never in production): lets the save path be tested without a real Meta popup
    const mock =
      body.mock === true && process.env.WHATSAPP_CONNECT_MOCK === '1' && process.env.VERCEL_ENV !== 'production';
    if (!mock && !code) return fail(400, 'Missing authorization code from Meta. Please try connecting again.');

    // A number can belong to only one tenant
    const owner = await prisma.businessInfo.findFirst({
      where: { whatsappPhoneNumberId: phoneNumberId, NOT: { tenantId } },
      select: { tenantId: true },
    });
    if (owner) return fail(409, 'This WhatsApp number is already connected to another SatyaSell account.');

    const existing = await prisma.businessInfo.findUnique({ where: { tenantId } });

    let token: string;
    let expiresAt: Date | null = null;
    let displayPhone: string | null = null;
    let verifiedName: string | null = null;
    let numberStatus: string | null = null;
    let registered = false;
    let registerNote: string | null = null;

    // PIN: reuse the stored one for the same number (reconnect), otherwise a fresh random 6-digit PIN
    const sameNumber = existing?.whatsappPhoneNumberId === phoneNumberId;
    const storedPin = sameNumber ? decryptSecret(existing?.whatsappRegisterPin) : null;
    const pin = storedPin || String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

    if (mock) {
      token = 'MOCK_TOKEN_DEV_ONLY';
      displayPhone = '+91 00000 00000';
      verifiedName = 'Mock Business';
      numberStatus = 'CONNECTED';
    } else {
      const appId = process.env.NEXT_PUBLIC_META_APP_ID;
      const appSecret = process.env.META_APP_SECRET;
      if (!appId || !appSecret) return fail(500, 'WhatsApp connection is not configured on the server.');

      // a) code -> business token
      const tok = await graph<{ access_token?: string; expires_in?: number }>('token exchange', '/oauth/access_token', {
        method: 'POST',
        form: { client_id: appId, client_secret: appSecret, code },
      });
      if (!tok.ok || !tok.data.access_token) {
        return fail(400, 'Meta did not accept the authorization. Please close the popup and try connecting again.');
      }
      token = tok.data.access_token;
      if (tok.data.expires_in) expiresAt = new Date(Date.now() + tok.data.expires_in * 1000);

      // Prove the token really has access to this WABA + number (the ids come from the browser)
      const phones = await graph<{ data?: { id: string; display_phone_number?: string; verified_name?: string; status?: string; is_on_biz_app?: boolean }[] }>(
        'list phone numbers',
        `/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,status,is_on_biz_app,platform_type`,
        { token }
      );
      const phone = phones.data.data?.find((p) => p.id === phoneNumberId);
      if (!phones.ok || !phone) {
        return fail(400, 'We could not find that WhatsApp number on the account you selected. Please try again.');
      }
      displayPhone = phone.display_phone_number || null;
      verifiedName = phone.verified_name || null;
      numberStatus = phone.status || null;

      // b) subscribe our app to the seller's WhatsApp Business Account (needed to receive webhooks)
      const sub = await graph('subscribe app', `/${wabaId}/subscribed_apps`, { token, method: 'POST' });
      if (!sub.ok) {
        return fail(502, 'Connected to Meta, but we could not subscribe to your WhatsApp messages. Please try again in a minute.');
      }

      // c) register the number, unless already registered or running alongside the WhatsApp Business app (coexistence)
      if (phone.is_on_biz_app) {
        registerNote = 'Number is used with the WhatsApp Business app (coexistence); registration skipped.';
      } else if (phone.status === 'CONNECTED') {
        registerNote = 'Number already registered; registration skipped.';
      } else {
        const reg = await graph('register number', `/${phoneNumberId}/register`, {
          token,
          method: 'POST',
          json: { messaging_product: 'whatsapp', pin },
        });
        if (reg.ok) {
          registered = true;
        } else {
          // "already registered"-type errors are fine if the number is now connected
          const now = await graph<{ status?: string }>('re-check number', `/${phoneNumberId}?fields=status`, { token });
          if (now.ok && now.data.status === 'CONNECTED') {
            numberStatus = 'CONNECTED';
            registerNote = 'Number was already registered.';
          } else {
            return fail(502, 'Your number was linked but WhatsApp could not activate it yet. Please try again, or contact support.');
          }
        }
      }
    }

    // d) save (encrypted), idempotent on tenant
    let encToken: string;
    let encPin: string;
    try {
      encToken = encryptSecret(token);
      encPin = encryptSecret(pin);
    } catch (e) {
      console.error('[WhatsApp Connect] Encryption unavailable:', e instanceof Error ? e.message : 'error');
      return fail(500, 'Server security configuration is incomplete. Please contact support.');
    }

    const data = {
      whatsappPhoneNumberId: phoneNumberId,
      whatsappBusinessId: wabaId,
      whatsappBusinessPortfolioId: businessId,
      whatsappDisplayPhone: displayPhone,
      whatsappToken: encToken,
      whatsappTokenExpiresAt: expiresAt,
      whatsappRegisterPin: encPin,
      whatsappStatus: 'connected',
      whatsappConnectedAt: new Date(),
      whatsappAppSecret: null, // verified with META_APP_SECRET; no per-tenant copy needed
    };
    await prisma.businessInfo.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data,
    });

    return NextResponse.json({
      success: true,
      phoneNumber: displayPhone,
      verifiedName,
      wabaId,
      phoneNumberId,
      status: 'connected',
      registered,
      note: registerNote,
    });
  } catch (error) {
    console.error('[WhatsApp Connect] Unexpected error:', error instanceof Error ? error.message : 'error');
    return fail(500, 'Something went wrong while connecting WhatsApp. Please try again.');
  }
}

/** DELETE /api/whatsapp/connect : disconnect WhatsApp for the logged-in seller. */
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    await prisma.businessInfo.update({
      where: { tenantId },
      data: {
        whatsappToken: null,
        whatsappPhoneNumberId: null,
        whatsappBusinessId: null,
        whatsappBusinessPortfolioId: null,
        whatsappDisplayPhone: null,
        whatsappTokenExpiresAt: null,
        whatsappStatus: null,
        whatsappConnectedAt: null,
        whatsappRegisterPin: null,
        whatsappAppSecret: null,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Authentication') || message.includes('token')) return fail(401, 'Please log in again.');
    return fail(500, 'Could not disconnect WhatsApp.');
  }
}

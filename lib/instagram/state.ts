import crypto from 'crypto';

const TTL_MS = 10 * 60 * 1000;
const hmac = (secret: string, data: string) => crypto.createHmac('sha256', secret).update(data).digest('hex');

/** Signed, expiring OAuth state: tenantId.timestamp.signature. Binds the login to a tenant (CSRF protection). */
export function makeState(tenantId: string, secret: string): string {
  const payload = `${tenantId}.${Date.now()}`;
  return `${payload}.${hmac(secret, payload)}`;
}

/** Returns the tenant id if the state is genuine and fresh, otherwise null. */
export function readState(state: string | null, secret: string): string | null {
  const [tenantId, ts, sig] = String(state || '').split('.');
  if (!tenantId || !ts || !sig) return null;
  const expected = hmac(secret, `${tenantId}.${ts}`);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const age = Date.now() - Number(ts);
  return age >= 0 && age <= TTL_MS ? tenantId : null;
}

/** Verifies Meta's X-Hub-Signature-256 over the RAW body. */
export function verifyWebhookSignature(raw: string, header: string | null, appSecret: string): boolean {
  if (!header || !appSecret) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(raw, 'utf8').digest('hex');
  return header.length === expected.length && crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

/** Parses and verifies a Meta signed_request (deauthorize / data deletion). */
export function parseSignedRequest(signed: string | null, appSecret: string): { user_id?: string } | null {
  const [sig, payload] = String(signed || '').split('.');
  if (!sig || !payload || !appSecret) return null;
  const expected = crypto.createHmac('sha256', appSecret).update(payload).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { return null; }
}

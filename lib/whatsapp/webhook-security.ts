import crypto from 'crypto';

/**
 * Verify Meta WhatsApp webhook signature (X-Hub-Signature-256 header).
 * Uses HMAC-SHA256 with the App Secret.
 */
export function verifyMetaWebhookSignature(
  rawBody: string,
  signature: string | null,
  appSecret: string
): boolean {
  if (!signature || !appSecret) {
    return false;
  }

  const expectedSignature =
    'sha256=' +
    crypto
      .createHmac('sha256', appSecret)
      .update(rawBody, 'utf-8')
      .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

import crypto from 'crypto';

/**
 * AES-256-GCM encryption for secrets stored in the database (WhatsApp tokens, register PINs).
 * Key: ENCRYPTION_KEY env var = 32 random bytes, base64 (generate: `openssl rand -base64 32`).
 * Format: enc:v1:<iv>:<tag>:<ciphertext> (all base64). Values without the prefix are treated as
 * legacy plaintext so tokens saved before encryption keep working.
 */
const PREFIX = 'enc:v1:';

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error('ENCRYPTION_KEY is not configured');
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes, base64 encoded');
  return key;
}

export function isEncrypted(value: string | null | undefined): boolean {
  return !!value && value.startsWith(PREFIX);
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`;
}

/** Decrypts an enc:v1 value; passes legacy plaintext through unchanged. Returns null if unreadable. */
export function decryptSecret(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (!isEncrypted(stored)) return stored;
  try {
    const [iv, tag, ct] = stored.slice(PREFIX.length).split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(ct, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    console.error('[Crypto] Could not decrypt a stored secret (wrong ENCRYPTION_KEY or corrupted value)');
    return null;
  }
}

/** What the UI receives instead of a secret. */
export const SECRET_MASK = '••••••••••••••••';

export function maskSecret(value: string | null | undefined): string {
  return value ? SECRET_MASK : '';
}

/** True if a value coming back from the UI is just the mask (i.e. the user did not change it). */
export function isMasked(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith('••');
}

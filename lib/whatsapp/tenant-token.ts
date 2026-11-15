import { decryptSecret } from '@/lib/crypto/secrets';

/** Decrypted WhatsApp access token for a BusinessInfo row (handles legacy plaintext tokens). */
export function getTenantToken(info: { whatsappToken?: string | null } | null | undefined): string | null {
  return decryptSecret(info?.whatsappToken);
}

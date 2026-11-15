import { prisma } from '@/lib/db/prisma';
import { resolveAgentTenantId } from './demo-ai';
import { isPlatformWhatsAppConfigured, sendPlatformText } from './platform';
import { sendWhatsAppMessage } from './client';
import { getTenantToken } from './tenant-token';

/**
 * The business served through the shared SatyaSell number has no WhatsApp
 * credentials of its own. These helpers let its dashboard (Chats) show the
 * shared-number conversations and send replies/confirmations through the
 * platform number.
 */

/** Record a customer message + the reply sent on the shared number in the agent tenant's Chats. */
export async function mirrorToAgentChat(input: {
  tenantId: string;
  phone: string;
  customerName?: string;
  customerText: string;
  replyText: string;
  replyIsAi?: boolean;
}) {
  const { tenantId, replyIsAi = true } = input;
  const phone = input.phone.replace(/\D/g, '');
  const now = new Date();
  const chat = await prisma.whatsAppChat.upsert({
    where: { tenantId_customerPhone: { tenantId, customerPhone: phone } },
    create: {
      tenantId,
      customerPhone: phone,
      customerName: input.customerName || null,
      lastMessage: input.replyText.slice(0, 200),
      lastMessageAt: now,
      unreadCount: 1,
    },
    update: {
      ...(input.customerName ? { customerName: input.customerName } : {}),
      lastMessage: input.replyText.slice(0, 200),
      lastMessageAt: now,
      unreadCount: { increment: 1 },
    },
  });
  await prisma.whatsAppMessage.create({
    data: { tenantId, chatId: chat.id, sender: 'customer', senderPhone: phone, content: input.customerText, messageType: 'text', status: 'delivered' },
  });
  await prisma.whatsAppMessage.create({
    data: { tenantId, chatId: chat.id, sender: replyIsAi ? 'ai' : 'business', content: input.replyText, messageType: 'text', status: 'sent', isAiGenerated: replyIsAi },
  });
}

/**
 * Returns a send function for this tenant: its own WhatsApp number if connected,
 * otherwise the shared SatyaSell number when this tenant is the one it answers for.
 */
export async function resolveTenantSender(
  tenantId: string,
  info: { whatsappToken?: string | null; whatsappPhoneNumberId?: string | null } | null
): Promise<((to: string, message: string) => Promise<{ success: boolean; messageId?: string; error?: string }>) | null> {
  const ownToken = getTenantToken(info);
  if (ownToken && info?.whatsappPhoneNumberId) {
    const phoneNumberId = info.whatsappPhoneNumberId;
    return (to, message) => sendWhatsAppMessage({ phoneNumberId, accessToken: ownToken, to, message });
  }
  if (isPlatformWhatsAppConfigured() && (await resolveAgentTenantId()) === tenantId) {
    return async (to, message) => sendPlatformText(to, message);
  }
  return null;
}

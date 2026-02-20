import { prisma } from '@/lib/db/prisma';
import { sendSms } from './fast2sms';
import { newOrder } from './templates';

interface OrderNotificationInput {
  tenantId: string;
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
}

export async function sendOrderNotificationSms(input: OrderNotificationInput): Promise<void> {
  const { tenantId, orderNumber, customerName, total, itemCount } = input;

  // Try ownerPhone first, then fall back to tenant's registered mobile
  const [businessInfo, tenant] = await Promise.all([
    prisma.businessInfo.findUnique({ where: { tenantId }, select: { ownerPhone: true } }),
    prisma.tenant.findUnique({ where: { id: tenantId }, select: { mobile: true } }),
  ]);

  const phone = businessInfo?.ownerPhone || tenant?.mobile;

  if (!phone) {
    console.log('[SMS] No phone configured for tenant', tenantId);
    return;
  }

  const message = newOrder(orderNumber, customerName, total, itemCount);
  await sendSms({ mobile: phone, message });
}

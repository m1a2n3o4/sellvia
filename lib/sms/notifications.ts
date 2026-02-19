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

  const businessInfo = await prisma.businessInfo.findUnique({
    where: { tenantId },
    select: { ownerPhone: true },
  });

  if (!businessInfo?.ownerPhone) {
    console.log('[SMS] No ownerPhone configured for tenant', tenantId);
    return;
  }

  const message = newOrder(orderNumber, customerName, total, itemCount);
  await sendSms({ mobile: businessInfo.ownerPhone, message });
}

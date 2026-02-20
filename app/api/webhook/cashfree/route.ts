import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyCashfreeWebhookSignature } from '@/lib/whatsapp/cashfree';
import { handlePaymentComplete } from '@/lib/whatsapp/commerce';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-cashfree-signature');
    const timestamp = request.headers.get('x-cashfree-timestamp');

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // We only handle PAYMENT_LINK events with link_status PAID
    const eventType = event.type;
    if (eventType !== 'PAYMENT_LINK_EVENT') {
      return NextResponse.json({ status: 'ignored' });
    }

    const linkData = event.data?.link_payment || event.data;
    const linkId = linkData?.link_id || event.data?.payment_link?.link_id;
    const linkStatus = linkData?.link_status || event.data?.payment_link?.link_status;

    if (!linkId || linkStatus !== 'PAID') {
      return NextResponse.json({ status: 'ok' });
    }

    const paymentId =
      linkData?.cf_payment_id?.toString() ||
      linkData?.payment?.cf_payment_id?.toString() ||
      null;

    // Find order by Cashfree link ID
    const order = await prisma.order.findFirst({
      where: { cashfreeLinkId: linkId },
    });

    if (!order) {
      console.error('[Cashfree Webhook] No order found for link:', linkId);
      return NextResponse.json({ status: 'ok' });
    }

    // Get business info to verify signature
    const businessInfo = await prisma.businessInfo.findUnique({
      where: { tenantId: order.tenantId },
    });

    // Verify webhook signature if we have the secret
    if (businessInfo?.cashfreeSecretKey && signature) {
      const isValid = verifyCashfreeWebhookSignature(
        timestamp,
        rawBody,
        signature,
        businessInfo.cashfreeSecretKey
      );

      if (!isValid) {
        console.error('[Cashfree Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Update order with Cashfree payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: { cashfreePaymentId: paymentId },
    });

    // Handle payment completion (updates order, sends WhatsApp confirmation, resets state)
    await handlePaymentComplete(order.id);

    console.log(`[Cashfree Webhook] Payment completed for order ${order.orderNumber}`);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Cashfree Webhook] Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}

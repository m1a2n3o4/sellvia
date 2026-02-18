import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyRazorpayWebhookSignature } from '@/lib/whatsapp/razorpay';
import { handlePaymentComplete } from '@/lib/whatsapp/commerce';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // Parse the event
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // We only handle payment_link.paid events
    if (event.event !== 'payment_link.paid') {
      return NextResponse.json({ status: 'ignored' });
    }

    const paymentLinkId = event.payload?.payment_link?.entity?.id;
    const paymentId = event.payload?.payment?.entity?.id;

    if (!paymentLinkId) {
      return NextResponse.json({ status: 'ok' });
    }

    // Find order by payment link ID
    const order = await prisma.order.findFirst({
      where: { razorpayPaymentLinkId: paymentLinkId },
    });

    if (!order) {
      console.error('[Razorpay Webhook] No order found for payment link:', paymentLinkId);
      return NextResponse.json({ status: 'ok' });
    }

    // Get business info to verify signature
    const businessInfo = await prisma.businessInfo.findUnique({
      where: { tenantId: order.tenantId },
    });

    // Verify webhook signature if we have the secret
    if (businessInfo?.razorpayKeySecret && signature) {
      const isValid = verifyRazorpayWebhookSignature(
        rawBody,
        signature,
        businessInfo.razorpayKeySecret
      );

      if (!isValid) {
        console.error('[Razorpay Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Update order with payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayPaymentId: paymentId },
    });

    // Handle payment completion (updates order, sends WhatsApp confirmation, resets state)
    await handlePaymentComplete(order.id);

    console.log(`[Razorpay Webhook] Payment completed for order ${order.orderNumber}`);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Razorpay Webhook] Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}

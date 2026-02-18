import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { createOrderFromWhatsApp } from '@/lib/whatsapp/order-service';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId(request);
    const { id: chatId } = await params;
    const body = await request.json();

    const { items, deliveryAddress, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    // Get chat to find customer info
    const chat = await prisma.whatsAppChat.findFirst({
      where: { id: chatId, tenantId },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Create order linked to chat
    const order = await createOrderFromWhatsApp({
      tenantId,
      customerPhone: chat.customerPhone,
      customerName: chat.customerName || 'WhatsApp Customer',
      deliveryAddress: deliveryAddress || '',
      chatId,
      items,
      notes,
    });

    // Send WhatsApp confirmation to customer
    const businessInfo = await prisma.businessInfo.findUnique({
      where: { tenantId },
    });

    if (businessInfo?.whatsappToken && businessInfo?.whatsappPhoneNumberId) {
      const itemsSummary = items
        .map((i: { productName: string; quantity: number; price: number }) => `${i.productName} x${i.quantity} - ₹${i.price * i.quantity}`)
        .join('\n');

      const confirmMsg = `Order Confirmed!\n\nOrder: ${order.orderNumber}\n${itemsSummary}\nTotal: ₹${order.total}\n${deliveryAddress ? `\nDelivery: ${deliveryAddress}` : ''}\n\nThank you for your order!`;

      await sendWhatsAppMessage({
        phoneNumberId: businessInfo.whatsappPhoneNumberId,
        accessToken: businessInfo.whatsappToken,
        to: chat.customerPhone,
        message: confirmMsg,
      });

      // Save confirmation message
      await prisma.whatsAppMessage.create({
        data: {
          tenantId,
          chatId,
          sender: 'business',
          content: confirmMsg,
          messageType: 'text',
          status: 'sent',
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        },
      });

      // Update chat
      await prisma.whatsAppChat.update({
        where: { id: chatId },
        data: {
          lastMessage: `Order ${order.orderNumber} created`,
          lastMessageAt: new Date(),
        },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

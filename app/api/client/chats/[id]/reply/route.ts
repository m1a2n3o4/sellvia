import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { resolveTenantSender } from '@/lib/whatsapp/platform-mirror';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantId(request);
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get chat
    const chat = await prisma.whatsAppChat.findFirst({
      where: { id: params.id, tenantId },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get business info for WhatsApp credentials
    const businessInfo = await prisma.businessInfo.findUnique({
      where: { tenantId },
    });

    const send = await resolveTenantSender(tenantId, businessInfo);
    if (!send) {
      return NextResponse.json(
        { error: 'WhatsApp not configured. Go to Settings to set up.' },
        { status: 400 }
      );
    }

    // Send via WhatsApp
    const sendResult = await send(chat.customerPhone, message.trim());

    // Save message
    const savedMessage = await prisma.whatsAppMessage.create({
      data: {
        tenantId,
        chatId: chat.id,
        waMessageId: sendResult.messageId ?? null,
        sender: 'business',
        content: message.trim(),
        messageType: 'text',
        status: sendResult.success ? 'sent' : 'failed',
        isAiGenerated: false,
      },
    });

    // Update chat
    await prisma.whatsAppChat.update({
      where: { id: chat.id },
      data: {
        lastMessage: message.trim(),
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({
      success: sendResult.success,
      message: savedMessage,
      error: sendResult.error,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

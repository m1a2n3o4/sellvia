import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendWhatsAppMessage, markMessageAsRead } from '@/lib/whatsapp/client';
import { processMessageWithAI } from '@/lib/whatsapp/ai';

export const dynamic = 'force-dynamic';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'bizmanager_webhook_verify';

// GET - Meta webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Webhook] Verified successfully');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// POST - Incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Meta sends webhook events in this structure
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.[0]) {
      // Status update or other non-message event - acknowledge
      return NextResponse.json({ status: 'ok' });
    }

    const message = value.messages[0];
    const contact = value.contacts?.[0];
    const metadata = value.metadata;

    const customerPhone = message.from; // e.g. "919876543210"
    const customerName = contact?.profile?.name || null;
    const phoneNumberId = metadata?.phone_number_id;
    const waMessageId = message.id;

    // Extract message content based on type
    let messageContent = '';
    let messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' = 'text';

    switch (message.type) {
      case 'text':
        messageContent = message.text?.body || '';
        messageType = 'text';
        break;
      case 'image':
        messageContent = message.image?.caption || '[Image received]';
        messageType = 'image';
        break;
      case 'audio':
        messageContent = '[Voice message received]';
        messageType = 'audio';
        break;
      case 'video':
        messageContent = message.video?.caption || '[Video received]';
        messageType = 'video';
        break;
      case 'document':
        messageContent = message.document?.caption || '[Document received]';
        messageType = 'document';
        break;
      case 'location':
        messageContent = `[Location: ${message.location?.latitude}, ${message.location?.longitude}]`;
        messageType = 'location';
        break;
      default:
        messageContent = '[Unsupported message type]';
    }

    if (!messageContent || !phoneNumberId) {
      return NextResponse.json({ status: 'ok' });
    }

    // Find the tenant by their WhatsApp phone number ID
    const businessInfo = await prisma.businessInfo.findFirst({
      where: { whatsappPhoneNumberId: phoneNumberId },
    });

    if (!businessInfo) {
      console.error('[Webhook] No tenant found for phone number ID:', phoneNumberId);
      return NextResponse.json({ status: 'ok' });
    }

    const tenantId = businessInfo.tenantId;

    // Find or create chat
    let chat = await prisma.whatsAppChat.findUnique({
      where: {
        tenantId_customerPhone: { tenantId, customerPhone },
      },
    });

    if (!chat) {
      chat = await prisma.whatsAppChat.create({
        data: {
          tenantId,
          customerPhone,
          customerName,
          lastMessage: messageContent,
          lastMessageAt: new Date(),
          unreadCount: 1,
        },
      });
    } else {
      chat = await prisma.whatsAppChat.update({
        where: { id: chat.id },
        data: {
          customerName: customerName || chat.customerName,
          lastMessage: messageContent,
          lastMessageAt: new Date(),
          unreadCount: { increment: 1 },
        },
      });
    }

    // Save incoming message
    await prisma.whatsAppMessage.create({
      data: {
        tenantId,
        chatId: chat.id,
        waMessageId,
        sender: 'customer',
        senderPhone: customerPhone,
        content: messageContent,
        messageType,
        status: 'delivered',
      },
    });

    // Mark as read on WhatsApp
    if (businessInfo.whatsappToken) {
      markMessageAsRead({
        phoneNumberId,
        accessToken: businessInfo.whatsappToken,
        messageId: waMessageId,
      });
    }

    // Process with AI if enabled and it's a text message
    if (businessInfo.aiEnabled && businessInfo.openaiKey && messageType === 'text') {
      const aiResult = await processMessageWithAI({
        tenantId,
        customerPhone,
        customerMessage: messageContent,
        openaiKey: businessInfo.openaiKey,
      });

      // Send AI reply via WhatsApp
      if (businessInfo.whatsappToken) {
        const sendResult = await sendWhatsAppMessage({
          phoneNumberId,
          accessToken: businessInfo.whatsappToken,
          to: customerPhone,
          message: aiResult.reply,
        });

        // Save AI reply
        await prisma.whatsAppMessage.create({
          data: {
            tenantId,
            chatId: chat.id,
            waMessageId: sendResult.messageId,
            sender: 'ai',
            content: aiResult.reply,
            messageType: 'text',
            status: sendResult.success ? 'sent' : 'failed',
            isAiGenerated: true,
          },
        });

        // Update chat last message
        await prisma.whatsAppChat.update({
          where: { id: chat.id },
          data: {
            lastMessage: aiResult.reply,
            lastMessageAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Error processing message:', error);
    // Always return 200 to Meta so they don't retry
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}

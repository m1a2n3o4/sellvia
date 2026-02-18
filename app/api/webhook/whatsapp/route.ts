import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendWhatsAppMessage, markMessageAsRead } from '@/lib/whatsapp/client';
import { processMessageWithAI } from '@/lib/whatsapp/ai';
import { verifyMetaWebhookSignature } from '@/lib/whatsapp/webhook-security';
import { handleCommerceFlow, getOrCreateConversationState } from '@/lib/whatsapp/commerce';

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
    // Read body as text first (needed for signature verification), then parse
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Meta sends webhook events in this structure
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Handle message status updates (sent/delivered/read)
    if (value?.statuses?.[0]) {
      await handleStatusUpdate(value.statuses[0], value.metadata?.phone_number_id);
      return NextResponse.json({ status: 'ok' });
    }

    if (!value?.messages?.[0]) {
      // Other non-message event — acknowledge
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
    let messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'interactive' = 'text';

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
      case 'interactive':
        // Button reply or list reply
        messageContent =
          message.interactive?.button_reply?.title ||
          message.interactive?.list_reply?.title ||
          '[Interactive reply]';
        messageType = 'interactive';
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

    // Verify Meta webhook signature if app secret is configured
    if (businessInfo.whatsappAppSecret) {
      const signature = request.headers.get('x-hub-signature-256');
      const isValid = verifyMetaWebhookSignature(rawBody, signature, businessInfo.whatsappAppSecret);
      if (!isValid) {
        console.error('[Webhook] Invalid Meta signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

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
        messageType: messageType as any,
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

    // Process with AI if enabled and it's a text/interactive message
    if (
      businessInfo.aiEnabled &&
      businessInfo.openaiKey &&
      (messageType === 'text' || messageType === 'interactive')
    ) {
      // Get conversation state for context
      const conversationState = await getOrCreateConversationState(chat.id);

      const aiResult = await processMessageWithAI({
        tenantId,
        customerPhone,
        customerMessage: messageContent,
        openaiKey: businessInfo.openaiKey,
        conversationStep: conversationState.step,
        conversationProductId: conversationState.productId || undefined,
        conversationQuantity: conversationState.quantity || undefined,
      });

      // Send AI text reply via WhatsApp
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

        // Execute commerce flow actions (send images, create orders, etc.)
        if (aiResult.action !== 'none') {
          await handleCommerceFlow({
            tenantId,
            chatId: chat.id,
            customerPhone,
            customerName,
            phoneNumberId,
            accessToken: businessInfo.whatsappToken,
            aiResult,
            razorpayKeyId: businessInfo.razorpayKeyId,
            razorpayKeySecret: businessInfo.razorpayKeySecret,
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Error processing message:', error);
    // Always return 200 to Meta so they don't retry
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}

/**
 * Handle message status updates from WhatsApp (sent/delivered/read).
 */
async function handleStatusUpdate(
  status: { id: string; status: string; timestamp: string },
  phoneNumberId: string | undefined
) {
  try {
    const waMessageId = status.id;
    const newStatus = status.status; // 'sent' | 'delivered' | 'read' | 'failed'

    if (!waMessageId || !['sent', 'delivered', 'read', 'failed'].includes(newStatus)) {
      return;
    }

    // Update message status in database
    await prisma.whatsAppMessage.updateMany({
      where: { waMessageId },
      data: { status: newStatus as any },
    });
  } catch (error) {
    console.error('[Webhook] Status update error:', error);
  }
}

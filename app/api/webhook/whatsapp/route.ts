import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { prisma } from '@/lib/db/prisma';
import { sendWhatsAppMessage, markMessageAsRead } from '@/lib/whatsapp/client';
import { processMessageWithAI } from '@/lib/whatsapp/ai';
import { verifyMetaWebhookSignature } from '@/lib/whatsapp/webhook-security';
import { handleCommerceFlow, getOrCreateConversationState } from '@/lib/whatsapp/commerce';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Allow up to 30 seconds on Vercel Pro

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
  let rawBody: string;
  let body: any;

  try {
    rawBody = await request.text();
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ status: 'ok' });
  }

  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;

  // Handle message status updates (fire-and-forget)
  if (value?.statuses?.[0]) {
    waitUntil(handleStatusUpdate(value.statuses[0]));
    return NextResponse.json({ status: 'ok' });
  }

  if (!value?.messages?.[0]) {
    return NextResponse.json({ status: 'ok' });
  }

  const message = value.messages[0];
  const contact = value.contacts?.[0];
  const metadata = value.metadata;
  const customerPhone = message.from;
  const customerName = contact?.profile?.name || null;
  const phoneNumberId = metadata?.phone_number_id;
  const waMessageId = message.id;

  let messageContent = '';
  let messageType: string = 'text';

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

  // Return 200 to Meta IMMEDIATELY — process message in background
  // This prevents Meta from retrying and keeps the webhook fast
  waitUntil(
    processIncomingMessage({
      phoneNumberId,
      customerPhone,
      customerName,
      waMessageId,
      messageContent,
      messageType,
      rawBody,
      signature: request.headers.get('x-hub-signature-256'),
    }).catch((error) => {
      console.error('[Webhook] Background processing error:', error);
    })
  );

  return NextResponse.json({ status: 'ok' });
}

// ============================================
// Background message processing
// ============================================

interface IncomingMessage {
  phoneNumberId: string;
  customerPhone: string;
  customerName: string | null;
  waMessageId: string;
  messageContent: string;
  messageType: string;
  rawBody: string;
  signature: string | null;
}

async function processIncomingMessage(msg: IncomingMessage) {
  const { phoneNumberId, customerPhone, customerName, waMessageId, messageContent, messageType } = msg;

  // Find tenant by WhatsApp phone number ID
  const businessInfo = await prisma.businessInfo.findFirst({
    where: { whatsappPhoneNumberId: phoneNumberId },
  });

  if (!businessInfo) {
    console.error('[Webhook] No tenant found for phone number ID:', phoneNumberId);
    return;
  }

  const tenantId = businessInfo.tenantId;

  // Verify Meta webhook signature
  if (businessInfo.whatsappAppSecret) {
    const isValid = verifyMetaWebhookSignature(msg.rawBody, msg.signature, businessInfo.whatsappAppSecret);
    if (!isValid) {
      console.error('[Webhook] Invalid Meta signature');
      return;
    }
  }

  // Run chat lookup + conversation state in PARALLEL
  const [existingChat, _markRead] = await Promise.all([
    prisma.whatsAppChat.findUnique({
      where: { tenantId_customerPhone: { tenantId, customerPhone } },
    }),
    // Mark as read (fire-and-forget, don't await)
    businessInfo.whatsappToken
      ? markMessageAsRead({ phoneNumberId, accessToken: businessInfo.whatsappToken, messageId: waMessageId }).catch(() => {})
      : Promise.resolve(),
  ]);

  // Create or update chat
  let chat;
  if (!existingChat) {
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
      where: { id: existingChat.id },
      data: {
        customerName: customerName || existingChat.customerName,
        lastMessage: messageContent,
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
      },
    });
  }

  // Save incoming message + get conversation state in PARALLEL
  const [, conversationState] = await Promise.all([
    prisma.whatsAppMessage.create({
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
    }),
    getOrCreateConversationState(chat.id),
  ]);

  // Process with AI if enabled
  if (
    !businessInfo.aiEnabled ||
    !businessInfo.openaiKey ||
    (messageType !== 'text' && messageType !== 'interactive')
  ) {
    return;
  }

  if (!businessInfo.whatsappToken) {
    return;
  }

  try {
    const aiResult = await processMessageWithAI({
      tenantId,
      customerPhone,
      customerMessage: messageContent,
      openaiKey: businessInfo.openaiKey,
      conversationStep: conversationState.step,
      conversationProductId: conversationState.productId || undefined,
      conversationQuantity: conversationState.quantity || undefined,
      businessInfo, // Pass pre-fetched data to avoid duplicate query
    });

    const skipAiReply = aiResult.action === 'collect_address';

    // Send AI reply + execute commerce flow
    if (!skipAiReply) {
      const sendResult = await sendWhatsAppMessage({
        phoneNumberId,
        accessToken: businessInfo.whatsappToken,
        to: customerPhone,
        message: aiResult.reply,
      });

      // Save AI reply + update chat in PARALLEL
      await Promise.all([
        prisma.whatsAppMessage.create({
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
        }),
        prisma.whatsAppChat.update({
          where: { id: chat.id },
          data: {
            lastMessage: aiResult.reply,
            lastMessageAt: new Date(),
          },
        }),
      ]);
    }

    // Execute commerce flow
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
        paymentGateway: businessInfo.paymentGateway,
        cashfreeAppId: businessInfo.cashfreeAppId,
        cashfreeSecretKey: businessInfo.cashfreeSecretKey,
      });
    }
  } catch (error) {
    console.error('[Webhook] AI processing error:', error);
    // Send fallback reply so customer doesn't get silence
    try {
      await sendWhatsAppMessage({
        phoneNumberId,
        accessToken: businessInfo.whatsappToken,
        to: customerPhone,
        message: 'Sorry, I\'m having a brief issue. Please try again in a moment.',
      });
    } catch {
      console.error('[Webhook] Fallback reply also failed');
    }
  }
}

async function handleStatusUpdate(status: { id: string; status: string; timestamp: string }) {
  try {
    const waMessageId = status.id;
    const newStatus = status.status;
    if (!waMessageId || !['sent', 'delivered', 'read', 'failed'].includes(newStatus)) return;
    await prisma.whatsAppMessage.updateMany({
      where: { waMessageId },
      data: { status: newStatus as any },
    });
  } catch (error) {
    console.error('[Webhook] Status update error:', error);
  }
}

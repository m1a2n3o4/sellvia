import { prisma } from '@/lib/db/prisma';
import { sendWhatsAppMessage, sendWhatsAppImage, sendWhatsAppInteractiveMessage } from './client';
import { createOrderFromWhatsApp } from './order-service';
import { createPaymentLink } from './razorpay';
import type { AIResponse } from './ai';

const CONVERSATION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface CommerceContext {
  tenantId: string;
  chatId: string;
  customerPhone: string;
  customerName: string | null;
  phoneNumberId: string;
  accessToken: string;
  aiResult: AIResponse;
  razorpayKeyId?: string | null;
  razorpayKeySecret?: string | null;
}

export async function handleCommerceFlow(ctx: CommerceContext) {
  const { aiResult } = ctx;

  // Check for cancel intent in the message
  if (aiResult.action === 'none') {
    // Check if it's a cancellation — reset state if conversation was active
    const state = await getConversationState(ctx.chatId);
    if (state && state.step !== 'idle') {
      const lower = aiResult.reply.toLowerCase();
      if (
        lower.includes('cancel') ||
        lower.includes('nevermind') ||
        lower.includes('start over')
      ) {
        await resetConversationState(ctx.chatId);
      }
    }
    return;
  }

  switch (aiResult.action) {
    case 'search_products':
      await handleProductSearch(ctx);
      break;
    case 'initiate_order':
      await handleOrderInitiation(ctx);
      break;
    case 'collect_address':
      await handleAddressReceived(ctx);
      break;
    case 'confirm_order':
      await handleOrderConfirmation(ctx);
      break;
    case 'track_order':
      // Track order is handled by the AI reply itself
      break;
    case 'escalate_to_owner':
      await handleEscalation(ctx);
      break;
  }
}

async function handleProductSearch(ctx: CommerceContext) {
  const { aiResult, tenantId, phoneNumberId, accessToken, customerPhone, chatId } = ctx;
  const searchQuery = aiResult.actionData?.searchQuery || aiResult.actionData?.productName || '';

  // Search products
  const products = await prisma.product.findMany({
    where: {
      tenantId,
      status: 'active',
      OR: searchQuery
        ? [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { brand: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ]
        : undefined,
    },
    include: { variants: { where: { status: 'active' } } },
    take: 5,
  });

  // Send product images if available
  for (const product of products) {
    const images = (product.images as string[]) || [];
    if (images.length > 0 && images[0]) {
      await sendWhatsAppImage({
        phoneNumberId,
        accessToken,
        to: customerPhone,
        imageUrl: images[0],
        caption: `${product.name}${product.brand ? ` (${product.brand})` : ''}\nPrice: ₹${product.basePrice}\nStock: ${product.stockQuantity > 0 ? 'Available' : 'Out of stock'}`,
      });

      // Save image message
      await prisma.whatsAppMessage.create({
        data: {
          tenantId,
          chatId,
          sender: 'ai',
          content: `[Product Image] ${product.name}`,
          messageType: 'image',
          mediaUrl: images[0],
          isAiGenerated: true,
          status: 'sent',
          metadata: { productId: product.id },
        },
      });
    }
  }

  // Update conversation state
  if (products.length > 0) {
    await upsertConversationState(chatId, {
      step: 'product_shown',
      productId: products.length === 1 ? products[0].id : undefined,
    });
  }
}

async function handleOrderInitiation(ctx: CommerceContext) {
  const { aiResult, chatId } = ctx;
  const productId = aiResult.actionData?.productId;
  const quantity = aiResult.actionData?.quantity;

  const state = await getConversationState(chatId);

  // Determine which product
  const resolvedProductId = productId || state?.productId;

  if (!resolvedProductId) {
    // No product identified, stay in current state
    return;
  }

  if (quantity && quantity > 0) {
    // We have both product and quantity — move to awaiting address
    await upsertConversationState(chatId, {
      step: 'awaiting_address',
      productId: resolvedProductId,
      variantId: aiResult.actionData?.variantId || state?.variantId,
      quantity,
    });
  } else {
    // We have product but no quantity — ask for quantity
    await upsertConversationState(chatId, {
      step: 'awaiting_quantity',
      productId: resolvedProductId,
      variantId: aiResult.actionData?.variantId || state?.variantId,
    });
  }
}

async function handleAddressReceived(ctx: CommerceContext) {
  const { aiResult, chatId, tenantId, customerPhone, customerName, phoneNumberId, accessToken } =
    ctx;
  const address = aiResult.actionData?.address;

  if (!address) return;

  const state = await getConversationState(chatId);
  if (!state?.productId || !state?.quantity) return;

  // Fetch product details
  const product = await prisma.product.findUnique({
    where: { id: state.productId },
    include: { variants: { where: { status: 'active' } } },
  });

  if (!product) return;

  const variant = state.variantId
    ? product.variants.find((v) => v.id === state.variantId)
    : null;

  const price = variant ? Number(variant.price) : Number(product.basePrice);
  const totalAmount = price * state.quantity;

  // Create order
  try {
    const order = await createOrderFromWhatsApp({
      tenantId,
      customerPhone,
      customerName: customerName || 'WhatsApp Customer',
      deliveryAddress: address,
      chatId,
      items: [
        {
          productId: product.id,
          variantId: variant?.id,
          productName: product.name,
          variantName: variant?.variantName,
          price,
          quantity: state.quantity,
        },
      ],
    });

    // Try to create Razorpay payment link
    let paymentLinkUrl: string | null = null;
    let paymentLinkId: string | null = null;

    if (ctx.razorpayKeyId && ctx.razorpayKeySecret) {
      try {
        const paymentLink = await createPaymentLink({
          amount: totalAmount,
          customerName: customerName || 'WhatsApp Customer',
          customerPhone,
          description: `Order ${order.orderNumber} - ${product.name} x${state.quantity}`,
          orderId: order.id,
          razorpayKeyId: ctx.razorpayKeyId,
          razorpayKeySecret: ctx.razorpayKeySecret,
        });

        paymentLinkUrl = paymentLink.short_url;
        paymentLinkId = paymentLink.id;

        // Update order with payment link info
        await prisma.order.update({
          where: { id: order.id },
          data: {
            razorpayPaymentLinkId: paymentLinkId,
            paymentMethod: 'razorpay',
          },
        });
      } catch (error) {
        console.error('[Commerce] Payment link creation failed:', error);
      }
    }

    // Send order confirmation + payment link
    const orderSummary = `Order Created!\n\nOrder: ${order.orderNumber}\nProduct: ${product.name}${variant ? ` (${variant.variantName})` : ''}\nQuantity: ${state.quantity}\nTotal: ₹${totalAmount}\nDelivery: ${address}`;

    if (paymentLinkUrl) {
      await sendWhatsAppMessage({
        phoneNumberId,
        accessToken,
        to: customerPhone,
        message: `${orderSummary}\n\nPlease complete your payment here:\n${paymentLinkUrl}`,
      });
    } else {
      await sendWhatsAppMessage({
        phoneNumberId,
        accessToken,
        to: customerPhone,
        message: `${orderSummary}\n\nPayment will be collected on delivery.`,
      });
    }

    // Save order confirmation message
    await prisma.whatsAppMessage.create({
      data: {
        tenantId,
        chatId,
        sender: 'ai',
        content: paymentLinkUrl
          ? `${orderSummary}\n\nPayment link: ${paymentLinkUrl}`
          : `${orderSummary}\n\nPayment: Cash on delivery`,
        messageType: 'text',
        isAiGenerated: true,
        status: 'sent',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentLinkUrl,
          paymentLinkId,
        },
      },
    });

    // Update conversation state
    await upsertConversationState(chatId, {
      step: paymentLinkUrl ? 'awaiting_payment' : 'order_complete',
      productId: product.id,
      variantId: variant?.id || null,
      quantity: state.quantity,
      deliveryAddress: address,
      orderId: order.id,
      paymentLinkId,
      paymentLinkUrl,
    });

    // If no payment link (COD), reset after a short delay
    if (!paymentLinkUrl) {
      await resetConversationState(chatId);
    }

    // Update chat last message
    await prisma.whatsAppChat.update({
      where: { id: chatId },
      data: {
        lastMessage: `Order ${order.orderNumber} created`,
        lastMessageAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[Commerce] Order creation failed:', error);
    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: customerPhone,
      message: 'Sorry, there was an issue creating your order. Please try again.',
    });
  }
}

async function handleOrderConfirmation(ctx: CommerceContext) {
  const { phoneNumberId, accessToken, customerPhone, chatId } = ctx;
  const state = await getConversationState(chatId);

  if (!state) return;

  // Safety guardrail: if we have product + quantity but NO address, force awaiting_address
  if (state.productId && state.quantity && !state.deliveryAddress) {
    await upsertConversationState(chatId, {
      step: 'awaiting_address',
      productId: state.productId,
      variantId: state.variantId,
      quantity: state.quantity,
    });

    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: customerPhone,
      message: 'Please share your delivery address so we can place your order.',
    });

    // Save the message
    await prisma.whatsAppMessage.create({
      data: {
        tenantId: ctx.tenantId,
        chatId,
        sender: 'ai',
        content: 'Please share your delivery address so we can place your order.',
        messageType: 'text',
        isAiGenerated: true,
        status: 'sent',
      },
    });
    return;
  }

  // If we have all info needed (product + quantity + address), create order
  if (state.productId && state.quantity && state.deliveryAddress) {
    await handleAddressReceived({
      ...ctx,
      aiResult: {
        ...ctx.aiResult,
        actionData: { address: state.deliveryAddress },
      },
    });
  }
}

async function handleEscalation(ctx: CommerceContext) {
  const { tenantId, customerPhone, customerName, chatId, phoneNumberId, accessToken, aiResult } = ctx;
  const reason = aiResult.actionData?.escalationReason || 'Customer requested to speak with the owner';

  // Get owner phone from business info
  const businessInfo = await prisma.businessInfo.findUnique({
    where: { tenantId },
    select: { ownerPhone: true, storeName: true },
  });

  if (!businessInfo?.ownerPhone) {
    console.warn('[Commerce] Escalation requested but no owner phone configured for tenant:', tenantId);
    return;
  }

  // Send alert to business owner
  try {
    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: businessInfo.ownerPhone,
      message: `CUSTOMER ALERT\n\nCustomer: ${customerName || 'Unknown'} (${customerPhone})\nIssue: ${reason}\n\nPlease follow up with this customer.`,
    });
  } catch (error) {
    console.error('[Commerce] Failed to send escalation to owner:', error);
  }

  // Save escalation record in chat
  await prisma.whatsAppMessage.create({
    data: {
      tenantId,
      chatId,
      sender: 'ai',
      content: `[Escalated to owner] Reason: ${reason}`,
      messageType: 'text',
      isAiGenerated: true,
      status: 'sent',
      metadata: { escalated: true, escalationReason: reason },
    },
  });

  // Reset conversation state so next message starts fresh
  await resetConversationState(chatId);
}

/**
 * Called by Razorpay webhook when payment is completed.
 */
export async function handlePaymentComplete(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order || !order.chatId) return;

  // Update order payment status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'paid',
      status: 'confirmed',
    },
  });

  // Get business info for WhatsApp credentials
  const businessInfo = await prisma.businessInfo.findUnique({
    where: { tenantId: order.tenantId },
  });

  if (!businessInfo?.whatsappToken || !businessInfo?.whatsappPhoneNumberId) return;

  // Get the chat to find customer phone
  const chat = await prisma.whatsAppChat.findUnique({
    where: { id: order.chatId },
  });

  if (!chat) return;

  // Send confirmation
  const items = order.orderItems.map((i) => `${i.productName} x${i.quantity}`).join(', ');
  const confirmMsg = `Payment Received!\n\nOrder: ${order.orderNumber}\nItems: ${items}\nTotal: ₹${order.total}\n\nYour order has been confirmed. We'll update you on the delivery status.\n\nThank you for shopping with us!`;

  await sendWhatsAppMessage({
    phoneNumberId: businessInfo.whatsappPhoneNumberId,
    accessToken: businessInfo.whatsappToken,
    to: chat.customerPhone,
    message: confirmMsg,
  });

  // Save confirmation message
  await prisma.whatsAppMessage.create({
    data: {
      tenantId: order.tenantId,
      chatId: order.chatId,
      sender: 'ai',
      content: confirmMsg,
      messageType: 'text',
      isAiGenerated: true,
      status: 'sent',
      metadata: { orderId: order.id, paymentStatus: 'paid' },
    },
  });

  // Reset conversation state
  await resetConversationState(order.chatId);

  // Update chat
  await prisma.whatsAppChat.update({
    where: { id: order.chatId },
    data: {
      lastMessage: `Payment received for ${order.orderNumber}`,
      lastMessageAt: new Date(),
    },
  });
}

// ============================================
// Conversation State Management
// ============================================

export async function getConversationState(chatId: string) {
  const state = await prisma.conversationState.findUnique({
    where: { chatId },
  });

  // Check for timeout
  if (state && state.step !== 'idle') {
    const elapsed = Date.now() - state.updatedAt.getTime();
    if (elapsed > CONVERSATION_TIMEOUT_MS) {
      await resetConversationState(chatId);
      return null;
    }
  }

  return state;
}

export async function getOrCreateConversationState(chatId: string) {
  let state = await prisma.conversationState.findUnique({
    where: { chatId },
  });

  if (!state) {
    state = await prisma.conversationState.create({
      data: { chatId, step: 'idle' },
    });
  }

  // Check for timeout
  if (state.step !== 'idle') {
    const elapsed = Date.now() - state.updatedAt.getTime();
    if (elapsed > CONVERSATION_TIMEOUT_MS) {
      state = await prisma.conversationState.update({
        where: { chatId },
        data: {
          step: 'idle',
          productId: null,
          variantId: null,
          quantity: null,
          deliveryAddress: null,
          orderId: null,
          paymentLinkId: null,
          paymentLinkUrl: null,
        },
      });
    }
  }

  return state;
}

async function upsertConversationState(
  chatId: string,
  data: {
    step: string;
    productId?: string | null;
    variantId?: string | null;
    quantity?: number | null;
    deliveryAddress?: string | null;
    orderId?: string | null;
    paymentLinkId?: string | null;
    paymentLinkUrl?: string | null;
  }
) {
  return prisma.conversationState.upsert({
    where: { chatId },
    update: {
      step: data.step as any,
      ...(data.productId !== undefined && { productId: data.productId }),
      ...(data.variantId !== undefined && { variantId: data.variantId }),
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.deliveryAddress !== undefined && { deliveryAddress: data.deliveryAddress }),
      ...(data.orderId !== undefined && { orderId: data.orderId }),
      ...(data.paymentLinkId !== undefined && { paymentLinkId: data.paymentLinkId }),
      ...(data.paymentLinkUrl !== undefined && { paymentLinkUrl: data.paymentLinkUrl }),
    },
    create: {
      chatId,
      step: data.step as any,
      productId: data.productId,
      variantId: data.variantId,
      quantity: data.quantity,
      deliveryAddress: data.deliveryAddress,
      orderId: data.orderId,
      paymentLinkId: data.paymentLinkId,
      paymentLinkUrl: data.paymentLinkUrl,
    },
  });
}

export async function resetConversationState(chatId: string) {
  try {
    await prisma.conversationState.update({
      where: { chatId },
      data: {
        step: 'idle',
        productId: null,
        variantId: null,
        quantity: null,
        deliveryAddress: null,
        orderId: null,
        paymentLinkId: null,
        paymentLinkUrl: null,
      },
    });
  } catch {
    // State might not exist — that's fine
  }
}

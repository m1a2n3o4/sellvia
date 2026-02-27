import { prisma } from '@/lib/db/prisma';
import { sendWhatsAppMessage, sendWhatsAppImage, sendWhatsAppInteractiveMessage } from './client';
import { createOrderFromWhatsApp } from './order-service';
import { createPaymentLink } from './razorpay';
import { createCashfreePaymentLink } from './cashfree';
import { sendSms } from '@/lib/sms/fast2sms';
import { customerEscalation } from '@/lib/sms/templates';
import type { AIResponse } from './ai';
import {
  addToCart,
  removeFromCart,
  getCartWithItems,
  getActiveCartForChat,
  formatCartMessage,
  validateCartStock,
  convertCartToOrderItems,
} from '@/lib/cart/cart-service';

const CONVERSATION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

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
  paymentGateway?: string | null;
  cashfreeAppId?: string | null;
  cashfreeSecretKey?: string | null;
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
    case 'add_to_cart':
      await handleAddToCart(ctx);
      break;
    case 'remove_from_cart':
      await handleRemoveFromCart(ctx);
      break;
    case 'view_cart':
      await handleViewCart(ctx);
      break;
    case 'checkout':
      await handleCheckout(ctx);
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

// ============================================
// Cart Handlers
// ============================================

async function handleAddToCart(ctx: CommerceContext) {
  const { aiResult, chatId, tenantId, customerPhone, phoneNumberId, accessToken } = ctx;
  const productId = aiResult.actionData?.productId;
  const variantId = aiResult.actionData?.variantId;
  const quantity = aiResult.actionData?.quantity || 1;

  const state = await getConversationState(chatId);
  const resolvedProductId = productId || state?.productId;

  if (!resolvedProductId) {
    // AI should have already asked for product in its reply
    return;
  }

  const result = await addToCart({
    tenantId,
    chatId,
    customerPhone,
    productId: resolvedProductId,
    variantId: variantId || state?.variantId || null,
    quantity,
  });

  if (!result.success) {
    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: customerPhone,
      message: result.message,
    });
    return;
  }

  // Send cart summary
  const cartMsg = formatCartMessage(result.cart!);
  await sendWhatsAppMessage({
    phoneNumberId,
    accessToken,
    to: customerPhone,
    message: cartMsg,
  });

  // Save message
  await prisma.whatsAppMessage.create({
    data: {
      tenantId,
      chatId,
      sender: 'ai',
      content: cartMsg,
      messageType: 'text',
      isAiGenerated: true,
      status: 'sent',
      metadata: { cartId: result.cart!.id },
    },
  });

  // Update state to shopping with cartId
  await upsertConversationState(chatId, {
    step: 'shopping',
    cartId: result.cart!.id,
    productId: null,
    variantId: null,
    quantity: null,
  });
}

async function handleRemoveFromCart(ctx: CommerceContext) {
  const { aiResult, chatId, tenantId, customerPhone, phoneNumberId, accessToken } = ctx;
  const productId = aiResult.actionData?.productId;

  const state = await getConversationState(chatId);
  if (!state?.cartId) {
    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: customerPhone,
      message: 'Your cart is empty. Browse our products to start shopping!',
    });
    return;
  }

  if (!productId) {
    // AI reply should ask which item to remove
    return;
  }

  const result = await removeFromCart(
    state.cartId,
    productId,
    aiResult.actionData?.variantId || null,
  );

  if (!result.success) {
    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: customerPhone,
      message: result.message,
    });
    return;
  }

  // Check if cart is now empty
  if (!result.cart || result.cart.items.length === 0) {
    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: customerPhone,
      message: 'Item removed. Your cart is now empty. Browse our products to continue shopping!',
    });
    await resetConversationState(chatId);
    return;
  }

  const cartMsg = `Item removed!\n\n${formatCartMessage(result.cart)}`;
  await sendWhatsAppMessage({
    phoneNumberId,
    accessToken,
    to: customerPhone,
    message: cartMsg,
  });

  await prisma.whatsAppMessage.create({
    data: {
      tenantId,
      chatId,
      sender: 'ai',
      content: cartMsg,
      messageType: 'text',
      isAiGenerated: true,
      status: 'sent',
      metadata: { cartId: state.cartId },
    },
  });
}

async function handleViewCart(ctx: CommerceContext) {
  const { chatId, tenantId, customerPhone, phoneNumberId, accessToken } = ctx;

  const state = await getConversationState(chatId);

  // Try to find active cart via state or direct lookup
  let cart = state?.cartId ? await getCartWithItems(state.cartId) : null;
  if (!cart || cart.status !== 'active') {
    cart = await getActiveCartForChat(chatId);
  }

  if (!cart || cart.items.length === 0) {
    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: customerPhone,
      message: 'Your cart is empty. Browse our products to start shopping!',
    });
    return;
  }

  const cartMsg = formatCartMessage(cart);
  await sendWhatsAppMessage({
    phoneNumberId,
    accessToken,
    to: customerPhone,
    message: cartMsg,
  });

  await prisma.whatsAppMessage.create({
    data: {
      tenantId,
      chatId,
      sender: 'ai',
      content: cartMsg,
      messageType: 'text',
      isAiGenerated: true,
      status: 'sent',
      metadata: { cartId: cart.id },
    },
  });
}

async function handleCheckout(ctx: CommerceContext) {
  const { chatId, tenantId, customerPhone, phoneNumberId, accessToken } = ctx;

  const state = await getConversationState(chatId);

  // Find active cart
  let cart = state?.cartId ? await getCartWithItems(state.cartId) : null;
  if (!cart || cart.status !== 'active') {
    cart = await getActiveCartForChat(chatId);
  }

  if (!cart || cart.items.length === 0) {
    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: customerPhone,
      message: 'Your cart is empty. Add some products first!',
    });
    return;
  }

  // Validate stock for all items
  const stockCheck = await validateCartStock(cart.id);
  if (!stockCheck.valid) {
    const issueList = stockCheck.issues.join('\n');
    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: customerPhone,
      message: `Some items in your cart have issues:\n\n${issueList}\n\nPlease update your cart and try again.`,
    });
    return;
  }

  // Show order summary and ask for address
  let total = 0;
  const itemLines = cart.items.map((item, i) => {
    const name = item.product.name;
    const variantLabel = item.variant ? ` (${item.variant.variantName})` : '';
    const price = Number(item.price);
    const subtotal = price * item.quantity;
    total += subtotal;
    return `${i + 1}. ${name}${variantLabel} x${item.quantity} — Rs.${subtotal.toLocaleString('en-IN')}`;
  });

  const summaryMsg = `Order Summary:\n\n${itemLines.join('\n')}\n\nTotal: Rs.${total.toLocaleString('en-IN')}\n\nPlease share your delivery address to place this order.`;

  await sendWhatsAppMessage({
    phoneNumberId,
    accessToken,
    to: customerPhone,
    message: summaryMsg,
  });

  await prisma.whatsAppMessage.create({
    data: {
      tenantId,
      chatId,
      sender: 'ai',
      content: summaryMsg,
      messageType: 'text',
      isAiGenerated: true,
      status: 'sent',
      metadata: { cartId: cart.id },
    },
  });

  // Set state to awaiting_address, keep cartId
  await upsertConversationState(chatId, {
    step: 'awaiting_address',
    cartId: cart.id,
    productId: null,
    variantId: null,
    quantity: null,
  });
}

async function handleOrderInitiation(ctx: CommerceContext) {
  const { aiResult, chatId, tenantId, phoneNumberId, accessToken, customerPhone } = ctx;
  const productId = aiResult.actionData?.productId;
  const quantity = aiResult.actionData?.quantity;

  const state = await getConversationState(chatId);

  // Determine which product
  const resolvedProductId = productId || state?.productId;

  if (!resolvedProductId) {
    // No product identified, stay in current state
    return;
  }

  // Fetch product to verify and show confirmation
  const product = await prisma.product.findUnique({
    where: { id: resolvedProductId },
    include: { variants: { where: { status: 'active' } } },
  });

  if (!product) {
    return;
  }

  const variantId = aiResult.actionData?.variantId || state?.variantId;
  const variant = variantId ? product.variants.find((v) => v.id === variantId) : null;
  const price = variant ? Number(variant.price) : Number(product.basePrice);

  if (quantity && quantity > 0) {
    const total = price * quantity;

    // Show order summary and ask for address
    await sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: customerPhone,
      message: `You're ordering:\n\n${product.name}${variant ? ` (${variant.variantName})` : ''}\nPrice: ₹${price} x ${quantity} = ₹${total}\n\nPlease share your delivery address to proceed.`,
    });

    // Save confirmation message
    await prisma.whatsAppMessage.create({
      data: {
        tenantId,
        chatId,
        sender: 'ai',
        content: `Order summary: ${product.name} x${quantity} = ₹${total}`,
        messageType: 'text',
        isAiGenerated: true,
        status: 'sent',
        metadata: { productId: product.id },
      },
    });

    await upsertConversationState(chatId, {
      step: 'awaiting_address',
      productId: resolvedProductId,
      variantId: variantId || null,
      quantity,
    });
  } else {
    // We have product but no quantity — ask for quantity
    await upsertConversationState(chatId, {
      step: 'awaiting_quantity',
      productId: resolvedProductId,
      variantId: variantId || null,
    });
  }
}

async function handleAddressReceived(ctx: CommerceContext) {
  const { aiResult, chatId, tenantId, customerPhone, customerName, phoneNumberId, accessToken } =
    ctx;
  const address = aiResult.actionData?.address;

  if (!address) {
    console.error('[Commerce] handleAddressReceived: No address in actionData');
    await sendWhatsAppMessage({ phoneNumberId, accessToken, to: customerPhone, message: 'Please share your delivery address so we can place your order.' });
    return;
  }

  const state = await getConversationState(chatId);

  // ─── CART PATH: If cart exists, create multi-item order ───
  if (state?.cartId) {
    const cart = await getCartWithItems(state.cartId);
    if (cart && cart.items.length > 0) {
      // Validate stock one final time
      const stockCheck = await validateCartStock(cart.id);
      if (!stockCheck.valid) {
        const issueList = stockCheck.issues.join('\n');
        await sendWhatsAppMessage({
          phoneNumberId,
          accessToken,
          to: customerPhone,
          message: `Some items have stock issues:\n\n${issueList}\n\nPlease update your cart and try checkout again.`,
        });
        return;
      }

      // Convert cart to order items
      const orderItems = await convertCartToOrderItems(cart.id);
      if (!orderItems) {
        await sendWhatsAppMessage({
          phoneNumberId, accessToken, to: customerPhone,
          message: 'Sorry, your cart appears to be empty. Please add products and try again.',
        });
        return;
      }

      try {
        const order = await createOrderFromWhatsApp({
          tenantId,
          customerPhone,
          customerName: customerName || 'WhatsApp Customer',
          deliveryAddress: address,
          chatId,
          items: orderItems,
        });

        // Calculate total
        const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Payment link (same logic as single-product path)
        let paymentLinkUrl: string | null = null;
        let paymentLinkId: string | null = null;
        let gateway = ctx.paymentGateway || 'none';
        if (gateway === 'none') {
          if (ctx.cashfreeAppId && ctx.cashfreeSecretKey) gateway = 'cashfree';
          else if (ctx.razorpayKeyId && ctx.razorpayKeySecret) gateway = 'razorpay';
        }
        const itemCount = orderItems.length;
        const linkDescription = `Order ${order.orderNumber} - ${itemCount} item${itemCount > 1 ? 's' : ''}`;

        if (gateway === 'cashfree' && ctx.cashfreeAppId && ctx.cashfreeSecretKey) {
          try {
            const paymentLink = await createCashfreePaymentLink({
              amount: totalAmount,
              customerName: customerName || 'WhatsApp Customer',
              customerPhone,
              description: linkDescription,
              orderId: order.id,
              cashfreeAppId: ctx.cashfreeAppId,
              cashfreeSecretKey: ctx.cashfreeSecretKey,
            });
            paymentLinkUrl = paymentLink.link_url;
            paymentLinkId = paymentLink.link_id;
            await prisma.order.update({
              where: { id: order.id },
              data: { cashfreeLinkId: paymentLinkId, paymentMethod: 'cashfree' },
            });
          } catch (error: any) {
            console.error('[Commerce] Cashfree payment link failed (cart):', error?.message || error);
          }
        } else if (gateway === 'razorpay' && ctx.razorpayKeyId && ctx.razorpayKeySecret) {
          try {
            const paymentLink = await createPaymentLink({
              amount: totalAmount,
              customerName: customerName || 'WhatsApp Customer',
              customerPhone,
              description: linkDescription,
              orderId: order.id,
              razorpayKeyId: ctx.razorpayKeyId,
              razorpayKeySecret: ctx.razorpayKeySecret,
            });
            paymentLinkUrl = paymentLink.short_url;
            paymentLinkId = paymentLink.id;
            await prisma.order.update({
              where: { id: order.id },
              data: { razorpayPaymentLinkId: paymentLinkId, paymentMethod: 'razorpay' },
            });
          } catch (error) {
            console.error('[Commerce] Razorpay payment link failed (cart):', error);
          }
        }

        // Build order details
        const itemsSummary = orderItems.map((item, i) =>
          `${i + 1}. ${item.productName}${item.variantName ? ` (${item.variantName})` : ''} x${item.quantity} — Rs.${(item.price * item.quantity).toLocaleString('en-IN')}`
        ).join('\n');
        const orderDetails = `Order: ${order.orderNumber}\n\n${itemsSummary}\n\nTotal: Rs.${totalAmount.toLocaleString('en-IN')}\nDelivery: ${address}`;

        if (paymentLinkUrl) {
          await sendWhatsAppMessage({
            phoneNumberId, accessToken, to: customerPhone,
            message: `Your order is ready!\n\n${orderDetails}\n\nPlease complete payment to confirm:\n${paymentLinkUrl}`,
          });
        } else {
          await sendWhatsAppMessage({
            phoneNumberId, accessToken, to: customerPhone,
            message: `Order Confirmed!\n\n${orderDetails}\n\nPayment will be collected on delivery.`,
          });
        }

        // Save order confirmation message
        await prisma.whatsAppMessage.create({
          data: {
            tenantId,
            chatId,
            sender: 'ai',
            content: paymentLinkUrl
              ? `${orderDetails}\n\nPayment link: ${paymentLinkUrl}`
              : `${orderDetails}\n\nPayment: Cash on delivery`,
            messageType: 'text',
            isAiGenerated: true,
            status: 'sent',
            metadata: { orderId: order.id, orderNumber: order.orderNumber, paymentLinkUrl, paymentLinkId },
          },
        });

        // Update state
        await upsertConversationState(chatId, {
          step: paymentLinkUrl ? 'awaiting_payment' : 'order_complete',
          cartId: null,
          orderId: order.id,
          paymentLinkId,
          paymentLinkUrl,
          deliveryAddress: address,
        });

        if (!paymentLinkUrl) {
          await resetConversationState(chatId);
        }

        // Update chat
        await prisma.whatsAppChat.update({
          where: { id: chatId },
          data: { lastMessage: `Order ${order.orderNumber} created`, lastMessageAt: new Date() },
        });

        return; // Cart order complete, skip single-product path
      } catch (error) {
        console.error('[Commerce] Cart order creation failed:', error);
        await sendWhatsAppMessage({
          phoneNumberId, accessToken, to: customerPhone,
          message: 'Sorry, there was an issue creating your order. Please try again.',
        });
        return;
      }
    }
  }

  // ─── SINGLE PRODUCT PATH (original flow) ───

  // Try to recover missing productId from AI actionData or recent state
  let productId = state?.productId || aiResult.actionData?.productId || null;
  let variantId = state?.variantId || aiResult.actionData?.variantId || null;
  let quantity = state?.quantity || aiResult.actionData?.quantity || null;

  // If productId still missing, try to find the last shown product for this chat
  // IMPORTANT: Only look at messages from the last 15 minutes to avoid pulling stale products
  if (!productId) {
    const fifteenMinutesAgo = new Date(Date.now() - CONVERSATION_TIMEOUT_MS);
    const recentProductMsg = await prisma.whatsAppMessage.findFirst({
      where: {
        chatId,
        metadata: { path: ['productId'], not: 'null' },
        createdAt: { gte: fifteenMinutesAgo },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (recentProductMsg) {
      const meta = recentProductMsg.metadata as Record<string, string> | null;
      if (meta?.productId) {
        productId = meta.productId;
        console.log('[Commerce] Recovered productId from recent message:', productId);
      }
    }
  }

  // Default quantity to 1 if still missing
  if (!quantity || quantity < 1) {
    quantity = 1;
    console.log('[Commerce] Defaulting quantity to 1 for chatId:', chatId);
  }

  if (!productId) {
    console.error('[Commerce] handleAddressReceived: Cannot recover productId —', { chatId });
    await sendWhatsAppMessage({ phoneNumberId, accessToken, to: customerPhone, message: 'I have your address, but I\'m not sure which product you want to order. Could you please tell me the product name and quantity?' });
    // Save address in state so they don't need to repeat it
    await upsertConversationState(chatId, {
      step: 'awaiting_product',
      deliveryAddress: address,
    });
    return;
  }

  // Fetch product details
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: { where: { status: 'active' } } },
  });

  if (!product) {
    console.error('[Commerce] handleAddressReceived: Product not found —', productId);
    await sendWhatsAppMessage({ phoneNumberId, accessToken, to: customerPhone, message: 'Sorry, this product is no longer available. Please try another product.' });
    return;
  }

  const variant = variantId
    ? product.variants.find((v) => v.id === variantId)
    : null;

  const price = variant ? Number(variant.price) : Number(product.basePrice);
  const totalAmount = price * quantity;

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
          quantity,
        },
      ],
    });

    // Try to create payment link based on configured gateway
    let paymentLinkUrl: string | null = null;
    let paymentLinkId: string | null = null;
    // Auto-detect gateway if not explicitly set
    let gateway = ctx.paymentGateway || 'none';
    if (gateway === 'none') {
      if (ctx.cashfreeAppId && ctx.cashfreeSecretKey) gateway = 'cashfree';
      else if (ctx.razorpayKeyId && ctx.razorpayKeySecret) gateway = 'razorpay';
    }
    const linkDescription = `Order ${order.orderNumber} - ${product.name} x${quantity}`;

    if (gateway === 'cashfree' && ctx.cashfreeAppId && ctx.cashfreeSecretKey) {
      try {
        const paymentLink = await createCashfreePaymentLink({
          amount: totalAmount,
          customerName: customerName || 'WhatsApp Customer',
          customerPhone,
          description: linkDescription,
          orderId: order.id,
          cashfreeAppId: ctx.cashfreeAppId,
          cashfreeSecretKey: ctx.cashfreeSecretKey,
        });

        paymentLinkUrl = paymentLink.link_url;
        paymentLinkId = paymentLink.link_id;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            cashfreeLinkId: paymentLinkId,
            paymentMethod: 'cashfree',
          },
        });
      } catch (error: any) {
        console.error('[Commerce] Cashfree payment link creation failed:', error?.message || error);
      }
    } else if (gateway === 'razorpay' && ctx.razorpayKeyId && ctx.razorpayKeySecret) {
      try {
        const paymentLink = await createPaymentLink({
          amount: totalAmount,
          customerName: customerName || 'WhatsApp Customer',
          customerPhone,
          description: linkDescription,
          orderId: order.id,
          razorpayKeyId: ctx.razorpayKeyId,
          razorpayKeySecret: ctx.razorpayKeySecret,
        });

        paymentLinkUrl = paymentLink.short_url;
        paymentLinkId = paymentLink.id;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            razorpayPaymentLinkId: paymentLinkId,
            paymentMethod: 'razorpay',
          },
        });
      } catch (error) {
        console.error('[Commerce] Razorpay payment link creation failed:', error);
      }
    }

    // Send order summary + payment link
    const orderDetails = `Order: ${order.orderNumber}\nProduct: ${product.name}${variant ? ` (${variant.variantName})` : ''}\nQuantity: ${quantity}\nTotal: ₹${totalAmount}\nDelivery: ${address}`;

    if (paymentLinkUrl) {
      await sendWhatsAppMessage({
        phoneNumberId,
        accessToken,
        to: customerPhone,
        message: `Your order is ready!\n\n${orderDetails}\n\nPlease complete payment to confirm your order:\n${paymentLinkUrl}\n\nOrder will be confirmed once payment is received.`,
      });
    } else {
      await sendWhatsAppMessage({
        phoneNumberId,
        accessToken,
        to: customerPhone,
        message: `Order Confirmed!\n\n${orderDetails}\n\nPayment will be collected on delivery.`,
      });
    }

    // Save order confirmation message
    await prisma.whatsAppMessage.create({
      data: {
        tenantId,
        chatId,
        sender: 'ai',
        content: paymentLinkUrl
          ? `${orderDetails}\n\nPayment link: ${paymentLinkUrl}`
          : `${orderDetails}\n\nPayment: Cash on delivery`,
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
      quantity,
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

  // Send WhatsApp alert + SMS to owner in parallel (fail silently)
  await Promise.all([
    sendWhatsAppMessage({
      phoneNumberId,
      accessToken,
      to: businessInfo.ownerPhone,
      message: `CUSTOMER ALERT\n\nCustomer: ${customerName || 'Unknown'} (${customerPhone})\nIssue: ${reason}\n\nPlease follow up with this customer.`,
    }).catch((error) => {
      console.error('[Commerce] Failed to send escalation WhatsApp to owner:', error);
    }),
    sendSms({
      mobile: businessInfo.ownerPhone,
      message: customerEscalation(customerName || 'Unknown', customerPhone, reason),
    }).catch((error) => {
      console.error('[Commerce] Failed to send escalation SMS to owner:', error);
    }),
    // Mark chat as needs attention
    prisma.whatsAppChat.update({
      where: { id: chatId },
      data: { needsAttention: true },
    }).catch(() => {}),
  ]);

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

  // Check for timeout — DELETE stale state entirely (including idle states with old productId)
  if (state) {
    const elapsed = Date.now() - state.updatedAt.getTime();
    if (elapsed > CONVERSATION_TIMEOUT_MS) {
      await prisma.conversationState.delete({ where: { chatId } }).catch(() => {});
      return null;
    }
  }

  return state;
}

export async function getOrCreateConversationState(chatId: string) {
  let state = await prisma.conversationState.findUnique({
    where: { chatId },
  });

  // Check for timeout — DELETE stale state entirely (including idle states with old productId)
  if (state) {
    const elapsed = Date.now() - state.updatedAt.getTime();
    if (elapsed > CONVERSATION_TIMEOUT_MS) {
      await prisma.conversationState.delete({ where: { chatId } }).catch(() => {});
      state = null;
    }
  }

  // Create fresh state if none exists
  if (!state) {
    // Check if there's an active (non-expired) cart for this chat — re-attach it
    const activeCart = await getActiveCartForChat(chatId);
    state = await prisma.conversationState.create({
      data: {
        chatId,
        step: activeCart ? 'shopping' : 'idle',
        cartId: activeCart?.id || null,
      },
    });
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
    cartId?: string | null;
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
      ...(data.cartId !== undefined && { cartId: data.cartId }),
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
      cartId: data.cartId,
    },
  });
}

export async function resetConversationState(chatId: string) {
  try {
    // DELETE the record entirely instead of setting to idle.
    // This ensures no stale productId/variantId/quantity lingers.
    await prisma.conversationState.delete({
      where: { chatId },
    });
  } catch {
    // State might not exist — that's fine
  }
}

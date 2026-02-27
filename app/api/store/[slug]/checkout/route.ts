import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { checkoutSchema } from '@/lib/validations/checkout';
import { createOrder } from '@/lib/whatsapp/order-service';
import { createPaymentLink } from '@/lib/whatsapp/razorpay';
import { createCashfreePaymentLink } from '@/lib/whatsapp/cashfree';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { checkRateLimit, getRateLimitKey } from '@/lib/store/rate-limiter';

export const dynamic = 'force-dynamic';

// GET - Fetch order details for confirmation page
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }

  try {
    const businessInfo = await prisma.businessInfo.findUnique({
      where: { storeSlug: params.slug },
      select: { tenantId: true },
    });

    if (!businessInfo) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId: businessInfo.tenantId },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        deliveryAddress: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        orderItems: {
          select: {
            productName: true,
            variantName: true,
            quantity: true,
            price: true,
            subtotal: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('[Store Checkout GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(getRateLimitKey(ip, 'store-checkout'), 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Bot trap: if honeypot field has content, silently reject
    if (data.honeypot) {
      return NextResponse.json({ orderId: 'ok', orderNumber: 'OK-000', total: 0, status: 'confirmed' });
    }

    // Resolve tenant from slug
    const businessInfo = await prisma.businessInfo.findUnique({
      where: { storeSlug: params.slug },
    });

    if (!businessInfo || !businessInfo.storeEnabled) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const tenantId = businessInfo.tenantId;

    // Validate payment method is enabled
    if (data.paymentMethod === 'cod' && !businessInfo.codEnabled) {
      return NextResponse.json({ error: 'Cash on delivery is not available for this store' }, { status: 400 });
    }
    if (data.paymentMethod === 'online' && !businessInfo.onlinePayEnabled) {
      return NextResponse.json({ error: 'Online payment is not available for this store' }, { status: 400 });
    }

    // Validate stock and build order items
    const orderItems = [];
    for (const item of data.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, tenantId, status: 'active' },
        include: { variants: { where: { status: 'active' } } },
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
      if (item.variantId && !variant) {
        return NextResponse.json({ error: `Variant not available for ${product.name}` }, { status: 400 });
      }

      const stock = variant ? variant.stockQuantity : product.stockQuantity;
      if (item.quantity > stock) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Only ${stock} available.` },
          { status: 400 }
        );
      }

      const price = variant ? Number(variant.price) : Number(product.basePrice);
      orderItems.push({
        productId: product.id,
        variantId: variant?.id,
        productName: product.name,
        variantName: variant?.variantName,
        price,
        quantity: item.quantity,
      });
    }

    // Check minimum order amount
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const minOrder = Number(businessInfo.minOrderAmount);
    if (minOrder > 0 && subtotal < minOrder) {
      return NextResponse.json(
        { error: `Minimum order amount is Rs.${minOrder}. Your cart total is Rs.${subtotal}.` },
        { status: 400 }
      );
    }

    const deliveryFee = Number(businessInfo.deliveryFee);
    const fullAddress = `${data.deliveryAddress}, ${data.city}, ${data.state} - ${data.pincode}`;

    // Create order
    const order = await createOrder({
      tenantId,
      customerPhone: data.customerPhone,
      customerName: data.customerName,
      customerEmail: data.customerEmail || undefined,
      deliveryAddress: fullAddress,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      items: orderItems,
      orderType: 'website',
      paymentMethod: data.paymentMethod === 'online' ? undefined : 'cod',
      paymentStatus: data.paymentMethod === 'cod' ? 'unpaid' : 'pending',
      shippingFee: deliveryFee,
    });

    const totalAmount = subtotal + deliveryFee;

    // Handle online payment
    let paymentLinkUrl: string | null = null;
    if (data.paymentMethod === 'online') {
      let gateway = businessInfo.paymentGateway || 'none';
      if (gateway === 'none') {
        if (businessInfo.cashfreeAppId && businessInfo.cashfreeSecretKey) gateway = 'cashfree';
        else if (businessInfo.razorpayKeyId && businessInfo.razorpayKeySecret) gateway = 'razorpay';
      }

      const linkDescription = `Order ${order.orderNumber} - ${orderItems.length} item${orderItems.length > 1 ? 's' : ''}`;

      if (gateway === 'cashfree' && businessInfo.cashfreeAppId && businessInfo.cashfreeSecretKey) {
        try {
          const link = await createCashfreePaymentLink({
            amount: totalAmount,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            description: linkDescription,
            orderId: order.id,
            cashfreeAppId: businessInfo.cashfreeAppId,
            cashfreeSecretKey: businessInfo.cashfreeSecretKey,
          });
          paymentLinkUrl = link.link_url;
          await prisma.order.update({
            where: { id: order.id },
            data: { cashfreeLinkId: link.link_id, paymentMethod: 'cashfree' },
          });
        } catch (err: any) {
          console.error('[Store Checkout] Cashfree link failed:', err?.message || err);
        }
      } else if (gateway === 'razorpay' && businessInfo.razorpayKeyId && businessInfo.razorpayKeySecret) {
        try {
          const link = await createPaymentLink({
            amount: totalAmount,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            description: linkDescription,
            orderId: order.id,
            razorpayKeyId: businessInfo.razorpayKeyId,
            razorpayKeySecret: businessInfo.razorpayKeySecret,
          });
          paymentLinkUrl = link.short_url;
          await prisma.order.update({
            where: { id: order.id },
            data: { razorpayPaymentLinkId: link.id, paymentMethod: 'razorpay' },
          });
        } catch (err) {
          console.error('[Store Checkout] Razorpay link failed:', err);
        }
      }
    }

    // Send WhatsApp confirmation to customer (fire-and-forget)
    if (businessInfo.whatsappToken && businessInfo.whatsappPhoneNumberId) {
      const itemsSummary = orderItems.map((i) => `${i.productName} x${i.quantity}`).join(', ');
      const msg = paymentLinkUrl
        ? `Order Placed! 🛒\n\nOrder: ${order.orderNumber}\nItems: ${itemsSummary}\nTotal: Rs.${totalAmount}\n\nComplete payment here:\n${paymentLinkUrl}`
        : `Order Confirmed! 🛒\n\nOrder: ${order.orderNumber}\nItems: ${itemsSummary}\nTotal: Rs.${totalAmount}\nPayment: Cash on Delivery\n\nWe'll update you on delivery status!`;

      sendWhatsAppMessage({
        phoneNumberId: businessInfo.whatsappPhoneNumberId,
        accessToken: businessInfo.whatsappToken,
        to: data.customerPhone,
        message: msg,
      }).catch((err) => console.error('[Store Checkout] WhatsApp notification failed:', err));
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: totalAmount,
      paymentMethod: data.paymentMethod,
      paymentLink: paymentLinkUrl,
      status: paymentLinkUrl ? 'awaiting_payment' : 'confirmed',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Store Checkout] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to place order. Please try again.' }, { status: 500 });
  }
}

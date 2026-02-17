import OpenAI from 'openai';
import { prisma } from '@/lib/db/prisma';

interface AIContext {
  tenantId: string;
  customerPhone: string;
  customerMessage: string;
  openaiKey: string;
}

interface AIResponse {
  reply: string;
  intent: 'general_enquiry' | 'product_search' | 'order_placement' | 'order_tracking' | 'greeting' | 'unknown';
}

export async function processMessageWithAI(ctx: AIContext): Promise<AIResponse> {
  const openai = new OpenAI({ apiKey: ctx.openaiKey });

  // Fetch business info
  const businessInfo = await prisma.businessInfo.findUnique({
    where: { tenantId: ctx.tenantId },
  });

  // Fetch products for context (active products, limited)
  const products = await prisma.product.findMany({
    where: { tenantId: ctx.tenantId, status: 'active' },
    include: { variants: { where: { status: 'active' } } },
    take: 50,
  });

  // Check if customer has existing orders (by phone)
  const customer = await prisma.customer.findFirst({
    where: {
      tenantId: ctx.tenantId,
      mobile: ctx.customerPhone.replace(/^\+91/, '').slice(-10),
    },
    include: {
      orders: {
        include: { orderItems: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  // Fetch recent chat history for context
  const chat = await prisma.whatsAppChat.findUnique({
    where: {
      tenantId_customerPhone: {
        tenantId: ctx.tenantId,
        customerPhone: ctx.customerPhone,
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  const recentMessages = (chat?.messages || []).reverse();

  // Build product catalog string
  const productCatalog = products.map((p) => {
    const variantInfo = p.variants.length > 0
      ? p.variants.map((v) => {
          const attrs = Object.entries(v.attributes as Record<string, string>)
            .map(([k, val]) => `${k}: ${val}`)
            .join(', ');
          return `  - ${v.variantName} (${attrs}) - ₹${v.price} (Stock: ${v.stockQuantity})`;
        }).join('\n')
      : '';

    return `• ${p.name}${p.brand ? ` (${p.brand})` : ''} - ₹${p.basePrice} (Stock: ${p.stockQuantity})${p.description ? ` - ${p.description}` : ''}${variantInfo ? '\n' + variantInfo : ''}`;
  }).join('\n');

  // Build order history
  const orderHistory = customer?.orders?.map((o) => {
    const items = o.orderItems.map((i) => `${i.productName} x${i.quantity}`).join(', ');
    return `Order ${o.orderNumber}: ${items} | Total: ₹${o.total} | Status: ${o.status} | Delivery: ${o.deliveryStatus}`;
  }).join('\n') || 'No previous orders';

  // Build conversation history
  const conversationHistory = recentMessages.map((m) => ({
    role: (m.sender === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.content,
  }));

  const systemPrompt = `You are a helpful WhatsApp sales assistant for "${businessInfo?.storeName || 'our store'}".

BUSINESS INFO:
- Store: ${businessInfo?.storeName || 'Not set'}
- Description: ${businessInfo?.description || 'A retail store'}
- Hours: ${businessInfo?.storeHours || 'Not specified'}
- Location: ${businessInfo?.location || 'Not specified'}
- Location URL: ${businessInfo?.locationUrl || 'Not available'}
- Policies: ${businessInfo?.policies || 'Standard policies apply'}

PRODUCT CATALOG:
${productCatalog || 'No products available yet.'}

CUSTOMER INFO:
- Phone: ${ctx.customerPhone}
- Name: ${customer?.name || 'Unknown'}
- Previous Orders: ${customer?.totalOrders || 0}
${orderHistory !== 'No previous orders' ? `\nORDER HISTORY:\n${orderHistory}` : ''}

INSTRUCTIONS:
1. Be friendly, concise, and helpful. Use simple language.
2. When customer asks about products, search the catalog above and provide accurate info with prices.
3. If a product is out of stock (Stock: 0), tell the customer it's currently unavailable.
4. If customer wants to place an order, confirm the product, quantity, and ask for delivery address.
5. For order tracking queries, use the order history above.
6. If you don't know something or it's not in your data, say so honestly.
7. Always mention prices in ₹ (Indian Rupees).
8. Keep responses under 300 words. WhatsApp messages should be short and readable.
9. Use line breaks for readability. Don't use markdown formatting (no **, no ##).
10. If greeting, include the store name.
11. NEVER make up product information. Only share what's in the catalog.
12. If the customer wants to order, list what they want with prices and say "Please confirm to place the order and share your delivery address."`;

  try {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: ctx.customerMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't process your message. Please try again.";

    // Detect intent
    const intent = detectIntent(ctx.customerMessage);

    return { reply, intent };
  } catch (error) {
    console.error('[AI] OpenAI error:', error);
    return {
      reply: "Sorry, I'm having trouble right now. Please try again in a moment or contact us directly.",
      intent: 'unknown',
    };
  }
}

function detectIntent(message: string): AIResponse['intent'] {
  const lower = message.toLowerCase();

  if (/\b(hi|hello|hey|namaste|good morning|good evening)\b/.test(lower)) {
    return 'greeting';
  }
  if (/\b(order|buy|purchase|want to buy|i want|i need|add to cart)\b/.test(lower)) {
    return 'order_placement';
  }
  if (/\b(where is my order|order status|track|tracking|delivery status|when will i get)\b/.test(lower)) {
    return 'order_tracking';
  }
  if (/\b(do you have|available|stock|price|cost|how much|show me|any new|catalog)\b/.test(lower)) {
    return 'product_search';
  }
  return 'general_enquiry';
}

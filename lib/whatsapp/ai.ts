import OpenAI from 'openai';
import { prisma } from '@/lib/db/prisma';

type CommerceAction =
  | 'none'
  | 'search_products'
  | 'initiate_order'
  | 'collect_address'
  | 'confirm_order'
  | 'track_order'
  | 'escalate_to_owner';

interface AIContext {
  tenantId: string;
  customerPhone: string;
  customerMessage: string;
  openaiKey: string;
  conversationStep?: string;
  conversationProductId?: string;
  conversationQuantity?: number;
}

interface AIResponse {
  reply: string;
  action: CommerceAction;
  actionData?: {
    productId?: string;
    productName?: string;
    variantId?: string;
    quantity?: number;
    address?: string;
    orderId?: string;
    searchQuery?: string;
    escalationReason?: string;
  };
}

const commerceFunctions: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'commerce_action',
      description:
        'Determine the commerce action to take based on the customer message. Always call this function.',
      parameters: {
        type: 'object',
        properties: {
          reply: {
            type: 'string',
            description:
              'The text reply to send to the customer via WhatsApp. Keep it under 300 words, friendly, and use line breaks. No markdown.',
          },
          action: {
            type: 'string',
            enum: [
              'none',
              'search_products',
              'initiate_order',
              'collect_address',
              'confirm_order',
              'track_order',
              'escalate_to_owner',
            ],
            description: `The commerce action to perform:
- none: General conversation, greeting, or info query. No commerce action needed.
- search_products: Customer is asking about products, availability, wants to browse, or asks to see/show/view product images. Extract searchQuery. Product images are sent automatically.
- initiate_order: Customer wants to buy a specific product. Extract productId (or productName) and quantity if mentioned.
- collect_address: Customer has provided their delivery address. Extract the address.
- confirm_order: Customer confirms they want to proceed with the order.
- track_order: Customer wants to track their order. Extract orderId if mentioned.
- escalate_to_owner: Customer is angry, frustrated, has a complaint about a defective/broken product, or explicitly asks to speak with the owner/manager. Extract escalationReason.`,
          },
          productId: {
            type: 'string',
            description: 'The product ID if the customer references a specific product.',
          },
          productName: {
            type: 'string',
            description: 'The product name if customer mentions a product by name.',
          },
          variantId: {
            type: 'string',
            description: 'The variant ID if a specific variant is referenced.',
          },
          quantity: {
            type: 'number',
            description: 'The quantity the customer wants to order.',
          },
          address: {
            type: 'string',
            description: 'The delivery address provided by the customer.',
          },
          orderId: {
            type: 'string',
            description: 'The order ID or order number for tracking.',
          },
          searchQuery: {
            type: 'string',
            description: 'Search keywords for product search.',
          },
          escalationReason: {
            type: 'string',
            description: 'The reason for escalating to the business owner (customer complaint, issue description).',
          },
        },
        required: ['reply', 'action'],
      },
    },
  },
];

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

  // Build product catalog string with IDs so GPT can reference specific products
  const productCatalog = products
    .map((p) => {
      const images = (p.images as string[]) || [];
      const hasImage = images.length > 0;
      const variantInfo =
        p.variants.length > 0
          ? p.variants
              .map((v) => {
                const attrs = Object.entries(v.attributes as Record<string, string>)
                  .map(([k, val]) => `${k}: ${val}`)
                  .join(', ');
                return `  - [VariantID: ${v.id}] ${v.variantName} (${attrs}) - ₹${v.price} (Stock: ${v.stockQuantity})`;
              })
              .join('\n')
          : '';

      return `• [ProductID: ${p.id}] ${p.name}${p.brand ? ` (${p.brand})` : ''} - ₹${p.basePrice} (Stock: ${p.stockQuantity})${hasImage ? ' [has image]' : ''}${p.description ? ` - ${p.description}` : ''}${variantInfo ? '\n' + variantInfo : ''}`;
    })
    .join('\n');

  // Build order history
  const orderHistory =
    customer?.orders
      ?.map((o) => {
        const items = o.orderItems.map((i) => `${i.productName} x${i.quantity}`).join(', ');
        return `Order ${o.orderNumber}: ${items} | Total: ₹${o.total} | Status: ${o.status} | Delivery: ${o.deliveryStatus}`;
      })
      .join('\n') || 'No previous orders';

  // Build conversation history
  const conversationHistory = recentMessages.map((m) => ({
    role: (m.sender === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.content,
  }));

  // Build conversation state context
  let stateContext = '';
  if (ctx.conversationStep && ctx.conversationStep !== 'idle') {
    stateContext = `\nCURRENT CONVERSATION STATE: ${ctx.conversationStep}`;
    if (ctx.conversationProductId) {
      const product = products.find((p) => p.id === ctx.conversationProductId);
      if (product) {
        stateContext += `\nSelected Product: ${product.name} - ₹${product.basePrice}`;
      }
    }
    if (ctx.conversationQuantity) {
      stateContext += `\nSelected Quantity: ${ctx.conversationQuantity}`;
    }
  }

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
${stateContext}

ORDER FLOW (you MUST follow these steps in strict order — NEVER skip a step):
Step 1: Customer expresses interest in a product → use "initiate_order" with productId and quantity (if mentioned).
Step 2: If quantity was NOT provided, ask the customer how many they want. Wait for their reply.
Step 3: ALWAYS ask the customer for their delivery address. Say something like "Please share your delivery address so we can place your order."
Step 4: Customer provides their address → use "collect_address" with the full address text. The order is created automatically after this step.
Step 5: NEVER say "order placed", "order confirmed", or "order created" until AFTER the delivery address has been collected via "collect_address".

CRITICAL RULES:
- When the conversation state is "awaiting_address", your reply MUST ask the customer for their delivery address. Do NOT skip this step. Do NOT use "confirm_order" or "initiate_order" — only "collect_address" or "none" are valid actions in this state.
- NEVER create or confirm an order without first collecting a delivery address.
- If the customer tries to confirm an order but no address has been collected yet, ask for the address instead of confirming.

INSTRUCTIONS:
1. Be friendly, concise, and helpful. Use simple language.
2. When customer asks about products, use action "search_products" with the relevant searchQuery. Include product details with prices in your reply.
3. When customer asks to see, show, or view a product image, use action "search_products" with the product name as searchQuery. You CAN show product images — they are sent automatically when you use "search_products". NEVER say you cannot show images.
4. If a product is out of stock (Stock: 0), tell the customer it's currently unavailable.
5. When customer wants to buy something, use action "initiate_order" with the productId and quantity.
6. When the conversation state is "awaiting_quantity", parse the quantity from the customer's message and use action "initiate_order" with quantity.
7. When the conversation state is "awaiting_address", the customer is providing their delivery address. Use action "collect_address" with the address. If they have NOT yet provided an address, ask for it.
8. When the customer says "confirm" or agrees to proceed, use action "confirm_order" ONLY if delivery address has already been collected. Otherwise, ask for the address first.
9. For order tracking queries, use action "track_order".
10. If the customer is angry, frustrated, complaining about a broken/defective product, or asks to speak with the owner/manager/someone in charge, use action "escalate_to_owner" with the escalationReason. Tell the customer their concern has been noted and someone will contact them shortly.
11. If the customer says "cancel", "nevermind", or wants to stop ordering, use action "none" and acknowledge the cancellation.
12. Always mention prices in ₹ (Indian Rupees).
13. Keep responses under 300 words. WhatsApp messages should be short and readable.
14. Use line breaks for readability. Don't use markdown formatting (no **, no ##).
15. NEVER make up product information. Only share what's in the catalog.
16. Always use the commerce_action function to structure your response.
17. Include ProductID/VariantID in the function call when referencing specific products.${businessInfo?.aiCustomInstructions ? `\n\nCUSTOM STORE RULES:\n${businessInfo.aiCustomInstructions}` : ''}`;

  try {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: ctx.customerMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: commerceFunctions,
      tool_choice: { type: 'function', function: { name: 'commerce_action' } },
      max_tokens: 800,
      temperature: 0.7,
    });

    const toolCall = completion.choices[0]?.message?.tool_calls?.[0] as
      | { function: { arguments: string } }
      | undefined;

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return {
        reply: parsed.reply || "Sorry, I couldn't process your message. Please try again.",
        action: parsed.action || 'none',
        actionData: {
          productId: parsed.productId,
          productName: parsed.productName,
          variantId: parsed.variantId,
          quantity: parsed.quantity,
          address: parsed.address,
          orderId: parsed.orderId,
          searchQuery: parsed.searchQuery,
          escalationReason: parsed.escalationReason,
        },
      };
    }

    // Fallback: if no tool call, use the text response
    const reply =
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn't process your message. Please try again.";
    return { reply, action: 'none' };
  } catch (error) {
    console.error('[AI] OpenAI error:', error);
    return {
      reply: "Sorry, I'm having trouble right now. Please try again in a moment or contact us directly.",
      action: 'none',
    };
  }
}

export type { AIContext, AIResponse, CommerceAction };

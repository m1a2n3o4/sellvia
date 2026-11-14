import OpenAI from 'openai';

export interface ExtractedProduct {
  name: string;
  category: string;
  brand: string;
  description: string;
  price: number | null;
  quantity: number | null;
}

const PROMPT = `You read screenshots of a small business's WhatsApp Business catalogue, Instagram post, or price list and convert EVERY product into structured data.

Return ONLY JSON: {"items":[ ... ]} where each item has:
- name: product name as written (e.g. "Premium Cashews 500g")
- category: short category (e.g. "Dry Fruits", "Spices", "Sarees", "Footwear"). Infer from the product, keep it short and consistent across items.
- brand: if shown, else ""
- description: short useful detail shown (weight, size, material, offer) else ""
- price: selling price as integer INR (digits only), null if not readable
- quantity: stock count if shown, else null

Rules: Never invent products or prices. One entry per product. Copy numbers exactly. Ignore logos, phone numbers, watermarks and headers.`;

export async function extractProductsFromImage(dataUrl: string): Promise<ExtractedProduct[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: PROMPT },
      { role: 'user', content: [{ type: 'image_url', image_url: { url: dataUrl, detail: 'high' } }] },
    ],
  });
  const parsed = JSON.parse(res.choices[0]?.message?.content || '{}');
  const list: any[] = Array.isArray(parsed.items) ? parsed.items : [];
  const str = (v: any) => (v == null ? '' : String(v).trim());
  const num = (v: any) => {
    const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };
  return list
    .map((i) => ({
      name: str(i.name),
      category: str(i.category) || 'General',
      brand: str(i.brand),
      description: str(i.description),
      price: num(i.price),
      quantity: num(i.quantity),
    }))
    .filter((i) => i.name);
}

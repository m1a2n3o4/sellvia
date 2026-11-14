import OpenAI from 'openai';

export interface ExtractedItem {
  category: string;
  brand: string;
  model: string;
  cpu: string;
  ram: string;
  storage: string;
  screen: string;
  color: string;
  condition: string;
  price: number | null;
  quantity: number | null;
  notes: string;
}

const PROMPT = `You read screenshots/photos of a shop's stock or price list (used laptops, desktops, monitors and accessories) and convert EVERY product row into structured data.

Return ONLY a JSON object: {"items":[ ... ]} where each item has:
- category: one of "laptop","desktop","monitor","accessory","other"
- brand: e.g. "Dell", "HP", "Lenovo" ("" if not shown)
- model: model/series text as written (e.g. "Latitude 5420")
- cpu: processor as written (e.g. "i5 11th Gen")
- ram: e.g. "16GB"
- storage: e.g. "512GB SSD"
- screen: size in inches for laptops/monitors, e.g. "14\\"" ("" if not shown)
- color: if shown
- condition: grade/condition text if shown (e.g. "Grade A", "Refurbished")
- price: integer in INR (digits only; null if not readable)
- quantity: integer stock count if shown, else null
- notes: anything else useful on that row (warranty, graphics card, touchscreen, etc.)

Rules: Never guess or invent. If a value is not visible, use "" (or null for numbers). Copy numbers exactly. If a price is ambiguous or cut off, use null. One entry per product row; do not merge rows. Ignore headers, logos, phone numbers and watermarks.`;

export async function extractCatalogFromImage(dataUrl: string): Promise<ExtractedItem[]> {
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

  const raw = res.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(raw);
  const list: any[] = Array.isArray(parsed.items) ? parsed.items : [];
  const str = (v: any) => (v == null ? '' : String(v).trim());
  const num = (v: any) => {
    const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };
  const cats = ['laptop', 'desktop', 'monitor', 'accessory', 'other'];
  return list.map((i) => ({
    category: cats.includes(str(i.category).toLowerCase()) ? str(i.category).toLowerCase() : 'other',
    brand: str(i.brand),
    model: str(i.model),
    cpu: str(i.cpu),
    ram: str(i.ram),
    storage: str(i.storage),
    screen: str(i.screen),
    color: str(i.color),
    condition: str(i.condition),
    price: num(i.price),
    quantity: num(i.quantity),
    notes: str(i.notes),
  }));
}

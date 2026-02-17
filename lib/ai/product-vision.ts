import OpenAI from 'openai';

export interface ProductPrediction {
  name: string;
  brand: string;
  category: string;
  description: string;
  basePrice: number;
  color: string;
  gender: string;
  material: string;
}

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const SYSTEM_PROMPT = `You are a product identification expert. Analyze the product image and return a JSON object with these fields:
- name: product name (concise, e.g. "Men's Cotton Polo T-Shirt")
- brand: brand name if visible, otherwise ""
- category: product category (e.g. "Clothing", "Electronics", "Footwear", "Accessories")
- description: 1-2 sentence product description for an online store
- basePrice: estimated retail price in Indian Rupees (INR), as a number
- color: primary color of the product
- gender: "Men", "Women", "Unisex", or "Kids" if applicable, otherwise ""
- material: material if identifiable (e.g. "Cotton", "Polyester", "Leather"), otherwise ""

Return ONLY valid JSON, no markdown or explanation.`;

const DEFAULT_PREDICTION: ProductPrediction = {
  name: '',
  brand: '',
  category: '',
  description: '',
  basePrice: 0,
  color: '',
  gender: '',
  material: '',
};

export async function analyzeProductImage(
  imageUrl: string
): Promise<ProductPrediction> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return DEFAULT_PREDICTION;

    // Strip markdown code fences if present
    const cleaned = content.replace(/^```(?:json)?\n?/g, '').replace(/\n?```$/g, '');
    const parsed = JSON.parse(cleaned);

    return {
      name: String(parsed.name || ''),
      brand: String(parsed.brand || ''),
      category: String(parsed.category || ''),
      description: String(parsed.description || ''),
      basePrice: Number(parsed.basePrice) || 0,
      color: String(parsed.color || ''),
      gender: String(parsed.gender || ''),
      material: String(parsed.material || ''),
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return DEFAULT_PREDICTION;
  }
}

# Phase 4: Screenshot & Smart Ordering via WhatsApp

## Priority: MEDIUM
## Status: Not Started
## Depends On: Phase 2 (Cart System)
## Goal: Let customers order by sending screenshots, product images, or links on WhatsApp

---

## 1. PROBLEM STATEMENT

Indian customers often:
- See a product on Instagram/website and screenshot it
- Get a product image forwarded on WhatsApp from a friend
- Share Instagram Reel links asking "do you have this?"
- Send photos of items they saw in a physical store

Currently, our AI can analyze images but only matches against product names. We need smarter image-to-product matching and URL/link handling.

---

## 2. USER STORIES

1. **As a customer**, I want to send a product screenshot on WhatsApp and the AI should identify and offer to order it.
2. **As a customer**, I want to send an Instagram post/reel link and the AI should understand what product I want.
3. **As a customer**, I want to forward a product image from another chat and get matched to a similar product.
4. **As a customer**, I want to send a photo of something I saw in a store and ask "do you have this?"
5. **As a customer**, I want the AI to show me the closest matching products even if it's not an exact match.

---

## 3. CURRENT STATE

### What We Already Have
- `processImageWithAI()` in `lib/whatsapp/ai.ts` — uses GPT-4o-mini Vision
- Receives image buffer from WhatsApp webhook
- Matches against product catalog text
- Returns text description fed into main AI pipeline

### Current Limitations
- Only matches by product NAME text — doesn't use visual similarity
- No URL/link parsing
- No multi-image support
- No confidence scoring

---

## 4. ENHANCED IMAGE ORDERING FLOW

### 4.1 Screenshot/Image Flow
```
Customer sends a product screenshot on WhatsApp
        │
        ▼
WhatsApp webhook receives image
        │
        ▼
Download image via WhatsApp Media API (EXISTING)
        │
        ▼
Send to GPT-4o Vision with ENHANCED prompt:
  - Describe what's in the image
  - Extract: product type, color, style, brand (if visible)
  - Compare with product catalog (names + descriptions + categories)
  - Return: matched productId + confidence (high/medium/low)
        │
        ▼
Based on confidence:
  HIGH (exact match found):
    "I found this! It looks like our Red Cotton Kurti (₹599).
     Want to order it?"
    → Add to cart flow

  MEDIUM (similar match):
    "This looks similar to a few products we have:
     1. Red Cotton Kurti - ₹599
     2. Pink Silk Kurti - ₹799
     Which one are you interested in?"
    → Show options

  LOW (no match):
    "I can see this is a [blue floral dress].
     Unfortunately, we don't have an exact match right now.
     Want me to notify the store owner about your interest?"
    → Escalate or save interest
```

### 4.2 URL/Link Flow
```
Customer sends: "https://www.instagram.com/p/ABC123/"
        │
        ▼
AI detects URL in message
        │
        ▼
Extract URL from message text
        │
        ▼
Attempt to fetch URL metadata:
  Option A: Use OpenGraph tags (og:title, og:image, og:description)
  Option B: If blocked, ask customer "What product did you see in this link?"
        │
        ▼
If metadata extracted:
  - Get product image from og:image
  - Get product name from og:title
  - Feed into image matching pipeline
  - Match against inventory
        │
        ▼
AI responds:
  "I see you shared a link for [product name].
   We have something similar:
   1. [Matched Product] - ₹599
   Want to order it?"
```

---

## 5. TECHNICAL IMPLEMENTATION

### 5.1 Enhanced Image Analysis (`lib/whatsapp/ai.ts`)

Update `processImageWithAI` function:

```typescript
// Enhanced prompt for GPT-4o Vision
const enhancedPrompt = `You are a product matching assistant for an Indian e-commerce store.

A customer sent this image on WhatsApp. Analyze it carefully:

1. DESCRIBE what you see:
   - Product type (clothing, electronics, accessory, footwear, etc.)
   - Color(s)
   - Style/pattern
   - Brand name (if visible on product/packaging)
   - Any text visible in the image

2. MATCH against our catalog:
${catalogText}

3. Return a JSON response:
{
  "description": "Brief description of what's in the image",
  "productType": "clothing/electronics/accessory/etc",
  "matchedProductId": "product ID if confident match" or null,
  "matchedProductName": "product name if matched" or null,
  "confidence": "high/medium/low/none",
  "similarProducts": ["product_id_1", "product_id_2"],
  "extractedText": "any text/brand visible in image"
}

MATCHING RULES:
- HIGH confidence: Product clearly matches by type + color + style
- MEDIUM confidence: Same product type, similar style but not exact
- LOW confidence: Vaguely similar category
- NONE: No relevant match in catalog

IMPORTANT: Only match products that are in the PRODUCT CATALOG above.
Do not hallucinate products.`;
```

### 5.2 New URL Parser (`lib/whatsapp/url-parser.ts`)

```typescript
// New file to create:

interface URLMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  url: string;
}

// Extract URLs from message text
function extractURLs(text: string): string[];

// Fetch OpenGraph metadata from URL
async function fetchURLMetadata(url: string): Promise<URLMetadata>;

// Detect if URL is from known platforms
function detectPlatform(url: string): 'instagram' | 'facebook' | 'flipkart' | 'amazon' | 'unknown';

// Download image from URL for analysis
async function downloadImageFromURL(imageUrl: string): Promise<Buffer | null>;
```

### 5.3 Updated Webhook Handler

```typescript
// In WhatsApp webhook handler, add URL detection:

// After receiving text message:
const urls = extractURLs(messageText);
if (urls.length > 0) {
  // Try to fetch metadata
  const metadata = await fetchURLMetadata(urls[0]);

  if (metadata.image) {
    // Download image and analyze
    const imageBuffer = await downloadImageFromURL(metadata.image);
    if (imageBuffer) {
      const analysis = await processImageWithAI({
        tenantId,
        imageBuffer,
        mimeType: 'image/jpeg',
        customerCaption: metadata.title || messageText,
        openaiKey,
      });
      // Feed analysis into main AI pipeline
      messageText = `${messageText}\n\n[URL Analysis: ${analysis}]`;
    }
  } else {
    // No image available, feed URL context to AI
    messageText = `${messageText}\n\n[Shared link: ${metadata.title || urls[0]}]`;
  }
}
```

### 5.4 Files to Create/Modify

```
# New files
lib/whatsapp/url-parser.ts          # URL extraction & metadata fetching

# Modified files
lib/whatsapp/ai.ts                  # Enhanced image analysis prompt
app/api/webhook/whatsapp/route.ts   # Add URL detection in message handling
lib/whatsapp/commerce.ts            # Handle image match results (add to cart)
```

---

## 6. PLATFORM-SPECIFIC HANDLING

### Instagram
- URLs: `instagram.com/p/ABC123/`, `instagram.com/reel/ABC123/`
- Challenge: Instagram blocks most scrapers
- Solution: Use OpenGraph meta tags (usually available) OR ask customer
- Fallback: "I can't preview Instagram links directly. Could you send a screenshot of the product?"

### Amazon/Flipkart
- URLs: `amazon.in/dp/ABC123`, `flipkart.com/product/...`
- These usually have good OpenGraph tags
- Extract product name + image → match against our catalog

### Other URLs
- Generic website: Try OpenGraph tags
- If blocked/no metadata: Ask customer what they're looking for

---

## 7. AI RESPONSE TEMPLATES

### High Confidence Match
```
I can see that's a [Red Cotton Kurti]!

We have this exact product:
[Product Name] - ₹599
Available in sizes: S, M, L, XL

Want to add it to your cart?
```

### Medium Confidence (Multiple Matches)
```
That looks like a [floral kurti]! I found some similar options:

1. Red Floral Kurti - ₹599
2. Pink Floral Kurti - ₹699
3. Blue Printed Kurti - ₹549

Which one would you like? Or send me another photo for a closer match.
```

### Low/No Confidence
```
I can see that's a [blue embroidered dress].

We don't have an exact match in our collection right now, but I can let the store owner know you're interested in this style.

Would you like me to do that?
```

### URL Shared
```
I see you shared a link! Let me check...

This looks like a [Product Name from link].
We have something similar:
[Our Product Name] - ₹599

Would you like to order this?
```

### URL Blocked
```
I wasn't able to preview that link. Could you:
1. Send a screenshot of the product, or
2. Tell me what product you're looking for?

I'll find it for you!
```

---

## 8. TESTING REQUIREMENTS

### Image Analysis Tests
- Screenshot of a product matching catalog → high confidence match
- Photo of similar product → medium confidence, multiple suggestions
- Unrelated image (selfie, landscape) → graceful "no match"
- Low quality/blurry image → handle gracefully
- Image with text (price tag, brand) → extract text

### URL Tests
- Instagram post URL → extract metadata (or fallback)
- Amazon product URL → extract product info
- Flipkart product URL → extract product info
- Invalid/broken URL → handle gracefully
- URL with no OpenGraph tags → ask customer

### Edge Cases
- Customer sends 3 images at once → process first, acknowledge others
- Very large image → resize before sending to Vision API
- Animated GIF → treat as image
- Video thumbnail → extract first frame or ask for screenshot

---

## 9. COST CONSIDERATIONS

### OpenAI Vision API Pricing
- GPT-4o-mini Vision: ~$0.15 per 1000 input tokens (images counted as tokens)
- Low detail image: ~85 tokens
- Estimated cost: ~$0.01-0.02 per image analysis

### Optimization
- Use `detail: 'low'` for initial matching (faster, cheaper)
- Only use `detail: 'high'` if low detail gives low confidence
- Cache results for identical images (rare but possible)
- Rate limit: max 5 image analyses per customer per hour

---

## 10. ACCEPTANCE CRITERIA

- [ ] Customer sends product screenshot → AI identifies and suggests matching products
- [ ] Confidence levels work: high (exact match), medium (similar), low (no match)
- [ ] Customer sends Instagram/Amazon/Flipkart link → AI extracts product info
- [ ] URL metadata extraction works for major platforms
- [ ] Fallback for blocked URLs → asks customer for screenshot/description
- [ ] Multi-product match shows top 3 options
- [ ] No match → offers to notify store owner
- [ ] Image analysis completes in under 5 seconds
- [ ] Cost per analysis stays under $0.02
- [ ] Graceful handling of blurry/irrelevant images

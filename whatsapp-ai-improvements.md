# WhatsApp AI — Feature Improvements Plan

> Review each feature below. Add your notes/comments under "Your Notes" section.
> After review, we will implement one by one.

---

## Feature 1: Show "Typing..." While AI Processes

**Problem**: Customer sends a message and sees nothing for 5-8 seconds. They think the message didn't go through or the system is broken.

**Current State**: AI processes the message → sends reply. No feedback in between.

**Solution**:
- Immediately mark the message as **read** (blue ticks appear)
- Send WhatsApp **typing indicator** (shows "typing..." bubble)
- Then send the actual AI reply
- Customer experience: Message → blue ticks → typing... → reply. Feels natural and human.

**Effort**: Small (10-15 lines of code)

**Your Notes**:
> _Yes : this is really needed - this shows some trust on us_

---

## Feature 2: Handle Invalid Customer Replies

**Problem**: AI asks "How many do you want?" and customer replies "ABCD" or random text. AI gets confused, may skip the step or crash.

**Current State**: AI tries to interpret everything — sometimes proceeds with wrong data.

**Solution**:
- Add strict validation rules in AI prompt for each step:
  - Quantity → must be a number between 1-99
  - Address → must be at least 10 characters
  - Product selection → must match a product name or say "yes/no"
- If invalid: AI politely re-asks (max 2 times)
- After 2 invalid tries: "No worries! Take your time. Just tell me when you're ready."
- Never proceed with bad data

**Effort**: Small (AI prompt changes only)

**Your Notes**:
> _Pincode is very important for delivery - We need to validate the delivery address for checking Pincode number it should be 6 digits - if customer forgots AI should ask please enter valids Pincode.
> Also we cam send Place holder formate like : Full name: House/flat Number: Strett, line: city: Pin; Mobile: - it like hint to them.
> ..._

---

## Feature 3: Fix Auto-Ordering Old Products (Stale State)

**Problem**: Customer orders a product, completes the order. Comes back after 1 hour and asks about a different product. AI sometimes re-triggers the old order or references old products.

**Current State**: We already reduced timeout from 30 → 15 minutes and added conversation boundary markers. But issue still happens sometimes.

**Solution**:
- After order is **completed or cancelled**: immediately reset ALL conversation state fields (productId, variantId, quantity, address, orderId, paymentLinkId) to null, step back to "idle"
- When conversation times out (15 min): also do full state reset
- Add explicit AI instruction: "NEVER reference or re-order products from any previous conversation. Each conversation starts fresh."
- Delete old conversation state record entirely instead of just updating step to "idle"

**Effort**: Small (state cleanup code + AI prompt)

**Your Notes**:
> _All good..._

---

## Feature 4: Make AI Super Reliable (Overall Performance)

**Problem**: AI sometimes gives wrong answers, picks wrong products, or stops responding after many messages.

**Current State**: AI works but not 100% reliable. Errors happen after 5-8 messages in a row.

**Solution**:
- **Better system prompt**: Rewrite the AI system prompt with very clear, strict rules:
  - "You are a shop assistant for [Store Name]"
  - "ONLY recommend products that exist in the catalog below"
  - "NEVER make up product names, prices, or details"
  - "If unsure, say: I'm not sure about that. Let me connect you with the owner."
  - "Always confirm product name and price before proceeding to order"
- **Reduce token usage**: Keep conversations short and focused
- **Error recovery**: If OpenAI returns an error, send a friendly fallback message instead of crashing
- **Conversation limit**: After 20 messages in one session, suggest: "For more help, I can connect you with [Owner Name]"

**Effort**: Medium (AI prompt rewrite + error handling)

**Your Notes**:
> _Write your thoughts here..._

---

## Feature 5: Route Customer to Real Owner

**Problem**: AI cannot handle all situations — complaints, refunds, custom requests, complex questions. Customer gets stuck with no human help.

**Current State**: AI has basic escalation for angry customers, but no proper handoff to the real owner.

**Solution**:
- AI detects these situations and escalates:
  - Customer is angry or frustrated (repeated complaints)
  - Customer explicitly asks to "talk to a person" or "call the owner"
  - AI fails to answer the same question 2 times
  - Refund/return/exchange requests
  - Order complaints or payment issues
- Escalation response: "Let me connect you with [Owner Name]. You can reach them directly at [owner WhatsApp number]. I'm also notifying them about your query right now."
- Send SMS notification to owner: "Customer [name] ([phone]) needs help. Topic: [brief summary]"
- Mark the chat as "needs attention" in the dashboard

**Effort**: Medium (AI prompt + SMS notification + dashboard flag)

**Your Notes**:
> _Write your thoughts here..._

---

## Feature 6: Voice Note Support (Speech to Text)

**Problem**: Many Indian customers prefer sending voice notes instead of typing — especially for addresses, product descriptions, or when they're busy. Currently AI ignores voice notes.

**Current State**: Voice notes received but not processed. AI doesn't respond to them.

**Solution**:
- Customer sends voice note on WhatsApp
- WhatsApp webhook sends us the audio file URL (`.ogg` format)
- Download the audio file from WhatsApp API
- Send to **OpenAI Whisper API** → converts speech to text
- Feed the text to our AI as a normal message
- AI responds normally — customer doesn't even notice the difference
- Supports Hindi, English, Hinglish, Telugu, and most Indian languages

**Cost**: OpenAI Whisper = **$0.006 per minute** of audio
- 30-second voice note = ₹0.25 (25 paisa)
- 1-minute voice note = ₹0.50
- Very affordable — even 100 voice notes/day = ₹50/day

**Effort**: Small-Medium (20-30 lines of code)

**Your Notes**:
> _Write your thoughts here..._

---

## Feature 7: Screenshot Product Matching (Image Recognition)

**Problem**: Customer sends a screenshot or photo and says "I want this product" or "Do you have this?". AI currently cannot see images.

**Current State**: Images received but not processed. AI ignores them or gives generic reply.

**Solution**:
- Customer sends an image on WhatsApp
- Download image from WhatsApp API
- Send to **OpenAI GPT-4o-mini Vision** along with product catalog
- AI prompt: "Customer sent this image. Look at the image and match it to the closest product in our catalog. If no match found, say so."
- AI responds: "This looks like [Product Name]! We have it for ₹[price]. Would you like to order?"
- If no match: "I couldn't find an exact match in our store. Let me connect you with the owner for help."

**Cost**: GPT-4o-mini Vision = **~$0.01-0.02 per image** (~₹1-2)
- Very affordable for the value it provides
- 50 image queries/day = ₹50-100/day

**Effort**: Medium (image download + OpenAI Vision API + AI prompt changes)

**Your Notes**:
> _Write your thoughts here..._

---

## Feature 8: Multi-Product Orders (Cart)

**Problem**: Customer wants to order 3 different products in one order. Currently each product creates a separate order with a separate payment link. Customer has to pay 3 times.

**Current State**: 1 product = 1 order. No cart concept.

**Solution**:
- Add a "cart" step in the conversation flow:
  - Customer picks Product A → AI adds to cart
  - AI asks: "Want to add more products?"
  - Customer says yes → picks Product B → added to cart
  - Customer says "that's all" or "done"
  - AI shows full cart: Product A (₹500 x 1), Product B (₹300 x 2) = Total ₹1100
  - Collects address once
  - Sends single payment link for ₹1100
  - Creates one order with multiple OrderItems
- Conversation state needs a new field: `cartItems` (JSON array)
- The `OrderItem` table already supports multiple items per order — no schema change needed

**Flow example**:
```
Customer: I want Blue Shoes
AI: Blue Nike Shoes - ₹2499. Added to cart! Want to add more products?
Customer: Yes, also Red T-shirt
AI: Red Polo T-shirt - ₹899. Added to cart! Anything else?
Customer: That's all
AI: Your cart:
    1. Blue Nike Shoes - ₹2499 x 1
    2. Red Polo T-shirt - ₹899 x 1
    Total: ₹3398
    Please share your delivery address.
```

**Effort**: Large (commerce flow changes, conversation state changes, AI prompt changes)

**Your Notes**:
> _Write your thoughts here..._

---

## Implementation Priority (Suggested)

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Typing indicator | Small | High — feels more human |
| 2 | Invalid input handling | Small | High — prevents errors |
| 3 | Stale state cleanup | Small | High — stops wrong orders |
| 4 | AI reliability improvements | Medium | High — overall quality |
| 5 | Route to owner | Medium | High — customer trust |
| 6 | Voice notes (Whisper) | Small | Very High — Indian customers love voice notes |
| 7 | Screenshot matching (Vision) | Medium | Very High — unique selling point |
| 8 | Multi-product cart | Large | Medium — nice to have |

---

## Total Estimated Cost Impact

| Feature | Cost per use | Daily estimate (50 customers) |
|---------|-------------|-------------------------------|
| AI text replies | ~₹0.10/reply | ~₹50/day |
| Voice notes | ~₹0.25/note | ~₹12/day (if 50% use voice) |
| Image matching | ~₹1.50/image | ~₹15/day (if 10 send images) |
| **Total** | | **~₹77/day (~₹2300/month)** |

All within your OpenAI budget of $120/month (₹10,000).

---

> **Next Step**: Review each feature above, add your notes, and tell me which ones to implement first. We will build and test one by one.

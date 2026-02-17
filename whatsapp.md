# BizManager - WhatsApp AI Commerce

## Vision

Auto-sell products via WhatsApp without human interaction, handling unlimited customer queries simultaneously using AI.

## Core Flow

```
Customer sends WhatsApp message
    → WhatsApp Business API receives it
    → Webhook hits our Backend
    → Backend fetches relevant data from DB (products, orders, customer info)
    → Sends context + message to AI (OpenAI)
    → AI generates intelligent response
    → Backend sends reply back via WhatsApp API
    → Chat stored in DB
    → Client sees everything on Dashboard (Live Chat UI)
```

## Feature Breakdown

### 1. General Enquiries (AI Auto-Reply)
- "Is your store open today?" → AI replies using business info
- "Send me your location" → AI replies with store address/Google Maps link
- "Do you have any new stock?" → AI checks DB for recently added products, replies
- "Do you have XL Zara jacket? Send sample pictures" → AI searches products, sends details + images
- Covers 100% of general business enquiries automatically

### 2. WhatsApp Ordering (Core Revenue Feature)
- Customer asks: "I want this product" or "Do you have X?"
- AI searches product DB → sends product details with price
- Customer confirms → AI asks for delivery address
- Address provided → Payment link sent to customer
- Payment completed → Order saved to dashboard, stock decremented
- Customer data auto-saved to contacts DB

### 3. Order Tracking
- Customer asks: "Where is my order?"
- AI looks up orders by customer's phone number
- Replies with order status, delivery status, tracking info

### 4. Live Chat Dashboard (Client Side)
- Client cannot use their WhatsApp on mobile while API is active
- All AI conversations stored in DB with full history
- Dashboard shows real-time chat UI (like a helpdesk inbox)
- Client can manually reply from dashboard → message sent to customer's WhatsApp
- Client can see AI-generated replies and override/correct if needed

## Technical Requirements

### New Database Tables
- `WhatsAppChat` - Conversations (per customer per tenant)
- `WhatsAppMessage` - Individual messages (sender, content, timestamp, type, status)
- `BusinessInfo` - Store hours, location, policies (AI context per tenant)

### External Integrations
- **WhatsApp Business API** - Send/receive messages (via Meta Cloud API or provider like Twilio/360dialog)
- **AI Provider** - OpenAI GPT for understanding queries and generating responses
- **Payment Gateway** - Razorpay/Stripe for payment links (Phase 2)

### API Endpoints Needed
- Webhook endpoint for incoming WhatsApp messages
- Chat history API for dashboard
- Manual reply API (client → customer)
- Business info CRUD (store hours, address, etc.)

## Implementation Phases

### Phase 1: Foundation
- WhatsApp Business API setup + webhook
- DB tables for chats/messages
- Basic AI integration (general enquiries only)
- Live Chat UI on dashboard

### Phase 2: AI Commerce
- Product search via AI + DB
- Order creation flow via WhatsApp
- Customer auto-registration
- Image sending support

### Phase 3: Payments & Tracking
- Payment gateway integration (Razorpay/Stripe)
- Payment link generation
- Order tracking queries
- Order status notifications

### Phase 4: Polish
- AI fine-tuning with business-specific context
- Multi-language support
- Message templates (WhatsApp approved)
- Analytics (messages handled, orders via WhatsApp, response times)

# PRD: SatyaSell Landing Page Redesign

## 1. Overview

**Goal**: Replace the current dark-themed tech landing page with a fresh, hand-drawn notebook-style page that speaks directly to Instagram sellers and small business owners in India.

**Target Audience**: Small & medium business sellers — especially Instagram page sellers who take orders via WhatsApp/DMs manually today.

**Theme**: Pure white background + blue ink — like writing on white paper with a blue pen. All icons, diagrams, and decorations should look hand-drawn/sketchy (CSS sketch style using rough.js or similar).

**Language**: Simple English. No technical jargon. Every sentence should be understood by someone who never used a tech tool.

---

## 2. Page Sections (Top to Bottom)

### 2.1 Navbar
- Logo: "SatyaSell" in a hand-drawn/sketchy font style
- Links: Features | How It Works | Demo
- CTA button: "Login" → `/client/login`

### 2.2 Hero Section
- **Title**: "AI Powered WhatsApp Auto Ordering System"
- **Subtitle**: "Your customers message on WhatsApp. AI handles the rest — products, address, payment, order. You just sit back."
- **Highlight badge** (hand-drawn underline style):
  - "NO PRICING PLANS"
  - "NO SUBSCRIPTION"
  - "Pay only 1% when you get an order. No order? Pay nothing. Zero Rupees."
- CTA: "Book a Free Demo" (scrolls to demo form)
- Secondary CTA: "See How It Works" (scrolls to flow section)

### 2.3 Flow Diagram — "How It Works"
A static hand-drawn style diagram showing 6 steps in a visual flow (arrows connecting each step):

```
Step 1: Customer messages on WhatsApp
   ↓
Step 2: AI shows your products & details
   ↓
Step 3: Customer picks a product
   ↓
Step 4: AI collects delivery address
   ↓
Step 5: Payment link sent automatically
   ↓
Step 6: Payment done → Order placed on your Dashboard!
```

- Each step shown as a hand-drawn card/box with a sketchy icon
- Simple one-line description per step
- A note below: "All of this happens automatically. No effort from you!"

### 2.4 Pain Points Section — "Are You Tired Of..."
Resonates with target audience's daily problems:

- "Sending payment links manually to every customer?"
- "Sharing QR codes one by one?"
- "Losing customers because you replied too late?"
- "Spending all day on WhatsApp just for orders?"
- "Missing orders because you forgot to reply?"

Styling: Each point in a hand-drawn checkbox style (crossed out), followed by:
**"SatyaSell handles all of this. Save 99% of your time."**

### 2.5 Features Section
Hand-drawn icon cards (sketch-style borders):

| Feature | Description |
|---------|-------------|
| **AI Product Upload** | Just upload product images — AI fills name, price, brand automatically. Add 20 products in minutes! |
| **WhatsApp AI Assistant** | AI answers all customer questions 24/7. No customer lost. |
| **Auto Payment Links** | India's most secure payment gateway. Links sent automatically — no manual effort. |
| **Order Dashboard** | See all orders, payments, history in one place. Online + Offline orders. |
| **Customer Data** | All your customer details saved safely. Never lose a customer again. |
| **Bulk WhatsApp Messages** | Send promotions, offers, and ads to all customers at once. |

### 2.6 Pricing Section — "Simplest Pricing Ever"
Big hand-drawn style card:

- **"100% FREE to use"**
- "No credit card needed. No debit card needed."
- "We charge only **1% per order** — and only when a customer actually pays."
- "No order? You pay ₹0. Zero. Nothing."
- Comparison line: "No monthly plans. No yearly plans. No hidden charges."

### 2.7 Security & Trust Section
- "Your data is stored in a world-class secure database"
- "No one has access to your data — only you"
- "India's best and most secure payment gateway for your customers"
- Hand-drawn lock/shield icon

### 2.8 Upcoming Features (small section)
- "Product promotions with discounts — coming soon!"
- "More AI tools to grow your business"

### 2.9 Demo Request Form — "Want to Talk? Book a Free Demo"
**Form fields:**
| Field | Type | Required |
|-------|------|----------|
| Name | Text | Yes |
| Mobile Number | Text (10 digits) | Yes |
| Business Instagram Page Link | URL | No |
| Website (if any) | URL | No |
| Tell us anything — questions, doubts, ideas | Textarea | No |

- Submit button: "Send My Request"
- Success message: "Thank you! We will contact you soon."

**Backend**: Stores in a new `Enquiry` DB table. Displayed on Super Admin dashboard.

### 2.10 Footer
- SatyaSell logo
- Phone: 9515456891
- Email: admin@satyasell.com
- "© 2026 SatyaSell. All rights reserved."

---

## 3. Design Specifications

### Theme
- **Background**: Pure white (`#FFFFFF`)
- **Primary color**: Blue (`#2563EB` / blue-600) — like blue pen ink
- **Text**: Dark gray/black for body, blue for headings and highlights
- **Accent**: Light blue backgrounds for cards (`#EFF6FF` / blue-50)

### Hand-Drawn / Sketch Style
- Use **rough.js** (or CSS equivalent) for:
  - Card borders (wobbly/sketchy lines)
  - Underlines on highlight text
  - Diagram boxes and arrows
  - Icons (hand-drawn SVG style)
- Font: Use a slightly informal/handwritten-feel font for headings (e.g., `Caveat` or `Patrick Hand` from Google Fonts) + clean sans-serif for body text
- All diagram connectors should be hand-drawn arrows (not straight CSS lines)

### Responsiveness
- Mobile-first design
- Flow diagram stacks vertically on mobile
- Demo form full-width on mobile

---

## 4. Database Changes

### New Table: `Enquiry`

```prisma
model Enquiry {
  id              String   @id @default(uuid())
  name            String
  mobile          String
  instagramLink   String?  @map("instagram_link")
  website         String?
  message         String?
  status          EnquiryStatus @default(pending)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("enquiries")
}

enum EnquiryStatus {
  pending
  contacted
  converted
  closed
}
```

### New API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/enquiry` | Submit demo request (public, no auth) |
| GET | `/api/superadmin/enquiries` | List all enquiries (super admin only) |
| PUT | `/api/superadmin/enquiries/[id]` | Update enquiry status |

### New Table: `PageView`

```prisma
model PageView {
  id        String   @id @default(uuid())
  page      String   @default("/")
  country   String?
  state     String?
  city      String?
  device    String?              // "mobile" | "desktop" | "tablet"
  browser   String?              // "Chrome" | "Safari" | "Firefox" etc.
  referrer  String?              // Where they came from (Instagram, Google, direct, etc.)
  ip        String?
  createdAt DateTime @default(now()) @map("created_at")

  @@index([createdAt])
  @@index([country])
  @@map("page_views")
}
```

**How location tracking works:**
- When someone visits the landing page, a lightweight API call is made: `POST /api/track`
- The API reads the visitor's IP from request headers (`x-forwarded-for` on Vercel)
- Uses a free IP geolocation API (ip-api.com — 45 req/min free, no key needed) to get country, state, city
- Device type + browser parsed from `User-Agent` header
- Referrer captured from `Referer` header (tells you if they came from Instagram, Google, etc.)
- Stored in `PageView` table — one row per visit
- No personal data collected, no cookies needed, privacy-friendly

### New API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/enquiry` | Submit demo request (public, no auth) |
| POST | `/api/track` | Log a page view with location (public, no auth) |
| GET | `/api/superadmin/enquiries` | List all enquiries (super admin only) |
| PUT | `/api/superadmin/enquiries/[id]` | Update enquiry status |
| GET | `/api/superadmin/analytics` | Get visitor analytics (super admin only) |

### Super Admin Dashboard Addition

**Enquiries Section:**
- Table showing: Name, Mobile, Instagram, Message, Status, Date
- Click to update status (pending → contacted → converted → closed)

**Visitor Analytics Section:**
- **Total visitors** — today, this week, this month, all time
- **Visitors by location** — Country-wise and State/City-wise counts (table)
- **Visitors by device** — Mobile vs Desktop vs Tablet (simple counts)
- **Visitors by referrer** — Where visitors come from (Instagram, Google, Direct, etc.)
- **Daily trend** — Simple bar/line showing visitors per day (last 30 days)
- All data from `PageView` table, aggregated via Prisma `groupBy` queries

---

## 5. File Changes Summary

| # | File | Action |
|---|------|--------|
| 1 | `app/page.tsx` | **Rewrite** — New landing page with sketch theme |
| 2 | `prisma/schema.prisma` | **Add** Enquiry, PageView models + EnquiryStatus enum |
| 3 | `app/api/enquiry/route.ts` | **Create** — POST handler for demo form |
| 4 | `app/api/track/route.ts` | **Create** — POST handler for page view tracking |
| 5 | `app/api/superadmin/enquiries/route.ts` | **Create** — GET list for super admin |
| 6 | `app/api/superadmin/enquiries/[id]/route.ts` | **Create** — PUT status update |
| 7 | `app/api/superadmin/analytics/route.ts` | **Create** — GET visitor analytics |
| 8 | `app/superadmin/page.tsx` | **Modify** — Add enquiries + analytics sections |
| 9 | `app/layout.tsx` | **Modify** — Add Google Font (Caveat/Patrick Hand) |
| 10 | `package.json` | **Add** rough.js dependency |

---

## 6. Out of Scope (for now)
- Multi-language support
- Blog / content pages
- SEO meta tags optimization (can do later)
- Real-time live visitor count
- Heatmaps / click tracking

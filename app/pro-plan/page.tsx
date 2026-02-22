import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SatyaSell - System Architecture',
  description: 'Complete technical architecture of SatyaSell Smart WhatsApp Auto Ordering System',
};

export default function ProPlanPage() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@400;600;700&display=swap');

  .arch-root * { margin: 0; padding: 0; box-sizing: border-box; }
  .arch-root {
    font-family: 'Caveat', cursive;
    background: #fff;
    color: #1e293b;
    padding: 40px 20px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .arch-root h1 {
    text-align: center;
    font-size: 48px;
    color: #2563EB;
    margin-bottom: 8px;
    border-bottom: 3px dashed #dc2626;
    display: inline-block;
    padding-bottom: 4px;
  }
  .arch-root .header { text-align: center; margin-bottom: 40px; }
  .arch-root .subtitle {
    font-size: 24px;
    color: #64748b;
    margin-top: 8px;
  }

  .arch-root .section {
    margin-bottom: 40px;
    border: 2.5px dashed #2563EB;
    border-radius: 20px;
    padding: 30px;
    position: relative;
    background: #fff;
  }
  .arch-root .section.red-border { border-color: #dc2626; }
  .arch-root .section.green-border { border-color: #16a34a; }

  .arch-root .section-title {
    position: absolute;
    top: -18px;
    left: 30px;
    background: #fff;
    padding: 0 16px;
    font-size: 28px;
    font-weight: 700;
    color: #2563EB;
  }
  .arch-root .section-title.red { color: #dc2626; }
  .arch-root .section-title.green { color: #16a34a; }

  .arch-root .flow-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
    margin-top: 10px;
  }

  .arch-root .card {
    border: 2px dashed #93c5fd;
    border-radius: 16px;
    padding: 20px 16px;
    text-align: center;
    background: #eff6ff;
    transition: transform 0.2s;
  }
  .arch-root .card:hover { transform: scale(1.03); }
  .arch-root .card.red-card { border-color: #fca5a5; background: #fef2f2; }
  .arch-root .card.green-card { border-color: #86efac; background: #f0fdf4; }
  .arch-root .card.purple-card { border-color: #c4b5fd; background: #f5f3ff; }
  .arch-root .card.orange-card { border-color: #fed7aa; background: #fff7ed; }

  .arch-root .card-icon { font-size: 36px; margin-bottom: 8px; display: block; }
  .arch-root .card-title { font-size: 22px; font-weight: 700; color: #1e40af; margin-bottom: 4px; }
  .arch-root .card.red-card .card-title { color: #dc2626; }
  .arch-root .card.green-card .card-title { color: #16a34a; }
  .arch-root .card.purple-card .card-title { color: #7c3aed; }
  .arch-root .card.orange-card .card-title { color: #ea580c; }
  .arch-root .card-desc { font-size: 17px; color: #64748b; line-height: 1.3; }

  .arch-root .arrow-down {
    text-align: center;
    font-size: 36px;
    color: #2563EB;
    margin: 16px 0;
    letter-spacing: 20px;
  }
  .arch-root .arrow-down.red { color: #dc2626; }
  .arch-root .arrow-down.green { color: #16a34a; }

  .arch-root .main-flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    margin: 20px 0;
  }
  .arch-root .flow-box {
    border: 3px dashed #2563EB;
    border-radius: 16px;
    padding: 16px 24px;
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    color: #2563EB;
    background: #eff6ff;
    min-width: 160px;
  }
  .arch-root .flow-box.red { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
  .arch-root .flow-box.green { border-color: #16a34a; color: #16a34a; background: #f0fdf4; }
  .arch-root .flow-arrow { font-size: 32px; color: #2563EB; }

  .arch-root .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-top: 10px;
  }
  .arch-root .tech-item {
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    background: #f8fafc;
  }
  .arch-root .tech-item span { display: block; font-size: 28px; margin-bottom: 4px; }

  .arch-root .db-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 10px;
  }
  .arch-root .db-table { border: 2px dashed #c4b5fd; border-radius: 12px; overflow: hidden; }
  .arch-root .db-table-header { background: #7c3aed; color: #fff; padding: 10px 16px; font-size: 20px; font-weight: 700; }
  .arch-root .db-table-body { padding: 12px 16px; font-size: 16px; color: #4b5563; line-height: 1.6; background: #f5f3ff; }
  .arch-root .db-field { font-family: 'Inter', sans-serif; font-size: 13px; }
  .arch-root .db-field b { color: #7c3aed; }

  .arch-root .legend {
    display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;
    margin-top: 30px; padding: 20px; border: 2px dashed #e2e8f0; border-radius: 16px;
  }
  .arch-root .legend-item { display: flex; align-items: center; gap: 8px; font-size: 18px; }
  .arch-root .legend-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid; }

  .arch-root .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
  @media (max-width: 768px) { .arch-root .two-col { grid-template-columns: 1fr; } }

  .arch-root .note { font-family: 'Inter', sans-serif; font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; }
  .arch-root .api-card { margin-bottom: 8px; text-align: left; font-family: 'Inter', sans-serif; font-size: 13px; }
  .arch-root .api-label { font-size: 22px; font-weight: 700; color: #2563EB; margin-bottom: 10px; }
</style>

<div class="arch-root">

<div class="header">
  <h1>SatyaSell - System Architecture</h1>
  <p class="subtitle">Complete technical architecture of Smart WhatsApp Auto Ordering System</p>
</div>

<!-- 1. CUSTOMER ENTRY POINTS -->
<div class="section">
  <div class="section-title">1. Customer Entry Points</div>
  <div class="flow-grid">
    <div class="card green-card"><span class="card-icon">💬</span><div class="card-title">Says &quot;Hi&quot;</div><div class="card-desc">Customer starts a conversation on WhatsApp</div></div>
    <div class="card green-card"><span class="card-icon">📸</span><div class="card-title">Sends Screenshot</div><div class="card-desc">Shares product image for matching</div></div>
    <div class="card green-card"><span class="card-icon">🔗</span><div class="card-title">E-shop Link</div><div class="card-desc">Shares product link from website</div></div>
    <div class="card green-card"><span class="card-icon">📱</span><div class="card-title">From Instagram</div><div class="card-desc">Customer comes via Instagram DM/bio link</div></div>
    <div class="card green-card"><span class="card-icon">🛒</span><div class="card-title">E-commerce</div><div class="card-desc">Redirected from online store</div></div>
    <div class="card green-card"><span class="card-icon">🎤</span><div class="card-title">Voice Note</div><div class="card-desc">Sends voice message, auto-transcribed</div></div>
  </div>
</div>

<div class="arrow-down">&#9660; &#9660; &#9660;</div>

<!-- 2. WHATSAPP INTEGRATION LAYER -->
<div class="section green-border">
  <div class="section-title green">2. WhatsApp Integration Layer</div>
  <div class="flow-grid">
    <div class="card"><span class="card-icon">📡</span><div class="card-title">Webhook Receiver</div><div class="card-desc">/api/webhook/whatsapp receives all incoming messages from Meta</div></div>
    <div class="card"><span class="card-icon">📝</span><div class="card-title">Message Parser</div><div class="card-desc">Parses text, images, voice, interactive replies, locations</div></div>
    <div class="card"><span class="card-icon">🔄</span><div class="card-title">Conversation State</div><div class="card-desc">Tracks state: greeting, browsing, ordering, address, payment</div></div>
    <div class="card"><span class="card-icon">📤</span><div class="card-title">Message Sender</div><div class="card-desc">Sends text, images, interactive buttons, lists via WhatsApp API</div></div>
    <div class="card"><span class="card-icon">⌨️</span><div class="card-title">Typing Indicator</div><div class="card-desc">Shows &quot;typing...&quot; to customer while processing</div></div>
    <div class="card"><span class="card-icon">👤</span><div class="card-title">Owner Routing</div><div class="card-desc">Routes complex queries to shop owner&apos;s WhatsApp</div></div>
  </div>
</div>

<div class="arrow-down green">&#9660; &#9660; &#9660;</div>

<!-- 3. SMART COMMERCE ENGINE -->
<div class="section red-border">
  <div class="section-title red">3. Smart Commerce Engine (Core Brain)</div>
  <div class="flow-grid">
    <div class="card red-card"><span class="card-icon">🧠</span><div class="card-title">Smart Responder</div><div class="card-desc">OpenAI GPT processes customer messages, understands intent</div></div>
    <div class="card red-card"><span class="card-icon">🔍</span><div class="card-title">Product Search</div><div class="card-desc">Fuzzy matching by name, brand, category from shop catalog</div></div>
    <div class="card red-card"><span class="card-icon">🖼️</span><div class="card-title">Image Matching</div><div class="card-desc">Matches customer screenshots to products using vision</div></div>
    <div class="card red-card"><span class="card-icon">📋</span><div class="card-title">Order Builder</div><div class="card-desc">Confirms product, quantity, collects address step-by-step</div></div>
    <div class="card red-card"><span class="card-icon">✅</span><div class="card-title">Order Confirmation</div><div class="card-desc">Shows order summary before payment: name, price, qty</div></div>
    <div class="card red-card"><span class="card-icon">🎙️</span><div class="card-title">Voice Transcription</div><div class="card-desc">Converts voice notes to text using OpenAI Whisper</div></div>
  </div>
</div>

<div class="arrow-down red">&#9660; &#9660; &#9660;</div>

<!-- 4. COMPLETE ORDER FLOW -->
<div class="section">
  <div class="section-title">4. Complete Order Flow</div>
  <div class="main-flow">
    <div class="flow-box green">Customer Messages</div>
    <span class="flow-arrow">&#10132;</span>
    <div class="flow-box">Smart Reply</div>
    <span class="flow-arrow">&#10132;</span>
    <div class="flow-box">Show Products</div>
    <span class="flow-arrow">&#10132;</span>
    <div class="flow-box red">Confirm Order</div>
    <span class="flow-arrow">&#10132;</span>
    <div class="flow-box">Collect Address</div>
    <span class="flow-arrow">&#10132;</span>
    <div class="flow-box red">Payment Link</div>
    <span class="flow-arrow">&#10132;</span>
    <div class="flow-box green">Order Complete!</div>
  </div>
</div>

<div class="arrow-down">&#9660; &#9660; &#9660;</div>

<!-- 5 & 6. PAYMENT + DASHBOARD -->
<div class="two-col">
  <div class="section red-border">
    <div class="section-title red">5. Payment Gateway</div>
    <div class="flow-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="card red-card"><span class="card-icon">💳</span><div class="card-title">Cashfree</div><div class="card-desc">Primary gateway. Creates payment links. Webhook confirms payment. ~1.1% fee.</div></div>
      <div class="card orange-card"><span class="card-icon">💰</span><div class="card-title">Razorpay</div><div class="card-desc">Alternate gateway. Auto-detects if Cashfree not configured.</div></div>
    </div>
    <div style="margin-top: 16px;">
      <div class="card" style="border-color: #fca5a5;"><span class="card-icon">🔐</span><div class="card-title" style="color: #dc2626;">Webhook Security</div><div class="card-desc">HMAC-SHA256 signature verification on every payment callback. Per-tenant API keys stored in DB.</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">6. Shop Owner Dashboard</div>
    <div class="flow-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="card"><span class="card-icon">📦</span><div class="card-title">Products</div><div class="card-desc">CRUD + Smart Upload (image auto-fill name, price, brand)</div></div>
      <div class="card"><span class="card-icon">🛍️</span><div class="card-title">Orders</div><div class="card-desc">All orders, payment status, online + offline together</div></div>
      <div class="card"><span class="card-icon">👥</span><div class="card-title">Customers</div><div class="card-desc">Customer data, order history, phone, address</div></div>
      <div class="card"><span class="card-icon">⚙️</span><div class="card-title">Settings</div><div class="card-desc">WhatsApp config, payment keys, business info</div></div>
    </div>
  </div>
</div>

<div class="arrow-down">&#9660; &#9660; &#9660;</div>

<!-- 7. DATABASE SCHEMA -->
<div class="section" style="border-color: #7c3aed;">
  <div class="section-title" style="color: #7c3aed;">7. Database Schema (Prisma + PostgreSQL)</div>
  <div class="db-grid">
    <div class="db-table"><div class="db-table-header">Client (Shop Owner)</div><div class="db-table-body"><div class="db-field"><b>id</b>, name, mobile, email</div><div class="db-field"><b>whatsappPhoneId</b></div><div class="db-field"><b>whatsappToken</b></div><div class="db-field"><b>businessInfo</b> (1:1)</div><div class="db-field"><b>products[]</b>, <b>orders[]</b></div></div></div>
    <div class="db-table"><div class="db-table-header">Product</div><div class="db-table-body"><div class="db-field"><b>id</b>, name, price, brand</div><div class="db-field"><b>category</b>, description</div><div class="db-field"><b>imageUrl</b>, stock</div><div class="db-field"><b>clientId</b> (belongs to shop)</div></div></div>
    <div class="db-table"><div class="db-table-header">Order</div><div class="db-table-body"><div class="db-field"><b>id</b>, orderNumber</div><div class="db-field"><b>productName</b>, qty, total</div><div class="db-field"><b>paymentStatus</b>: paid/unpaid</div><div class="db-field"><b>cashfreeLinkId</b></div><div class="db-field"><b>cashfreePaymentId</b></div><div class="db-field"><b>address</b>, customerPhone</div></div></div>
    <div class="db-table"><div class="db-table-header">Customer</div><div class="db-table-body"><div class="db-field"><b>id</b>, name, phone</div><div class="db-field"><b>address</b></div><div class="db-field"><b>orders[]</b> (history)</div><div class="db-field"><b>clientId</b> (belongs to shop)</div></div></div>
    <div class="db-table"><div class="db-table-header">BusinessInfo</div><div class="db-table-body"><div class="db-field"><b>cashfreeAppId</b></div><div class="db-field"><b>cashfreeSecretKey</b></div><div class="db-field"><b>paymentGateway</b>: enum</div><div class="db-field"><b>businessName</b>, address</div></div></div>
    <div class="db-table"><div class="db-table-header">Conversation</div><div class="db-table-body"><div class="db-field"><b>customerPhone</b></div><div class="db-field"><b>state</b>: greeting/browsing/</div><div class="db-field">ordering/address/payment</div><div class="db-field"><b>pendingOrder</b> (JSON)</div><div class="db-field"><b>lastActivity</b> timestamp</div></div></div>
  </div>
</div>

<div class="arrow-down" style="color: #7c3aed;">&#9660; &#9660; &#9660;</div>

<!-- 8. TECH STACK -->
<div class="section">
  <div class="section-title">8. Tech Stack &amp; Infrastructure</div>
  <div class="tech-grid">
    <div class="tech-item"><span>⚡</span>Next.js 14</div>
    <div class="tech-item"><span>🔷</span>TypeScript</div>
    <div class="tech-item"><span>🎨</span>Tailwind CSS</div>
    <div class="tech-item"><span>💾</span>Prisma ORM</div>
    <div class="tech-item"><span>🐘</span>PostgreSQL</div>
    <div class="tech-item"><span>▲</span>Vercel</div>
    <div class="tech-item"><span>📱</span>Meta WhatsApp API</div>
    <div class="tech-item"><span>🧠</span>OpenAI GPT-4</div>
    <div class="tech-item"><span>🎙️</span>OpenAI Whisper</div>
    <div class="tech-item"><span>💳</span>Cashfree</div>
    <div class="tech-item"><span>💰</span>Razorpay</div>
    <div class="tech-item"><span>✏️</span>RoughJS</div>
  </div>
</div>

<!-- 9. API ROUTES -->
<div class="section red-border">
  <div class="section-title red">9. API Routes Map</div>
  <div class="two-col">
    <div>
      <div class="api-label">Webhooks (External)</div>
      <div class="card api-card"><b>POST</b> /api/webhook/whatsapp<br><span style="color:#64748b">Receives all WhatsApp messages from Meta</span></div>
      <div class="card api-card"><b>POST</b> /api/webhook/cashfree<br><span style="color:#64748b">Payment confirmation callbacks</span></div>
      <div class="card api-card"><b>POST</b> /api/webhook/razorpay<br><span style="color:#64748b">Razorpay payment callbacks</span></div>
    </div>
    <div>
      <div class="api-label">Dashboard APIs</div>
      <div class="card api-card"><b>GET/POST/PUT</b> /api/client/products<br><span style="color:#64748b">Product CRUD + Smart upload</span></div>
      <div class="card api-card"><b>GET/POST</b> /api/client/orders<br><span style="color:#64748b">Order management</span></div>
      <div class="card api-card"><b>GET/PUT</b> /api/client/business-info<br><span style="color:#64748b">Settings, payment keys, WhatsApp config</span></div>
    </div>
  </div>
</div>

<!-- 10. MULTI-TENANT -->
<div class="section green-border">
  <div class="section-title green">10. Multi-Tenant Architecture</div>
  <div class="main-flow">
    <div class="flow-box green">Shop A<br><span style="font-size:16px;">Own products, orders, customers, WhatsApp number, payment keys</span></div>
    <div class="flow-box green">Shop B<br><span style="font-size:16px;">Own products, orders, customers, WhatsApp number, payment keys</span></div>
    <div class="flow-box green">Shop C<br><span style="font-size:16px;">Own products, orders, customers, WhatsApp number, payment keys</span></div>
  </div>
  <div style="text-align: center; margin-top: 16px;">
    <div class="flow-box" style="display: inline-block;">Super Admin Dashboard<br><span style="font-size:16px;">Manages all shops, views enquiries, visitor analytics</span></div>
  </div>
</div>

<!-- 11. SECURITY -->
<div class="section red-border" style="margin-top: 40px;">
  <div class="section-title red">11. Security Architecture</div>
  <div class="flow-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
    <div class="card red-card"><span class="card-icon">🔒</span><div class="card-title">JWT Auth</div><div class="card-desc">Token-based authentication for dashboard. Middleware protects all /client routes.</div></div>
    <div class="card red-card"><span class="card-icon">🔑</span><div class="card-title">Per-Tenant Keys</div><div class="card-desc">Each shop has separate WhatsApp token, payment keys. No cross-tenant access.</div></div>
    <div class="card red-card"><span class="card-icon">✍️</span><div class="card-title">Webhook Signatures</div><div class="card-desc">HMAC-SHA256 verification on all Cashfree &amp; WhatsApp webhooks.</div></div>
    <div class="card red-card"><span class="card-icon">🛡️</span><div class="card-title">Input Validation</div><div class="card-desc">Sanitized phone numbers, names, addresses. Stale state auto-cleanup.</div></div>
  </div>
</div>

<!-- LEGEND -->
<div class="legend">
  <div class="legend-item"><div class="legend-dot" style="background: #eff6ff; border-color: #2563EB;"></div>Core System / Blue = Primary</div>
  <div class="legend-item"><div class="legend-dot" style="background: #fef2f2; border-color: #dc2626;"></div>Red = Critical / Payment / Security</div>
  <div class="legend-item"><div class="legend-dot" style="background: #f0fdf4; border-color: #16a34a;"></div>Green = Customer / WhatsApp</div>
  <div class="legend-item"><div class="legend-dot" style="background: #f5f3ff; border-color: #7c3aed;"></div>Purple = Database</div>
  <div class="legend-item"><div class="legend-dot" style="background: #fff7ed; border-color: #ea580c;"></div>Orange = Alternate/Fallback</div>
</div>

<p class="note">SatyaSell Architecture v1.0 &mdash; Smart WhatsApp Auto Ordering System &mdash; &copy; 2026</p>

</div>
`,
      }}
    />
  );
}

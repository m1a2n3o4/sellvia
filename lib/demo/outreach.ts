import { SITE } from '@/lib/site';
import { shade } from '@/lib/store/colors';

export interface OutreachInput {
  businessName: string;
  mobile: string;
  slug: string;
  logo?: string | null;
  themeColor?: string;
  accentColor?: string;
  sample?: { name: string; price: number }[];
}

const SITE_URL = SITE.url;

export const storeLink = (d: OutreachInput) => `${SITE_URL}/store/${d.slug}`;

/** wa.me link that opens the SatyaSell number with a ready question about the business's own product. */
export function testChatLink(d: OutreachInput) {
  const p = d.sample?.[0]?.name;
  return SITE.whatsappUrl(p ? `Do you have ${p}?` : 'Hi');
}

/** Simple, non-technical WhatsApp message to send to the business owner. */
export function buildMessage(d: OutreachInput, pin = '<PIN>') {
  const p1 = d.sample?.[0]?.name || 'your best seller';
  const p2 = d.sample?.[1]?.name;
  return `Hi! 👋 This is Manohar from SatyaSell.

I saw *${d.businessName}* on Instagram and loved your products 😍
So I made something special for you - *100% FREE*, and nothing is live for your customers:

🛍️ *1. Your own online shop*
With your logo and your products. Customers can order in 1 minute.
👉 ${storeLink(d)}

🤖 *2. Your AI Employee - works for you 24 x 7, FREE!*
It answers every customer question, tells prices, sends photos and *takes the order on WhatsApp* - even at midnight, even when you are busy.
✅ Try it now - just ask it like a customer:
👉 ${testChatLink(d)}
(Ask: "Do you have ${p1}?"${p2 ? `, "Price of ${p2}?"` : ''} and then "I want 1 kg" - see how it takes the order!)

📊 *3. Your own order book (dashboard)*
All orders, customers and products in one place. You can edit prices and add products.
👉 ${SITE_URL}/client/login
Login: ${d.mobile}   PIN: ${pin}

⏱️ Takes just 2 minutes to try. Test orders are not real - nobody will be charged.

If you like it, we set it up properly. *No setup cost - you pay only 1% on the orders you get.*
Don't want it? Just reply "remove" and I will delete everything right away. Your data stays private 🙏`;
}

/* ------------------------------------------------------------------ */
/* Poster (1080 x 1350, drawn on a canvas - works in the browser only) */
/* ------------------------------------------------------------------ */

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function fit(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, maxW: number) {
  let sz = size;
  do { ctx.font = `${weight} ${sz}px Inter, Arial, sans-serif`; sz -= 1; } while (ctx.measureText(text).width > maxW && sz > 16);
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function bubble(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, right: boolean, fill: string, color: string): number {
  ctx.font = '500 30px Inter, Arial, sans-serif';
  const lines = wrap(ctx, text, maxW - 48);
  const w = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 48);
  const h = lines.length * 40 + 28;
  const bx = right ? x - w : x;
  ctx.fillStyle = fill;
  rr(ctx, bx, y, w, h, 24);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  lines.forEach((l, i) => ctx.fillText(l, bx + 24, y + 44 + i * 40));
  return h + 16;
}

export async function drawPoster(canvas: HTMLCanvasElement, d: OutreachInput): Promise<void> {
  const W = 1080, H = 1600;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const theme = d.themeColor || '#2563eb';
  const accent = d.accentColor || '#f59e0b';
  const logo = d.logo ? await loadImage(d.logo) : null;

  // background
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, shade(theme, -0.55));
  g.addColorStop(0.55, theme);
  g.addColorStop(1, shade(accent, -0.1));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.arc(960, 120, 260, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(80, 1180, 300, 0, Math.PI * 2); ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';

  // logo
  const cx = W / 2, cy = 150, r = 96;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  if (logo) {
    const s = Math.max((r * 2) / logo.width, (r * 2) / logo.height);
    ctx.drawImage(logo, cx - (logo.width * s) / 2, cy - (logo.height * s) / 2, logo.width * s, logo.height * s);
  } else {
    ctx.fillStyle = theme; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#fff'; ctx.font = '800 110px Inter, Arial, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText((d.businessName || 'S').charAt(0).toUpperCase(), cx, cy + 6); ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();

  // business name
  ctx.fillStyle = '#fff';
  ctx.font = '800 54px Inter, Arial, sans-serif';
  const nameLines = wrap(ctx, d.businessName, 900).slice(0, 2);
  nameLines.forEach((l, i) => ctx.fillText(l, cx, 310 + i * 60));
  let y = 310 + nameLines.length * 60 + 10;

  // tag
  ctx.font = '700 26px Inter, Arial, sans-serif';
  const tag = '🎁  A FREE DEMO MADE FOR YOU';
  const tw = ctx.measureText(tag).width + 56;
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; rr(ctx, cx - tw / 2, y, tw, 52, 26); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillText(tag, cx, y + 36);
  y += 150;

  // headline
  ctx.font = '800 84px Inter, Arial, sans-serif';
  ctx.fillText('Meet your', cx, y);
  ctx.fillStyle = accent === theme ? '#fde68a' : '#fde68a';
  ctx.fillText('AI Employee 🤖', cx, y + 92);
  y += 125;
  ctx.fillStyle = '#fff';
  ctx.font = '600 38px Inter, Arial, sans-serif';
  ctx.fillText('Works for you 24 × 7  •  FREE', cx, y + 18);
  y += 62;

  // chat card
  const cardX = 90, cardW = W - 180;
  const sample = d.sample?.[0];
  const prod = sample?.name || 'your product';
  const price = sample?.price ? `₹${sample.price}` : '';
  const msgs: { t: string; right: boolean }[] = [
    { t: `Do you have ${prod}?`, right: true },
    { t: `Yes! ${prod}${price ? ' - ' + price : ''} 😊 How much do you want?`, right: false },
    { t: 'I want 1 kg. Deliver to Hyderabad', right: true },
    { t: '✅ Order placed! We will deliver soon.', right: false },
  ];
  // measure height
  ctx.font = '500 30px Inter, Arial, sans-serif';
  let ch = 36;
  msgs.forEach((m) => { ch += wrap(ctx, m.t, 620 - 48).length * 40 + 28 + 16; });
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#ece5dd'; rr(ctx, cardX, y, cardW, ch + 10, 36); ctx.fill();
  ctx.restore();
  let by = y + 26;
  msgs.forEach((m) => {
    const used = bubble(ctx, m.t, m.right ? cardX + cardW - 28 : cardX + 28, by, 620, m.right, m.right ? '#d9fdd3' : '#ffffff', '#111');
    by += used;
  });
  ctx.textAlign = 'center';
  y += ch + 50;

  // features
  const feats = ['💬 Answers every question', '📸 Shares price & photos', '🛒 Takes orders'];
  const fw = (W - 180 - 40) / 3;
  feats.forEach((f, i) => {
    const fx = 90 + i * (fw + 20);
    ctx.fillStyle = 'rgba(255,255,255,0.16)'; rr(ctx, fx, y, fw, 96, 22); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 25px Inter, Arial, sans-serif';
    const parts = wrap(ctx, f, fw - 24);
    parts.slice(0, 2).forEach((l, k) => ctx.fillText(l, fx + fw / 2, y + 40 + k * 32 - (parts.length === 1 ? -8 : 6)));
  });
  y += 128;

  // call to action
  ctx.fillStyle = '#fff'; rr(ctx, 90, y, W - 180, 150, 30); ctx.fill();
  ctx.fillStyle = shade(theme, -0.4);
  const cta = `Try it now: WhatsApp “Hi” to ${SITE.phoneDisplay}`;
  fit(ctx, cta, 800, 38, 820);
  ctx.fillText(cta, cx, y + 60);
  ctx.fillStyle = '#374151';
  const shop = `🛍️ Your shop: satyasell.com/store/${d.slug}`;
  fit(ctx, shop, 600, 28, 820);
  ctx.fillText(shop, cx, y + 110);
  y += 190;

  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '600 26px Inter, Arial, sans-serif';
  ctx.fillText('No setup cost  •  Pay only 1% on orders you get', cx, y);
  ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '600 24px Inter, Arial, sans-serif';
  ctx.fillText('SatyaSell  •  Tools for Instagram sellers', cx, H - 36);
}

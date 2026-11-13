/**
 * SatyaSell's OWN WhatsApp Business number (platform account).
 * Used for platform messages such as login/checkout OTPs - NOT for tenants'
 * stores, which use their own credentials stored in BusinessInfo.
 *
 * Env vars (set on Vercel):
 *   PLATFORM_WHATSAPP_TOKEN            permanent System User token
 *   PLATFORM_WHATSAPP_PHONE_NUMBER_ID  phone number ID of the platform number
 *   PLATFORM_WHATSAPP_OTP_TEMPLATE     approved authentication template (default: satyasell_otp)
 *   PLATFORM_WHATSAPP_TEMPLATE_LANG    template language code (default: en)
 */
const GRAPH_URL = 'https://graph.facebook.com/v21.0';

export function getPlatformPhoneNumberId(): string {
  return process.env.PLATFORM_WHATSAPP_PHONE_NUMBER_ID || '';
}

export function isPlatformWhatsAppConfigured(): boolean {
  return !!(process.env.PLATFORM_WHATSAPP_TOKEN && process.env.PLATFORM_WHATSAPP_PHONE_NUMBER_ID);
}

/** Returns E.164 digits without '+', e.g. 919876543210, or null if invalid. */
function toWhatsAppNumber(mobile: string): string | null {
  const digits = mobile.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  if (last10.length !== 10) return null;
  return `91${last10}`;
}

interface TemplateOptions {
  to: string;
  templateName: string;
  bodyParams?: string[];
  /** For authentication templates with a "Copy code" button: pass the OTP. */
  otpButtonParam?: string;
  language?: string;
}

export async function sendPlatformTemplate({
  to,
  templateName,
  bodyParams = [],
  otpButtonParam,
  language = process.env.PLATFORM_WHATSAPP_TEMPLATE_LANG || 'en',
}: TemplateOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.PLATFORM_WHATSAPP_TOKEN;
  const phoneNumberId = getPlatformPhoneNumberId();
  if (!token || !phoneNumberId) {
    console.error('[PlatformWhatsApp] Not configured: token', token ? 'set' : 'MISSING', '/ phone id', phoneNumberId ? 'set' : 'MISSING');
    return { success: false, error: 'Platform WhatsApp not configured' };
  }

  const recipient = toWhatsAppNumber(to);
  if (!recipient) return { success: false, error: 'Invalid phone number' };

  const components: object[] = [];
  if (bodyParams.length) {
    components.push({
      type: 'body',
      parameters: bodyParams.map((text) => ({ type: 'text', text })),
    });
  }
  if (otpButtonParam) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: otpButtonParam }],
    });
  }

  try {
    const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'template',
        template: { name: templateName, language: { code: language }, components },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[PlatformWhatsApp] Send failed:', {
        code: data.error?.code,
        type: data.error?.type,
        message: data.error?.message,
      });
      return { success: false, error: data.error?.message || 'Send failed' };
    }
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    console.error('[PlatformWhatsApp] Send error:', err);
    return { success: false, error: 'Network error' };
  }
}

/** Send an OTP via the approved authentication template. */
export function sendPlatformOtp(mobile: string, otp: string) {
  return sendPlatformTemplate({
    to: mobile,
    templateName: process.env.PLATFORM_WHATSAPP_OTP_TEMPLATE || 'satyasell_otp',
    bodyParams: [otp],
    otpButtonParam: otp,
  });
}

/** Send a free-form text on the platform number (only valid within 24h of the user's last message). */
export async function sendPlatformText(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.PLATFORM_WHATSAPP_TOKEN;
  const phoneNumberId = getPlatformPhoneNumberId();
  if (!token || !phoneNumberId) {
    console.error('[PlatformWhatsApp] Not configured:', {
      PLATFORM_WHATSAPP_TOKEN: token ? 'set' : 'MISSING',
      PLATFORM_WHATSAPP_PHONE_NUMBER_ID: phoneNumberId ? 'set' : 'MISSING',
    });
    return { success: false, error: 'Platform WhatsApp not configured' };
  }
  try {
    const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'text',
        text: { body: message, preview_url: false },
      }),
    });
    const data = await res.json();
    console.log('[PlatformWhatsApp] Text send status:', res.status);
    if (!res.ok) {
      console.error('[PlatformWhatsApp] Text failed:', { code: data.error?.code, message: data.error?.message });
      return { success: false, error: data.error?.message };
    }
    return { success: true };
  } catch (err) {
    console.error('[PlatformWhatsApp] Text error:', err);
    return { success: false, error: 'Network error' };
  }
}

/** Auto-reply for messages people send to SatyaSell's own number. */
export function platformAutoReply(text: string): string {
  const t = text.toLowerCase();
  if (/\b(price|pricing|cost|charges?|fee)\b/.test(t)) {
    return 'SatyaSell is free to start - you pay only 1% per order. See details: https://www.satyasell.com/#pricing\n\nReply DEMO to book a free demo.';
  }
  if (/\b(demo|book|trial)\b/.test(t)) {
    return 'Great! Share your name, business name and Instagram link, and our team will set up a free demo for you. Or book here: https://www.satyasell.com/#demo';
  }
  return (
    'Hi! Welcome to SatyaSell 👋\n\n' +
    'We help Instagram sellers and small businesses take orders and payments on WhatsApp automatically.\n\n' +
    'Reply:\n• PRICING - plans and fees\n• DEMO - book a free demo\n\n' +
    'Website: https://www.satyasell.com\nOr call us: +91 77802 25235'
  );
}

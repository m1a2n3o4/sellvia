import crypto from 'crypto';

function getCashfreeBaseUrl() {
  const env = process.env.CASHFREE_ENV || 'sandbox';
  return env === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

interface CreateCashfreeLinkInput {
  amount: number; // in rupees
  customerName: string;
  customerPhone: string;
  description: string;
  orderId: string;
  cashfreeAppId: string;
  cashfreeSecretKey: string;
}

interface CashfreeLinkResponse {
  link_id: string;
  link_url: string;
  link_status: string;
}

/**
 * Create a Cashfree payment link using the REST API.
 */
export async function createCashfreePaymentLink(
  input: CreateCashfreeLinkInput
): Promise<CashfreeLinkResponse> {
  const { amount, customerName, customerPhone, description, orderId, cashfreeAppId, cashfreeSecretKey } = input;

  // Normalize phone: strip +91 or 91 prefix to get 10-digit number
  const phone = customerPhone.replace(/^\+?91/, '').slice(-10);

  // Sanitize customer name: Cashfree only accepts letters, spaces, dots, hyphens
  const safeName = customerName.replace(/[^a-zA-Z\s.\-]/g, '').trim() || 'Customer';

  const linkId = `order_${orderId.slice(0, 8)}_${Date.now()}`;

  const res = await fetch(`${getCashfreeBaseUrl()}/links`, {
    method: 'POST',
    headers: {
      'x-client-id': cashfreeAppId,
      'x-client-secret': cashfreeSecretKey,
      'x-api-version': '2023-08-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      link_id: linkId,
      link_amount: amount,
      link_currency: 'INR',
      link_purpose: description,
      customer_details: {
        customer_phone: phone,
        customer_name: safeName,
      },
      link_notify: { send_sms: false, send_email: false },
      link_meta: {
        notify_url: 'https://www.satyasell.com/api/webhook/cashfree',
      },
      link_notes: { order_id: orderId },
    }),
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      const text = await res.text().catch(() => 'no body');
      errorData = { message: `HTTP ${res.status}: ${text}` };
    }
    console.error('[Cashfree] Payment link creation failed:', JSON.stringify(errorData));
    throw new Error(errorData?.message || `Cashfree API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    link_id: data.link_id,
    link_url: data.link_url,
    link_status: data.link_status,
  };
}

/**
 * Verify Cashfree webhook signature using HMAC-SHA256.
 * Cashfree sends `x-cashfree-timestamp` and `x-cashfree-signature` headers.
 * Signature = base64(HMAC-SHA256(timestamp + rawBody, secretKey))
 */
export function verifyCashfreeWebhookSignature(
  timestamp: string | null,
  rawBody: string,
  signature: string | null,
  secretKey: string
): boolean {
  if (!signature || !timestamp || !secretKey) return false;

  const payload = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('base64');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

import crypto from 'crypto';

interface CreatePaymentLinkInput {
  amount: number; // in rupees
  customerName: string;
  customerPhone: string;
  description: string;
  orderId: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
}

interface PaymentLinkResponse {
  id: string;
  short_url: string;
  status: string;
}

/**
 * Create a Razorpay payment link using the REST API (no SDK needed).
 */
export async function createPaymentLink(
  input: CreatePaymentLinkInput
): Promise<PaymentLinkResponse> {
  const { amount, customerName, customerPhone, description, orderId, razorpayKeyId, razorpayKeySecret } = input;

  // Normalize phone to +91 format
  const phone = customerPhone.startsWith('+')
    ? customerPhone
    : customerPhone.startsWith('91')
      ? `+${customerPhone}`
      : `+91${customerPhone}`;

  const basicAuth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

  const res = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      description,
      customer: {
        name: customerName,
        contact: phone,
      },
      notify: {
        sms: true,
        whatsapp: true,
      },
      reminder_enable: true,
      notes: {
        order_id: orderId,
      },
      callback_url: '',
      callback_method: '',
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error('[Razorpay] Payment link creation failed:', errorData);
    throw new Error(errorData.error?.description || 'Failed to create payment link');
  }

  const data = await res.json();
  return {
    id: data.id,
    short_url: data.short_url,
    status: data.status,
  };
}

/**
 * Verify Razorpay webhook signature using HMAC-SHA256.
 */
export function verifyRazorpayWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

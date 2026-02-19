const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';
const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

function normalizePhone(phone: string): string {
  // Strip +91 or 91 prefix, keep last 10 digits
  return phone.replace(/^\+?91/, '').replace(/\D/g, '').slice(-10);
}

interface SendSmsResult {
  success: boolean;
  requestId?: string;
  error?: string;
}

export async function sendSms({ mobile, message }: { mobile: string; message: string }): Promise<SendSmsResult> {
  const phone = normalizePhone(mobile);

  if (phone.length !== 10) {
    return { success: false, error: 'Invalid phone number' };
  }

  if (!FAST2SMS_API_KEY) {
    console.error('[SMS] FAST2SMS_API_KEY not configured');
    return { success: false, error: 'SMS not configured' };
  }

  try {
    const res = await fetch(FAST2SMS_URL, {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message,
        language: 'english',
        flash: 0,
        numbers: phone,
      }),
    });

    const data = await res.json();

    if (data.return === true) {
      console.log('[SMS] Sent to', phone, 'request_id:', data.request_id);
      return { success: true, requestId: data.request_id };
    } else {
      console.error('[SMS] Failed:', data.message);
      return { success: false, error: data.message || 'SMS send failed' };
    }
  } catch (err) {
    console.error('[SMS] Error:', err);
    return { success: false, error: 'SMS send error' };
  }
}

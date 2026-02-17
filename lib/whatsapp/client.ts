const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

interface SendMessageOptions {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  message: string;
}

interface SendImageOptions extends Omit<SendMessageOptions, 'message'> {
  imageUrl: string;
  caption?: string;
}

export async function sendWhatsAppMessage({
  phoneNumberId,
  accessToken,
  to,
  message,
}: SendMessageOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[WhatsApp] Send failed:', data);
      return { success: false, error: data.error?.message || 'Send failed' };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('[WhatsApp] Send error:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function sendWhatsAppImage({
  phoneNumberId,
  accessToken,
  to,
  imageUrl,
  caption,
}: SendImageOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'image',
        image: {
          link: imageUrl,
          ...(caption && { caption }),
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error?.message || 'Send failed' };
    }

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error('[WhatsApp] Image send error:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function markMessageAsRead({
  phoneNumberId,
  accessToken,
  messageId,
}: {
  phoneNumberId: string;
  accessToken: string;
  messageId: string;
}) {
  try {
    await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  } catch (error) {
    console.error('[WhatsApp] Mark read error:', error);
  }
}

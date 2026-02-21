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

interface InteractiveButton {
  id: string;
  title: string;
}

interface SendInteractiveOptions {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  bodyText: string;
  buttons: InteractiveButton[];
  headerText?: string;
  footerText?: string;
}

export async function sendWhatsAppInteractiveMessage({
  phoneNumberId,
  accessToken,
  to,
  bodyText,
  buttons,
  headerText,
  footerText,
}: SendInteractiveOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const interactive: Record<string, unknown> = {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map((btn) => ({
          type: 'reply',
          reply: { id: btn.id, title: btn.title },
        })),
      },
    };

    if (headerText) {
      interactive.header = { type: 'text', text: headerText };
    }
    if (footerText) {
      interactive.footer = { text: footerText };
    }

    const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[WhatsApp] Interactive send failed:', data);
      return { success: false, error: data.error?.message || 'Send failed' };
    }

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error('[WhatsApp] Interactive send error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * React to a customer message with an emoji to show acknowledgment.
 * Call with emoji="" to remove the reaction after sending the actual reply.
 */
export async function reactToMessage({
  phoneNumberId,
  accessToken,
  to,
  messageId,
  emoji,
}: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  messageId: string;
  emoji: string; // e.g. "👀" to add, "" to remove
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
        recipient_type: 'individual',
        to,
        type: 'reaction',
        reaction: {
          message_id: messageId,
          emoji,
        },
      }),
    });
  } catch {
    // Fail silently — reaction is non-critical
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

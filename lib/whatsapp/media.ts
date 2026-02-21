import OpenAI from 'openai';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

/**
 * Download a media file from WhatsApp Cloud API.
 * Step 1: GET /{media-id} → returns { url }
 * Step 2: GET {url} with auth → returns binary data
 */
export async function downloadWhatsAppMedia({
  mediaId,
  accessToken,
}: {
  mediaId: string;
  accessToken: string;
}): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    // Step 1: Get the media URL
    const metaRes = await fetch(`${WHATSAPP_API_URL}/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!metaRes.ok) {
      console.error('[Media] Failed to get media URL:', await metaRes.text());
      return null;
    }

    const metaData = await metaRes.json();
    const mediaUrl = metaData.url;
    const mimeType = metaData.mime_type || 'application/octet-stream';

    if (!mediaUrl) {
      console.error('[Media] No URL in media response');
      return null;
    }

    // Step 2: Download the actual file
    const fileRes = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!fileRes.ok) {
      console.error('[Media] Failed to download media file:', fileRes.status);
      return null;
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), mimeType };
  } catch (error) {
    console.error('[Media] Download error:', error);
    return null;
  }
}

/**
 * Transcribe audio using OpenAI Whisper API.
 * Supports Hindi, English, Hinglish, Telugu, and most Indian languages.
 */
export async function transcribeAudio({
  audioBuffer,
  mimeType,
  openaiKey,
}: {
  audioBuffer: Buffer;
  mimeType: string;
  openaiKey: string;
}): Promise<string | null> {
  try {
    const openai = new OpenAI({ apiKey: openaiKey });

    // Determine file extension from mime type
    const extMap: Record<string, string> = {
      'audio/ogg': 'ogg',
      'audio/ogg; codecs=opus': 'ogg',
      'audio/mpeg': 'mp3',
      'audio/mp4': 'mp4',
      'audio/wav': 'wav',
      'audio/webm': 'webm',
    };
    const ext = extMap[mimeType.split(';')[0].trim()] || 'ogg';

    // Create a File object for the OpenAI API (convert Buffer to Uint8Array for type compatibility)
    const file = new File([new Uint8Array(audioBuffer)], `voice.${ext}`, { type: mimeType });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    const text = transcription.text?.trim();
    if (!text) {
      console.log('[Whisper] Empty transcription');
      return null;
    }

    console.log('[Whisper] Transcribed:', text.slice(0, 100));
    return text;
  } catch (error) {
    console.error('[Whisper] Transcription error:', error);
    return null;
  }
}

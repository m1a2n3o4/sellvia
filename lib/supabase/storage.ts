import { supabaseAdmin } from './client';

const BUCKET = 'product-images';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Only JPG, PNG, and WebP are allowed.';
  }
  if (file.size > MAX_SIZE) {
    return 'File too large. Maximum size is 5MB.';
  }
  return null;
}

export async function uploadProductImage(
  tenantId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const ext = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const path = `${tenantId}/${timestamp}-${random}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return { url: urlData.publicUrl, path };
}

export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([path]);

  if (error) {
    console.error('Failed to delete image:', error.message);
  }
}

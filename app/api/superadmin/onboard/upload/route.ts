import { NextRequest, NextResponse } from 'next/server';
import { getSuperAdminId } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const BUCKET = 'product-images';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

/** Uploads a logo / banner / product photo for a demo business. Returns the public URL. */
export async function POST(request: NextRequest) {
  try {
    await getSuperAdminId(request);
    const form = await request.formData();
    const file = form.get('file') as File | null;
    const purpose = String(form.get('purpose') || 'general').replace(/[^a-z0-9-]/gi, '');
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Only JPG, PNG or WebP' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5MB' }, { status: 400 });

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `demo/${purpose}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (error) return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    console.error('onboard upload', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

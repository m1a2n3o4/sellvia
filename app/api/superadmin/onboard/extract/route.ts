import { NextRequest, NextResponse } from 'next/server';
import { getSuperAdminId } from '@/lib/auth/middleware';
import { extractProductsFromImage } from '@/lib/ai/catalogue-products';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Reads ONE catalogue screenshot (data URL) and returns product rows for review. Nothing is saved. */
export async function POST(request: NextRequest) {
  try {
    await getSuperAdminId(request);
    const { image } = await request.json();
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Send an image' }, { status: 400 });
    }
    if (image.length > 4_000_000) return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    const items = await extractProductsFromImage(image);
    return NextResponse.json({ items });
  } catch (e) {
    console.error('onboard extract', e);
    return NextResponse.json({ error: 'Could not read this screenshot. Try a clearer or smaller crop.' }, { status: 500 });
  }
}

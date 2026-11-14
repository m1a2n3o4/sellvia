import { NextRequest, NextResponse } from 'next/server';
import { getSuperAdminId } from '@/lib/auth/middleware';
import { extractCatalogFromImage } from '@/lib/ai/catalog-vision';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Reads ONE screenshot (data URL, compressed in the browser) and returns rows for review. Nothing is saved here. */
export async function POST(request: NextRequest) {
  try {
    await getSuperAdminId(request);
    const { image } = await request.json();
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Send an image' }, { status: 400 });
    }
    if (image.length > 4_000_000) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }
    const items = await extractCatalogFromImage(image);
    return NextResponse.json({ items });
  } catch (e) {
    console.error('demo-store extract', e);
    return NextResponse.json({ error: 'Could not read this screenshot. Try a clearer or smaller crop.' }, { status: 500 });
  }
}

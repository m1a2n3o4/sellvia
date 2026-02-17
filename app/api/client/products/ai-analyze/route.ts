import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/middleware';
import { uploadProductImage, validateImageFile } from '@/lib/supabase/storage';
import { analyzeProductImage } from '@/lib/ai/product-vision';

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Upload to Supabase
    const { url: imageUrl, path: imagePath } = await uploadProductImage(
      tenantId,
      file
    );

    // Analyze with AI (graceful degradation)
    let prediction = null;
    try {
      prediction = await analyzeProductImage(imageUrl);
      // If all fields are empty, treat as null
      if (prediction && !prediction.name && !prediction.category && !prediction.basePrice) {
        prediction = null;
      }
    } catch {
      console.error('AI analysis failed, returning image only');
    }

    return NextResponse.json({ imageUrl, imagePath, prediction });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

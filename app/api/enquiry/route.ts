import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createEnquirySchema } from '@/lib/validations/enquiry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createEnquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, mobile, instagramLink, website, message } = parsed.data;

    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        mobile,
        instagramLink: instagramLink || null,
        website: website || null,
        message: message || null,
      },
    });

    return NextResponse.json({ success: true, id: enquiry.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }
}

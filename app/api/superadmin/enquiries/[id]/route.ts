import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getSuperAdminId(request);
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'contacted', 'converted', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { updateCustomerSchema } from '@/lib/validations/customer';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantId(request);

    const customer = await prisma.customer.findFirst({
      where: { id: params.id, tenantId },
      include: {
        orders: {
          include: { orderItems: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantId(request);
    const body = await request.json();
    const parsed = updateCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.customer.findFirst({
      where: { id: params.id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check mobile uniqueness if mobile is being updated
    if (parsed.data.mobile && parsed.data.mobile !== existing.mobile) {
      const mobileExists = await prisma.customer.findUnique({
        where: { tenantId_mobile: { tenantId, mobile: parsed.data.mobile } },
      });
      if (mobileExists) {
        return NextResponse.json(
          { error: 'A customer with this mobile number already exists' },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
      },
    });

    return NextResponse.json(customer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantId(request);

    const existing = await prisma.customer.findFirst({
      where: { id: params.id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    await prisma.customer.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

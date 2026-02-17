import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);

    let businessInfo = await prisma.businessInfo.findUnique({
      where: { tenantId },
    });

    if (!businessInfo) {
      // Auto-create with defaults from tenant
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      businessInfo = await prisma.businessInfo.create({
        data: {
          tenantId,
          storeName: tenant?.businessName || '',
          location: tenant?.address || '',
        },
      });
    }

    return NextResponse.json(businessInfo);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const body = await request.json();

    const {
      storeName,
      description,
      storeHours,
      location,
      locationUrl,
      policies,
      greeting,
      whatsappPhoneNumberId,
      whatsappBusinessId,
      whatsappToken,
      openaiKey,
      aiEnabled,
    } = body;

    const businessInfo = await prisma.businessInfo.upsert({
      where: { tenantId },
      update: {
        ...(storeName !== undefined && { storeName }),
        ...(description !== undefined && { description }),
        ...(storeHours !== undefined && { storeHours }),
        ...(location !== undefined && { location }),
        ...(locationUrl !== undefined && { locationUrl }),
        ...(policies !== undefined && { policies }),
        ...(greeting !== undefined && { greeting }),
        ...(whatsappPhoneNumberId !== undefined && { whatsappPhoneNumberId }),
        ...(whatsappBusinessId !== undefined && { whatsappBusinessId }),
        ...(whatsappToken !== undefined && { whatsappToken }),
        ...(openaiKey !== undefined && { openaiKey }),
        ...(aiEnabled !== undefined && { aiEnabled }),
      },
      create: {
        tenantId,
        storeName,
        description,
        storeHours,
        location,
        locationUrl,
        policies,
        greeting,
        whatsappPhoneNumberId,
        whatsappBusinessId,
        whatsappToken,
        openaiKey,
        aiEnabled: aiEnabled ?? true,
      },
    });

    return NextResponse.json(businessInfo);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

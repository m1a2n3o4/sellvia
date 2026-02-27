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
      razorpayKeyId,
      razorpayKeySecret,
      cashfreeAppId,
      cashfreeSecretKey,
      paymentGateway,
      whatsappAppSecret,
      ownerPhone,
      shareOwnerPhone,
      aiCustomInstructions,
      // Storefront fields
      storeSlug,
      storeEnabled,
      storeLogo,
      storeBanner,
      storeThemeColor,
      storeAccentColor,
      storeDescription,
      deliveryFee,
      minOrderAmount,
      codEnabled,
      onlinePayEnabled,
    } = body;

    // Validate storeSlug uniqueness if changed
    if (storeSlug !== undefined && storeSlug) {
      const slugTaken = await prisma.businessInfo.findFirst({
        where: { storeSlug, tenantId: { not: tenantId } },
      });
      if (slugTaken) {
        return NextResponse.json({ error: 'This store URL is already taken. Please choose another.' }, { status: 400 });
      }
    }

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
        ...(razorpayKeyId !== undefined && { razorpayKeyId }),
        ...(razorpayKeySecret !== undefined && { razorpayKeySecret }),
        ...(cashfreeAppId !== undefined && { cashfreeAppId }),
        ...(cashfreeSecretKey !== undefined && { cashfreeSecretKey }),
        ...(paymentGateway !== undefined && { paymentGateway }),
        ...(whatsappAppSecret !== undefined && { whatsappAppSecret }),
        ...(ownerPhone !== undefined && { ownerPhone }),
        ...(shareOwnerPhone !== undefined && { shareOwnerPhone }),
        ...(aiCustomInstructions !== undefined && { aiCustomInstructions }),
        ...(storeSlug !== undefined && { storeSlug: storeSlug || null }),
        ...(storeEnabled !== undefined && { storeEnabled }),
        ...(storeLogo !== undefined && { storeLogo }),
        ...(storeBanner !== undefined && { storeBanner }),
        ...(storeThemeColor !== undefined && { storeThemeColor }),
        ...(storeAccentColor !== undefined && { storeAccentColor }),
        ...(storeDescription !== undefined && { storeDescription }),
        ...(deliveryFee !== undefined && { deliveryFee }),
        ...(minOrderAmount !== undefined && { minOrderAmount }),
        ...(codEnabled !== undefined && { codEnabled }),
        ...(onlinePayEnabled !== undefined && { onlinePayEnabled }),
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
        razorpayKeyId,
        razorpayKeySecret,
        cashfreeAppId,
        cashfreeSecretKey,
        paymentGateway: paymentGateway || 'none',
        whatsappAppSecret,
        ownerPhone,
        shareOwnerPhone: shareOwnerPhone ?? false,
        aiCustomInstructions,
        storeSlug: storeSlug || null,
        storeEnabled: storeEnabled ?? false,
        storeLogo,
        storeBanner,
        storeThemeColor: storeThemeColor || '#2563eb',
        storeAccentColor: storeAccentColor || '#f59e0b',
        storeDescription,
        deliveryFee: deliveryFee ?? 0,
        minOrderAmount: minOrderAmount ?? 0,
        codEnabled: codEnabled ?? true,
        onlinePayEnabled: onlinePayEnabled ?? true,
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { encryptSecret, isMasked, maskSecret } from '@/lib/crypto/secrets';

export const dynamic = 'force-dynamic';

type BusinessInfoRow = NonNullable<Awaited<ReturnType<typeof prisma.businessInfo.findUnique>>>;

/** Never send secrets to the browser: mask them, and drop the register PIN entirely. */
function sanitize(row: BusinessInfoRow) {
  const { whatsappRegisterPin: _pin, ...rest } = row;
  void _pin;
  return {
    ...rest,
    whatsappToken: maskSecret(row.whatsappToken),
    whatsappAppSecret: maskSecret(row.whatsappAppSecret),
    openaiKey: maskSecret(row.openaiKey),
    razorpayKeySecret: maskSecret(row.razorpayKeySecret),
    cashfreeSecretKey: maskSecret(row.cashfreeSecretKey),
  };
}

/** Encrypt a manually entered WhatsApp token at rest (falls back to plaintext only if no key is configured). */
function storeToken(value: string): string {
  try {
    return encryptSecret(value);
  } catch {
    console.warn('[BusinessInfo] ENCRYPTION_KEY missing: storing manual WhatsApp token unencrypted');
    return value;
  }
}

/** Secret fields from the UI: undefined/masked = leave unchanged, '' = clear, otherwise new value. */
function secretUpdate(value: unknown, transform: (v: string) => string = (v) => v): { set: boolean; value: string | null } {
  if (value === undefined || value === null || isMasked(value)) return { set: false, value: null };
  const str = String(value).trim();
  return { set: true, value: str ? transform(str) : null };
}

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

    return NextResponse.json(sanitize(businessInfo));
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
      // Storefront fields are now managed via /api/client/stores/[storeId]
    } = body;

    // A WhatsApp number can only belong to one account
    if (whatsappPhoneNumberId) {
      const owner = await prisma.businessInfo.findFirst({
        where: { whatsappPhoneNumberId: String(whatsappPhoneNumberId), NOT: { tenantId } },
        select: { tenantId: true },
      });
      if (owner) {
        return NextResponse.json({ error: 'This WhatsApp number is already connected to another account.' }, { status: 409 });
      }
    }

    const tok = secretUpdate(whatsappToken, storeToken);
    const oai = secretUpdate(openaiKey);
    const rzp = secretUpdate(razorpayKeySecret);
    const cf = secretUpdate(cashfreeSecretKey);
    const wsec = secretUpdate(whatsappAppSecret);

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
        ...(tok.set && { whatsappToken: tok.value }),
        ...(oai.set && { openaiKey: oai.value }),
        ...(aiEnabled !== undefined && { aiEnabled }),
        ...(razorpayKeyId !== undefined && { razorpayKeyId }),
        ...(rzp.set && { razorpayKeySecret: rzp.value }),
        ...(cashfreeAppId !== undefined && { cashfreeAppId }),
        ...(cf.set && { cashfreeSecretKey: cf.value }),
        ...(paymentGateway !== undefined && { paymentGateway }),
        ...(wsec.set && { whatsappAppSecret: wsec.value }),
        ...(ownerPhone !== undefined && { ownerPhone }),
        ...(shareOwnerPhone !== undefined && { shareOwnerPhone }),
        ...(aiCustomInstructions !== undefined && { aiCustomInstructions }),
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
        whatsappToken: tok.value,
        openaiKey: oai.value,
        aiEnabled: aiEnabled ?? true,
        razorpayKeyId,
        razorpayKeySecret: rzp.value,
        cashfreeAppId,
        cashfreeSecretKey: cf.value,
        paymentGateway: paymentGateway || 'none',
        whatsappAppSecret: wsec.value,
        ownerPhone,
        shareOwnerPhone: shareOwnerPhone ?? false,
        aiCustomInstructions,
      },
    });

    return NextResponse.json(sanitize(businessInfo));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';
import { generatePin } from '@/lib/sms/otp';
import { seedDemoData, uniqueSlug } from '@/lib/demo/seed';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Onboard a prospect's business on their behalf (demo). Creates tenant (isDemo), business info,
 * public store page, products, and sample orders/customers. NO SMS is sent to the prospect.
 */
export async function POST(request: NextRequest) {
  try {
    await getSuperAdminId(request);
    const b = await request.json();
    const businessName = String(b.businessName || '').trim();
    const contactName = String(b.contactName || '').trim() || businessName;
    const mobile = String(b.mobile || '').replace(/\D/g, '').slice(-10);
    if (!businessName || mobile.length !== 10) {
      return NextResponse.json({ error: 'Business name and a 10-digit contact number are required' }, { status: 400 });
    }
    if (await prisma.tenant.findUnique({ where: { mobile } })) {
      return NextResponse.json({ error: 'A business with this mobile number already exists' }, { status: 400 });
    }

    const slug = await uniqueSlug(String(b.slug || businessName));
    const pin = generatePin();
    const passwordHash = await bcrypt.hash(pin, 10);
    const theme = /^#[0-9a-f]{6}$/i.test(b.themeColor) ? b.themeColor : '#2563eb';
    const accent = /^#[0-9a-f]{6}$/i.test(b.accentColor) ? b.accentColor : '#f59e0b';
    const description = String(b.description || '').slice(0, 1000) || null;
    const city = String(b.city || '').trim() || null;
    const products: any[] = Array.isArray(b.products) ? b.products.slice(0, 200) : [];

    const result = await prisma.$transaction(
      async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            clientName: contactName,
            businessName,
            mobile,
            passwordHash,
            pinChangeRequired: false,
            isDemo: true,
            address: city || 'India',
            status: 'active',
            features: { inventory: true, orders: true, customers: true, broadcasting: false, whatsapp: false },
          },
        });
        await tx.businessInfo.create({
          data: {
            tenantId: tenant.id,
            storeName: businessName,
            description,
            ownerPhone: mobile,
            shareOwnerPhone: !!b.enableWhatsAppOrders,
            storeSlug: slug,
            storeEnabled: true,
            storeLogo: b.logo || null,
            storeBanner: b.banner || null,
            storeThemeColor: theme,
            storeAccentColor: accent,
            storeDescription: description,
            aiEnabled: false,
          },
        });
        const store = await tx.store.create({
          data: {
            tenantId: tenant.id,
            name: businessName,
            slug,
            enabled: true,
            logo: b.logo || null,
            banner: b.banner || null,
            themeColor: theme,
            accentColor: accent,
            description,
            city,
            phone: mobile,
            instagramUrl: String(b.instagramUrl || '').trim() || null,
            codEnabled: true,
            onlinePayEnabled: false,
            isDefault: true,
          },
        });
        for (const p of products) {
          const name = String(p.name || '').trim();
          const price = Number(p.price);
          if (!name || !Number.isFinite(price) || price <= 0) continue;
          await tx.product.create({
            data: {
              tenantId: tenant.id,
              storeId: store.id,
              name: name.slice(0, 200),
              brand: String(p.brand || '').trim() || null,
              category: String(p.category || '').trim() || null,
              description: String(p.description || '').trim() || null,
              basePrice: Math.round(price),
              stockQuantity: Number.isFinite(Number(p.quantity)) && Number(p.quantity) > 0 ? Math.round(Number(p.quantity)) : 50,
              images: Array.isArray(p.images) ? p.images.filter((u: any) => typeof u === 'string').slice(0, 5) : [],
              status: 'active',
            },
          });
        }
        return { tenant, store };
      },
      { timeout: 55_000, maxWait: 10_000 }
    );

    const seeded = await seedDemoData(result.tenant.id, result.store.id).catch((e) => {
      console.error('seed demo data', e);
      return { customers: 0, orders: 0 };
    });

    return NextResponse.json({
      success: true,
      tenantId: result.tenant.id,
      slug,
      storeUrl: `/store/${slug}`,
      loginMobile: mobile,
      loginPin: pin,
      seeded,
    });
  } catch (e) {
    console.error('onboard', e);
    return NextResponse.json({ error: 'Failed to onboard business' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { checkProductBody, labelFor } from '@/lib/products/service';
import { getLiveConfig } from '@/lib/config/server';

export const dynamic = 'force-dynamic';

async function tenantOr401(req: NextRequest): Promise<string | NextResponse> {
  try { return await getTenantId(req); } catch { return NextResponse.json({ error: 'Sign in required' }, { status: 401 }); }
}

/** This owner's products (tenant from the login cookie only). */
export async function GET(req: NextRequest) {
  const t = await tenantOr401(req); if (typeof t !== 'string') return t;
  try {
    const rows = await prisma.product.findMany({ where: { tenantId: t, status: 'active' }, orderBy: { createdAt: 'desc' }, take: 500, include: { _count: { select: { variants: true } } } });
    const extras = await prisma.productExtra.findMany({ where: { tenantId: t, productId: { in: rows.map((r) => r.id) } }, select: { productId: true, businessTypeId: true } });
    const typeOf = new Map(extras.map((e) => [e.productId, e.businessTypeId]));
    return NextResponse.json({ products: rows.map((p) => ({
      id: p.id, name: p.name, category: p.category ?? '', sku: p.sku ?? '', price: Number(p.basePrice), stock: p.stockQuantity,
      variants: p._count.variants, status: p.status, businessTypeId: typeOf.get(p.id) ?? null, createdAt: p.createdAt,
    })) });
  } catch (e) { console.error('[products] list', e); return NextResponse.json({ error: 'Could not load products' }, { status: 503 }); }
}

/** Create a product from the configured form. Validated on the server against the live release. */
export async function POST(req: NextRequest) {
  const t = await tenantOr401(req); if (typeof t !== 'string') return t;
  let body: unknown; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const c = await checkProductBody(t, body);
  if (!c.ok) return NextResponse.json({ error: c.error, fields: c.fields }, { status: c.status });
  const { input } = c;
  try {
    const typeName = (await getLiveConfig()).config.taxonomy.find((n) => n.id === input.businessTypeId)?.name;
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({ data: { tenantId: t, name: input.columns.name, brand: input.columns.brand, description: input.columns.description, category: typeName ?? null, basePrice: input.columns.basePrice, sku: input.columns.sku, stockQuantity: input.columns.stockQuantity, images: [], status: 'active' } });
      await tx.productExtra.create({ data: { productId: p.id, tenantId: t, businessTypeId: input.businessTypeId, configVersion: input.configVersion, attributes: input.attributes as never } });
      if (input.variants.length) await tx.productVariant.createMany({ data: input.variants.map((v) => ({ tenantId: t, productId: p.id, variantName: labelFor(input.schema, v.options), sku: v.sku ?? null, price: v.price, stockQuantity: v.stock, attributes: v.options as never, status: 'active' as const })) });
      return p;
    });
    return NextResponse.json({ ok: true, id: product.id, variants: input.variants.length }, { status: 201 });
  } catch (e) { console.error('[products] create', e); return NextResponse.json({ error: 'Could not save the product. The database may not be ready yet.' }, { status: 503 }); }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { getLiveConfig } from '@/lib/config/server';
import { checkProductBody, labelFor } from '@/lib/products/service';
import { variantKey } from '@/lib/crm/config/taxonomy/resolve-form';

export const dynamic = 'force-dynamic';
type Ctx = { params: { id: string } };

async function tenantOr401(req: NextRequest): Promise<string | NextResponse> {
  try { return await getTenantId(req); } catch { return NextResponse.json({ error: 'Sign in required' }, { status: 401 }); }
}
const optKey = (a: unknown) => (a && typeof a === 'object' && !Array.isArray(a) ? variantKey(a as Record<string, string>) : '');

/** One product with its configured values and variants. Always scoped to the signed-in owner. */
export async function GET(req: NextRequest, { params }: Ctx) {
  const t = await tenantOr401(req); if (typeof t !== 'string') return t;
  const p = await prisma.product.findFirst({ where: { id: params.id, tenantId: t }, include: { variants: { where: { status: 'active' }, orderBy: { createdAt: 'asc' } } } });
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const x = await prisma.productExtra.findUnique({ where: { productId: p.id } });
  return NextResponse.json({ product: {
    id: p.id, businessTypeId: x?.businessTypeId ?? null, status: p.status,
    values: { name: p.name, description: p.description ?? '', price: Number(p.basePrice), sku: p.sku ?? '', stock: p.stockQuantity, brand: p.brand ?? '', ...((x?.attributes as Record<string, unknown>) ?? {}) },
    variants: p.variants.map((v) => ({ options: v.attributes as Record<string, string>, price: Number(v.price), stock: v.stockQuantity, sku: v.sku ?? '' })),
  } });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const t = await tenantOr401(req); if (typeof t !== 'string') return t;
  const existing = await prisma.product.findFirst({ where: { id: params.id, tenantId: t }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let body: unknown; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const c = await checkProductBody(t, body);
  if (!c.ok) return NextResponse.json({ error: c.error, fields: c.fields }, { status: c.status });
  const { input } = c;
  try {
    const typeName = (await getLiveConfig()).config.taxonomy.find((n) => n.id === input.businessTypeId)?.name ?? null;
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: params.id }, data: { name: input.columns.name, brand: input.columns.brand, description: input.columns.description, category: typeName, basePrice: input.columns.basePrice, sku: input.columns.sku, stockQuantity: input.columns.stockQuantity } });
      await tx.productExtra.upsert({ where: { productId: params.id }, update: { businessTypeId: input.businessTypeId, configVersion: input.configVersion, attributes: input.attributes as never }, create: { productId: params.id, tenantId: t, businessTypeId: input.businessTypeId, configVersion: input.configVersion, attributes: input.attributes as never } });
      // Variants are matched by their option combination. Missing ones are deactivated, never deleted (orders may reference them).
      const old = await tx.productVariant.findMany({ where: { productId: params.id, tenantId: t } });
      const byKey = new Map(old.map((v) => [optKey(v.attributes), v]));
      const keep = new Set<string>();
      for (const v of input.variants) {
        const k = variantKey(v.options); keep.add(k); const cur = byKey.get(k);
        const data = { variantName: labelFor(input.schema, v.options), sku: v.sku ?? null, price: v.price, stockQuantity: v.stock, status: 'active' as const };
        if (cur) await tx.productVariant.update({ where: { id: cur.id }, data });
        else await tx.productVariant.create({ data: { ...data, tenantId: t, productId: params.id, attributes: v.options as never } });
      }
      for (const [k, v] of byKey) if (!keep.has(k) && v.status === 'active') await tx.productVariant.update({ where: { id: v.id }, data: { status: 'inactive' } });
    });
    return NextResponse.json({ ok: true });
  } catch (e) { console.error('[products] update', e); return NextResponse.json({ error: 'Could not save the product' }, { status: 503 }); }
}

/** Archive (hide) a product. Nothing is deleted, so past orders stay intact. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const t = await tenantOr401(req); if (typeof t !== 'string') return t;
  const r = await prisma.product.updateMany({ where: { id: params.id, tenantId: t }, data: { status: 'inactive' } });
  return r.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

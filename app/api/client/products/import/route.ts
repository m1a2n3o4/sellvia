import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const importVariantSchema = z.object({
  variantName: z.string().min(1),
  price: z.number().min(0),
  stockQuantity: z.number().int().min(0),
  attributes: z.record(z.string(), z.string()).default({}),
});

const importProductSchema = z.object({
  name: z.string().min(1).max(200),
  basePrice: z.number().min(0),
  brand: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  stockQuantity: z.number().int().min(0).default(0),
  variants: z.array(importVariantSchema).optional(),
});

const importRequestSchema = z.object({
  importMode: z.enum(['skip_duplicates', 'update_existing', 'allow_all']),
  products: z.array(importProductSchema).min(1).max(5000),
});

const BATCH_SIZE = 50;

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const body = await request.json();
    const parsed = importRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { importMode, products } = parsed.data;

    // Fetch existing SKUs for this tenant if needed
    let existingSkuMap = new Map<string, string>(); // sku → productId
    if (importMode !== 'allow_all') {
      const existingProducts = await prisma.product.findMany({
        where: { tenantId, sku: { not: null } },
        select: { id: true, sku: true },
      });
      for (const p of existingProducts) {
        if (p.sku) {
          existingSkuMap.set(p.sku.toLowerCase(), p.id);
        }
      }
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: { row: number; message: string }[] = [];

    // Process in batches
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);

      await prisma.$transaction(async (tx) => {
        for (let j = 0; j < batch.length; j++) {
          const product = batch[j];
          const rowNum = i + j + 1;

          try {
            const existingProductId = product.sku
              ? existingSkuMap.get(product.sku.toLowerCase())
              : undefined;

            if (existingProductId && importMode === 'skip_duplicates') {
              skipped++;
              continue;
            }

            if (existingProductId && importMode === 'update_existing') {
              // Update existing product
              await tx.product.update({
                where: { id: existingProductId },
                data: {
                  name: product.name,
                  basePrice: product.basePrice,
                  brand: product.brand || null,
                  description: product.description || null,
                  category: product.category || null,
                  stockQuantity: product.stockQuantity,
                },
              });

              // If product has variants, delete old and recreate
              if (product.variants && product.variants.length > 0) {
                await tx.productVariant.deleteMany({
                  where: { productId: existingProductId, tenantId },
                });
                await tx.productVariant.createMany({
                  data: product.variants.map(v => ({
                    tenantId,
                    productId: existingProductId,
                    variantName: v.variantName,
                    price: v.price,
                    stockQuantity: v.stockQuantity,
                    attributes: v.attributes,
                  })),
                });
              }

              updated++;
              continue;
            }

            // Create new product
            if (product.variants && product.variants.length > 0) {
              // Products with variants — use nested create
              const created_product = await tx.product.create({
                data: {
                  tenantId,
                  name: product.name,
                  basePrice: product.basePrice,
                  brand: product.brand || null,
                  description: product.description || null,
                  category: product.category || null,
                  sku: product.sku || null,
                  stockQuantity: product.stockQuantity,
                  lowStockThreshold: 10,
                  images: [],
                  status: 'active',
                  variants: {
                    create: product.variants.map(v => ({
                      tenantId,
                      variantName: v.variantName,
                      price: v.price,
                      stockQuantity: v.stockQuantity,
                      attributes: v.attributes,
                    })),
                  },
                },
              });
              // Track SKU for dedup within batch
              if (product.sku) {
                existingSkuMap.set(product.sku.toLowerCase(), created_product.id);
              }
            } else {
              // Products without variants — simple create
              const created_product = await tx.product.create({
                data: {
                  tenantId,
                  name: product.name,
                  basePrice: product.basePrice,
                  brand: product.brand || null,
                  description: product.description || null,
                  category: product.category || null,
                  sku: product.sku || null,
                  stockQuantity: product.stockQuantity,
                  lowStockThreshold: 10,
                  images: [],
                  status: 'active',
                },
              });
              if (product.sku) {
                existingSkuMap.set(product.sku.toLowerCase(), created_product.id);
              }
            }

            created++;
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            errors.push({ row: rowNum, message });
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      skipped,
      errors,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

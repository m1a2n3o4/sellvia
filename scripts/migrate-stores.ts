/**
 * One-time migration script: copies store data from BusinessInfo → Store model
 * and assigns existing products/orders to the new Store.
 *
 * Run: npx tsx scripts/migrate-stores.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting store migration...\n');

  // Find all BusinessInfo records that have a storeSlug set
  const businessInfos = await prisma.businessInfo.findMany({
    where: { storeSlug: { not: null } },
  });

  console.log(`Found ${businessInfos.length} tenants with existing store data.\n`);

  for (const bi of businessInfos) {
    // Check if a Store already exists for this slug (idempotent)
    const existing = await prisma.store.findUnique({
      where: { slug: bi.storeSlug! },
    });

    if (existing) {
      console.log(`  [SKIP] Store "${bi.storeSlug}" already exists (id: ${existing.id})`);
      continue;
    }

    // Create the Store record
    const store = await prisma.store.create({
      data: {
        tenantId: bi.tenantId,
        name: bi.storeName || 'My Store',
        slug: bi.storeSlug!,
        enabled: bi.storeEnabled,
        logo: bi.storeLogo,
        banner: bi.storeBanner,
        themeColor: bi.storeThemeColor || '#2563eb',
        accentColor: bi.storeAccentColor || '#f59e0b',
        description: bi.storeDescription,
        deliveryFee: bi.deliveryFee,
        minOrderAmount: bi.minOrderAmount,
        codEnabled: bi.codEnabled,
        onlinePayEnabled: bi.onlinePayEnabled,
        isDefault: true,
      },
    });

    console.log(`  [CREATE] Store "${store.slug}" (id: ${store.id}) for tenant ${bi.tenantId}`);

    // Assign all products for this tenant to the new store
    const productResult = await prisma.product.updateMany({
      where: { tenantId: bi.tenantId, storeId: null },
      data: { storeId: store.id },
    });

    console.log(`    -> Assigned ${productResult.count} products`);

    // Assign website orders for this tenant to the new store
    const orderResult = await prisma.order.updateMany({
      where: { tenantId: bi.tenantId, orderType: 'website', storeId: null },
      data: { storeId: store.id },
    });

    console.log(`    -> Assigned ${orderResult.count} website orders`);
  }

  console.log('\nMigration complete!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

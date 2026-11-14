import { prisma } from '@/lib/db/prisma';

const DUMMY_CUSTOMERS = [
  { name: 'Ravi Kumar', mobile: '9999900001', city: 'Hyderabad' },
  { name: 'Sneha Reddy', mobile: '9999900002', city: 'Vijayawada' },
  { name: 'Arjun Sharma', mobile: '9999900003', city: 'Bengaluru' },
  { name: 'Lakshmi Devi', mobile: '9999900004', city: 'Guntur' },
  { name: 'Imran Khan', mobile: '9999900005', city: 'Hyderabad' },
  { name: 'Priya Nair', mobile: '9999900006', city: 'Chennai' },
];

/** Fills a demo tenant with sample customers and orders (all flagged isDemo) so the dashboard looks alive. */
export async function seedDemoData(tenantId: string, storeId: string) {
  const products = await prisma.product.findMany({ where: { tenantId, status: 'active' }, take: 8 });
  if (!products.length) return { customers: 0, orders: 0 };

  const customers = [];
  for (const c of DUMMY_CUSTOMERS) {
    customers.push(
      await prisma.customer.upsert({
        where: { tenantId_mobile: { tenantId, mobile: c.mobile } },
        update: {},
        create: { tenantId, storeId, name: c.name, mobile: c.mobile, city: c.city, address: `Sample address, ${c.city}`, isDemo: true },
      })
    );
  }

  const statuses: { status: any; delivery: any; pay: any }[] = [
    { status: 'delivered', delivery: 'delivered', pay: 'paid' },
    { status: 'delivered', delivery: 'delivered', pay: 'paid' },
    { status: 'delivered', delivery: 'delivered', pay: 'paid' },
    { status: 'shipped', delivery: 'in_transit', pay: 'unpaid' },
    { status: 'confirmed', delivery: 'pending', pay: 'unpaid' },
    { status: 'pending', delivery: 'pending', pay: 'unpaid' },
    { status: 'cancelled', delivery: 'pending', pay: 'unpaid' },
    { status: 'delivered', delivery: 'delivered', pay: 'paid' },
  ];
  const types: any[] = ['whatsapp', 'website', 'whatsapp', 'website', 'whatsapp', 'website', 'online', 'whatsapp'];

  let created = 0;
  for (let i = 0; i < statuses.length; i++) {
    const st = statuses[i];
    const cust = customers[i % customers.length];
    const p1 = products[i % products.length];
    const p2 = products[(i + 3) % products.length];
    const items = [
      { p: p1, qty: 1 + (i % 3) },
      ...(i % 2 === 0 && p2.id !== p1.id ? [{ p: p2, qty: 1 }] : []),
    ];
    const subtotal = items.reduce((s, x) => s + Number(x.p.basePrice) * x.qty, 0);
    const date = new Date(Date.now() - (i === 0 ? 2 : i === 4 ? 4 : i * 20) * 60 * 60 * 1000 - i * 24 * 60 * 60 * 1000 * (i > 4 ? 1 : 0));
    const orderNumber = `DEMO-${String(i + 1).padStart(3, '0')}`;
    const exists = await prisma.order.findFirst({ where: { tenantId, orderNumber } });
    if (exists) continue;
    await prisma.order.create({
      data: {
        tenantId,
        storeId,
        orderNumber,
        customerId: cust.id,
        isDemo: true,
        orderDate: date,
        createdAt: date,
        status: st.status,
        deliveryStatus: st.delivery,
        paymentStatus: st.pay,
        paymentMethod: st.pay === 'paid' ? 'upi' : 'cod',
        orderType: types[i],
        subtotal,
        total: subtotal,
        deliveryAddress: `Sample address, ${cust.city}`,
        notes: 'Sample demo order',
        orderItems: {
          create: items.map((x) => ({
            tenantId,
            productId: x.p.id,
            productName: x.p.name,
            price: x.p.basePrice,
            quantity: x.qty,
            subtotal: Number(x.p.basePrice) * x.qty,
          })),
        },
      },
    });
    await prisma.customer.update({ where: { id: cust.id }, data: { totalOrders: { increment: 1 }, totalSpent: { increment: subtotal } } });
    created++;
  }
  return { customers: customers.length, orders: created };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || 'store';
  let slug = root;
  for (let n = 2; n < 50; n++) {
    const [s, b] = await Promise.all([
      prisma.store.findUnique({ where: { slug }, select: { id: true } }),
      prisma.businessInfo.findUnique({ where: { storeSlug: slug }, select: { id: true } }),
    ]);
    if (!s && !b) return slug;
    slug = `${root}-${n}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

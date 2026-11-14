import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';
import { generatePin } from '@/lib/sms/otp';

export const dynamic = 'force-dynamic';

/**
 * PATCH { action }:
 *  - takedown | restore        -> hide / show the public store page
 *  - whatsappOrders {enabled}  -> let the page's "Order via WhatsApp" open the owner's WhatsApp
 *  - resetPin                  -> new login PIN (returned once)
 *  - clearDemoOrders           -> delete sample (isDemo) orders and customers
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await getSuperAdminId(request);
    const { action, enabled } = await request.json();
    const tenant = await prisma.tenant.findFirst({ where: { id: params.id, isDemo: true }, select: { id: true } });
    if (!tenant) return NextResponse.json({ error: 'Demo business not found' }, { status: 404 });

    switch (action) {
      case 'takedown':
      case 'restore':
        await prisma.store.updateMany({ where: { tenantId: tenant.id }, data: { enabled: action === 'restore' } });
        await prisma.businessInfo.updateMany({ where: { tenantId: tenant.id }, data: { storeEnabled: action === 'restore' } });
        return NextResponse.json({ success: true });
      case 'whatsappOrders':
        await prisma.businessInfo.updateMany({ where: { tenantId: tenant.id }, data: { shareOwnerPhone: !!enabled } });
        return NextResponse.json({ success: true });
      case 'resetPin': {
        const pin = generatePin();
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { passwordHash: await bcrypt.hash(pin, 10), pinChangeRequired: false },
        });
        return NextResponse.json({ success: true, pin });
      }
      case 'clearDemoOrders': {
        const del = await prisma.order.deleteMany({ where: { tenantId: tenant.id, isDemo: true } });
        await prisma.customer.deleteMany({ where: { tenantId: tenant.id, isDemo: true, orders: { none: {} } } });
        return NextResponse.json({ success: true, deleted: del.count });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (e) {
    console.error('demos patch', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

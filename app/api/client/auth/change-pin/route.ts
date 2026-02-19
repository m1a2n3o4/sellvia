import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { signJWT } from '@/lib/auth/jwt';
import { sendSms } from '@/lib/sms/fast2sms';
import { pinChanged } from '@/lib/sms/templates';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const body = await request.json();
    const { newPin } = body;

    if (!newPin || !/^\d{6}$/.test(newPin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPin, 10);

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { passwordHash, pinChangeRequired: false },
      select: { id: true, mobile: true },
    });

    // Issue new JWT without pinChangeRequired
    const token = await signJWT({
      userId: tenant.id,
      tenantId: tenant.id,
      role: 'client',
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set('client_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    // Fire-and-forget confirmation SMS
    sendSms({ mobile: tenant.mobile, message: pinChanged() }).catch((err) =>
      console.error('[SMS] PIN change confirmation failed:', err)
    );

    return response;
  } catch (error) {
    console.error('Change PIN error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

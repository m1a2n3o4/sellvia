import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { signJWT } from '@/lib/auth/jwt';
import { verifyOtp } from '@/lib/sms/otp';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, pin, otp, mode } = body;

    if (!mobile || !mode) {
      return NextResponse.json(
        { error: 'Mobile and mode are required' },
        { status: 400 }
      );
    }

    // Find tenant by mobile
    const tenant = await prisma.tenant.findUnique({
      where: { mobile },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid mobile number' },
        { status: 401 }
      );
    }

    if (tenant.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      );
    }

    if (mode === 'pin') {
      if (!pin || !/^\d{6}$/.test(pin)) {
        return NextResponse.json(
          { error: 'PIN must be 6 digits' },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(pin, tenant.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid PIN' },
          { status: 401 }
        );
      }
    } else if (mode === 'otp') {
      if (!otp || !/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          { error: 'OTP must be 6 digits' },
          { status: 400 }
        );
      }

      const otpResult = await verifyOtp(mobile, otp);
      if (!otpResult.success) {
        return NextResponse.json(
          { error: otpResult.error },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid mode. Use "pin" or "otp".' },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = await signJWT({
      userId: tenant.id,
      tenantId: tenant.id,
      role: 'client',
      pinChangeRequired: tenant.pinChangeRequired,
    });

    const response = NextResponse.json({
      success: true,
      pinChangeRequired: tenant.pinChangeRequired,
      user: {
        id: tenant.id,
        clientName: tenant.clientName,
        businessName: tenant.businessName,
        mobile: tenant.mobile,
        role: 'client',
        features: tenant.features,
      },
    });

    response.cookies.set('client_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Client login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { signJWT } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, password } = body;

    // Validate input
    if (!mobile || !password) {
      return NextResponse.json(
        { error: 'Mobile and password are required' },
        { status: 400 }
      );
    }

    // Find tenant by mobile
    const tenant = await prisma.tenant.findUnique({
      where: { mobile },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid mobile number or password' },
        { status: 401 }
      );
    }

    // Check if tenant is active
    if (tenant.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, tenant.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid mobile number or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signJWT({
      userId: tenant.id,
      tenantId: tenant.id,
      role: 'client',
    });

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: tenant.id,
        clientName: tenant.clientName,
        businessName: tenant.businessName,
        mobile: tenant.mobile,
        role: 'client',
        features: tenant.features,
      },
    });

    // Set HTTP-only cookie for security
    response.cookies.set('client_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
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

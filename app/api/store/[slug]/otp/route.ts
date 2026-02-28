import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendOtp, verifyOtp } from '@/lib/sms/otp';
import { checkRateLimit, getRateLimitKey } from '@/lib/store/rate-limiter';

export const dynamic = 'force-dynamic';

// POST - Send or verify OTP for checkout
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    const body = await request.json();
    const { action, mobile, otp } = body;

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit phone number' }, { status: 400 });
    }

    // Verify store exists
    const store = await prisma.businessInfo.findUnique({
      where: { storeSlug: params.slug },
      select: { storeEnabled: true, storeName: true },
    });

    if (!store || !store.storeEnabled) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    if (action === 'send') {
      // Rate limit: 3 OTP sends per minute per IP
      if (!checkRateLimit(getRateLimitKey(ip, 'store-otp-send'), 3, 60_000)) {
        return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
      }

      const result = await sendOtp(mobile);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 429 });
      }

      return NextResponse.json({ success: true, message: 'OTP sent to your phone' });
    }

    if (action === 'verify') {
      // Rate limit: 5 verify attempts per minute per IP
      if (!checkRateLimit(getRateLimitKey(ip, 'store-otp-verify'), 5, 60_000)) {
        return NextResponse.json({ error: 'Too many attempts. Please wait.' }, { status: 429 });
      }

      if (!otp || otp.length !== 6) {
        return NextResponse.json({ error: 'Enter a valid 6-digit OTP' }, { status: 400 });
      }

      const result = await verifyOtp(mobile, otp);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, verified: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Store OTP] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

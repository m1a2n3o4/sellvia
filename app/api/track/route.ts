import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

function parseDevice(ua: string): string {
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function parseBrowser(ua: string): string {
  if (/edg/i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua)) return 'Safari';
  if (/firefox/i.test(ua)) return 'Firefox';
  return 'Other';
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const ua = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || null;
    const body = await request.json().catch(() => ({}));

    let country: string | null = null;
    let state: string | null = null;
    let city: string | null = null;

    // ip-api.com: free, no key needed, 45 req/min
    if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city`, {
          signal: AbortSignal.timeout(3000),
        });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.country) country = geo.country;
          if (geo.regionName) state = geo.regionName;
          if (geo.city) city = geo.city;
        }
      } catch {
        // Geo lookup failed — proceed without location
      }
    }

    await prisma.pageView.create({
      data: {
        page: (body as Record<string, unknown>).page as string || '/',
        country,
        state,
        city,
        device: parseDevice(ua),
        browser: parseBrowser(ua),
        referrer,
        ip,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json({ success: true });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { signJWT } from '@/lib/auth/jwt';
import { clientIp, tooMany } from '@/lib/auth/rate-limit';

export const dynamic = 'force-dynamic';

/** Public self-registration: name + mobile + password. Mobile numbers are unique. */
export async function POST(req: NextRequest) {
  if (tooMany(`reg:${clientIp(req.headers)}`, 6)) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  let b: { name?: unknown; mobile?: unknown; password?: unknown } = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const mobile = typeof b.mobile === 'string' ? b.mobile.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '') : '';
  const password = typeof b.password === 'string' ? b.password : '';
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: 'Please enter your name' }, { status: 400 });
  if (!/^[6-9]\d{9}$/.test(mobile)) return NextResponse.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 });
  if (password.length < 5 || password.length > 72) return NextResponse.json({ error: 'Password must be at least 5 characters' }, { status: 400 });

  try {
    if (await prisma.tenant.findUnique({ where: { mobile }, select: { id: true } })) return NextResponse.json({ error: 'This mobile number is already registered. Please sign in.' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    // Tenant and its self-serve marker are created together, or not at all.
    const tenant = await prisma.$transaction(async (tx) => {
      const t = await tx.tenant.create({ data: { clientName: name, businessName: name, mobile, passwordHash, pinChangeRequired: false, address: '', status: 'active' } });
      await tx.tenantBusinessConfig.create({ data: { tenantId: t.id, selfServe: true } });
      return t;
    });

    const token = await signJWT({ userId: tenant.id, tenantId: tenant.id, role: 'client', pinChangeRequired: false });
    const res = NextResponse.json({ ok: true });
    res.cookies.set('client_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' });
    return res;
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') return NextResponse.json({ error: 'This mobile number is already registered. Please sign in.' }, { status: 409 });
    console.error('[register] failed', e);
    return NextResponse.json({ error: 'Registration is not available right now. Please try again shortly.' }, { status: 503 });
  }
}

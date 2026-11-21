import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { signJWT } from '@/lib/auth/jwt';
import { clientIp, tooMany } from '@/lib/auth/rate-limit';

export const dynamic = 'force-dynamic';

/** Sign-in for self-registered owners (mobile + password). The existing /client login is separate and unchanged. */
export async function POST(req: NextRequest) {
  let b: { mobile?: unknown; password?: unknown } = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const mobile = typeof b.mobile === 'string' ? b.mobile.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '') : '';
  const password = typeof b.password === 'string' ? b.password : '';
  if (tooMany(`in:${clientIp(req.headers)}:${mobile}`, 8)) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  const bad = NextResponse.json({ error: 'Invalid mobile number or password' }, { status: 401 });
  if (!mobile || !password) return bad;
  try {
    const t = await prisma.tenant.findUnique({ where: { mobile } });
    if (!t || !(await bcrypt.compare(password, t.passwordHash))) return bad;
    if (t.status !== 'active') return NextResponse.json({ error: 'Account is inactive. Please contact support.' }, { status: 403 });
    const token = await signJWT({ userId: t.id, tenantId: t.id, role: 'client', pinChangeRequired: t.pinChangeRequired });
    const res = NextResponse.json({ ok: true });
    res.cookies.set('client_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' });
    return res;
  } catch (e) { console.error('[signin] failed', e); return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 }); }
}

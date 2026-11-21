import { NextRequest, NextResponse } from 'next/server';
import { getSuperAdminId } from '@/lib/auth/middleware';

/** Returns the super admin id, or a 401 response. API routes are not covered by the page middleware, so each checks itself. */
export async function requireSuperAdmin(req: NextRequest): Promise<{ id: string } | { res: NextResponse }> {
  try { return { id: await getSuperAdminId(req) }; }
  catch { return { res: NextResponse.json({ error: 'Super admin sign-in required' }, { status: 401 }) }; }
}
export const dbError = (e: unknown) => {
  console.error('[studio]', e);
  return NextResponse.json({ error: 'Database is not ready. Apply the business configuration SQL in Supabase, then retry.' }, { status: 503 });
};

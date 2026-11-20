import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/middleware';
import { canSeeCrmLink } from '@/lib/crm/access';

export const dynamic = 'force-dynamic';

// Tells the client dashboard whether to show the Instagram shortcut. Never errors: anything unexpected means "no".
export async function GET(request: NextRequest) {
  try { return NextResponse.json({ show: canSeeCrmLink(await getTenantId(request)) }); }
  catch { return NextResponse.json({ show: false }); }
}

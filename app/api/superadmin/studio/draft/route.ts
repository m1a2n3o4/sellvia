import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { configSchema } from '@/lib/config/schema';
import { requireSuperAdmin, dbError } from '@/lib/config/studio-auth';

export const dynamic = 'force-dynamic';

/** Save the working copy. `revision` must match, otherwise someone else saved first (409). */
export async function PUT(req: NextRequest) {
  const a = await requireSuperAdmin(req); if ('res' in a) return a.res;
  let body: { config?: unknown; revision?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const parsed = configSchema.safeParse(body.config);
  if (!parsed.success) return NextResponse.json({ error: 'The configuration is not valid', detail: parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`) }, { status: 400 });
  if (typeof body.revision !== 'number') return NextResponse.json({ error: 'Missing revision' }, { status: 400 });
  try {
    const r = await prisma.configDraft.updateMany({ where: { id: 'main', revision: body.revision }, data: { snapshot: parsed.data as never, revision: body.revision + 1, updatedBy: a.id } });
    if (r.count === 0) return NextResponse.json({ error: 'Someone else changed the draft. Reload to see their changes.' }, { status: 409 });
    return NextResponse.json({ ok: true, revision: body.revision + 1 });
  } catch (e) { return dbError(e); }
}

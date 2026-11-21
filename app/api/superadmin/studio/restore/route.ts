import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin, dbError } from '@/lib/config/studio-auth';

export const dynamic = 'force-dynamic';

/** Load an old release into the draft. Nothing goes live until it is published again. */
export async function POST(req: NextRequest) {
  const a = await requireSuperAdmin(req); if ('res' in a) return a.res;
  let body: { version?: number } = {};
  try { body = await req.json(); } catch { /* empty */ }
  if (typeof body.version !== 'number') return NextResponse.json({ error: 'Missing version' }, { status: 400 });
  try {
    const rel = await prisma.configRelease.findUnique({ where: { version: body.version } });
    if (!rel) return NextResponse.json({ error: 'No such version' }, { status: 404 });
    const d = await prisma.configDraft.upsert({ where: { id: 'main' }, update: { snapshot: rel.snapshot as never, revision: { increment: 1 }, updatedBy: a.id }, create: { id: 'main', snapshot: rel.snapshot as never, updatedBy: a.id } });
    await prisma.configAudit.create({ data: { action: 'restore_to_draft', version: rel.version, actor: a.id } });
    return NextResponse.json({ ok: true, revision: d.revision });
  } catch (e) { return dbError(e); }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { normaliseConfig } from '@/lib/config/server';
import { validateConfig } from '@/lib/crm/config/taxonomy/validate-config';
import { requireSuperAdmin, dbError } from '@/lib/config/studio-auth';

export const dynamic = 'force-dynamic';

/** Publish the saved draft as the next immutable version. The server re-runs every check. */
export async function POST(req: NextRequest) {
  const a = await requireSuperAdmin(req); if ('res' in a) return a.res;
  let body: { label?: string; revision?: number } = {};
  try { body = await req.json(); } catch { /* empty body */ }
  try {
    const draft = await prisma.configDraft.findUnique({ where: { id: 'main' } });
    if (!draft) return NextResponse.json({ error: 'No draft yet. Open the Studio first.' }, { status: 409 });
    if (typeof body.revision === 'number' && body.revision !== draft.revision) return NextResponse.json({ error: 'The draft changed. Reload and review before publishing.' }, { status: 409 });
    const cfg = normaliseConfig(draft.snapshot);
    const errors = validateConfig(cfg).filter((i) => i.level === 'error');
    if (errors.length) return NextResponse.json({ error: 'Fix these errors first', detail: errors.map((e) => e.message).slice(0, 10) }, { status: 400 });
    const label = (body.label ?? '').trim().slice(0, 120);
    const release = await prisma.$transaction(async (tx) => {
      const last = await tx.configRelease.findFirst({ orderBy: { version: 'desc' }, select: { version: true } });
      const version = (last?.version ?? 0) + 1;
      const r = await tx.configRelease.create({ data: { version, label: label || `Release ${version}`, snapshot: cfg as never, publishedBy: a.id } });
      await tx.configAudit.create({ data: { action: 'publish', version, actor: a.id, detail: { label: r.label } } });
      return r;
    });
    return NextResponse.json({ ok: true, version: release.version, label: release.label, publishedAt: release.publishedAt });
  } catch (e) { return dbError(e); }
}

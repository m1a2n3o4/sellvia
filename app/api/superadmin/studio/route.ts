import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ensureSeeded, normaliseConfig } from '@/lib/config/server';
import { requireSuperAdmin, dbError } from '@/lib/config/studio-auth';

export const dynamic = 'force-dynamic';

/** Draft + release history for the Studio. Seeds v1 and the draft on first use. */
export async function GET(req: NextRequest) {
  const a = await requireSuperAdmin(req); if ('res' in a) return a.res;
  try {
    await ensureSeeded();
    const [draft, releases] = await Promise.all([
      prisma.configDraft.findUniqueOrThrow({ where: { id: 'main' } }),
      prisma.configRelease.findMany({ orderBy: { version: 'desc' }, select: { version: true, label: true, publishedAt: true, publishedBy: true, snapshot: true } }),
    ]);
    const live = releases[0];
    return NextResponse.json({
      draft: normaliseConfig(draft.snapshot), revision: draft.revision, updatedAt: draft.updatedAt,
      live: { version: live.version, label: live.label, publishedAt: live.publishedAt, snapshot: normaliseConfig(live.snapshot) },
      releases: releases.map((r) => ({ version: r.version, label: r.label, publishedAt: r.publishedAt })),
    });
  } catch (e) { return dbError(e); }
}

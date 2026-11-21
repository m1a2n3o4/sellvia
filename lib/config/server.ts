// Server-side access to the published business configuration and each owner's chosen business type.
// Every function degrades gracefully if the T4 tables are not created yet, so existing pages never break.
import { prisma } from '@/lib/db/prisma';
import { SEED, type ConfigSource } from '@/lib/crm/config/taxonomy/resolve-form';

export interface LiveConfig { version: number; label: string; config: ConfigSource; fromDatabase: boolean }
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** Normalise a stored snapshot (older drafts may lack newer keys). */
export function normaliseConfig(raw: unknown): ConfigSource {
  const c = (raw ?? {}) as Partial<ConfigSource>;
  return {
    taxonomy: Array.isArray(c.taxonomy) ? c.taxonomy : clone(SEED.taxonomy),
    fields: Array.isArray(c.fields) ? c.fields : clone(SEED.fields),
    mappings: Array.isArray(c.mappings) ? c.mappings : clone(SEED.mappings),
    axes: c.axes && typeof c.axes === 'object' ? c.axes : clone(SEED.axes),
    menus: c.menus && typeof c.menus === 'object' ? c.menus : clone(SEED.menus ?? {}),
  };
}

/** Make sure release v1 (the seed) and the draft exist. Idempotent. */
export async function ensureSeeded(): Promise<void> {
  await prisma.configRelease.upsert({ where: { version: 1 }, update: {}, create: { version: 1, label: 'Initial seed', snapshot: clone(SEED) as never } });
  await prisma.configDraft.upsert({ where: { id: 'main' }, update: {}, create: { id: 'main', revision: 1, snapshot: clone(SEED) as never } });
}

/** The release owners run on. Falls back to the built-in seed if the database is not ready. */
export async function getLiveConfig(): Promise<LiveConfig> {
  try {
    const r = await prisma.configRelease.findFirst({ orderBy: { version: 'desc' } });
    if (r) return { version: r.version, label: r.label, config: normaliseConfig(r.snapshot), fromDatabase: true };
  } catch (e) { console.warn('[config] live release unavailable, using seed:', (e as Error).message); }
  return { version: 1, label: 'Built-in seed', config: SEED, fromDatabase: false };
}

export interface TenantBiz { selfServe: boolean; businessTypes: string[]; source: string | null }
export async function getTenantBusiness(tenantId: string): Promise<TenantBiz> {
  try {
    const r = await prisma.tenantBusinessConfig.findUnique({ where: { tenantId } });
    if (r) return { selfServe: r.selfServe, businessTypes: Array.isArray(r.businessTypes) ? (r.businessTypes as string[]) : [], source: r.onboardingSource };
  } catch (e) { console.warn('[config] tenant business unavailable:', (e as Error).message); }
  return { selfServe: false, businessTypes: [], source: null };
}

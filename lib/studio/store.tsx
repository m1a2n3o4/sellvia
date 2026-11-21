'use client';

// Studio draft + release store (Stage T3). SIMULATED PERSISTENCE: the draft and release history live in this
// browser's localStorage only. The database-backed version (shared by all admins, read by tenants) is stage T4.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SEED, type ConfigSource } from '@/lib/crm/config/taxonomy/resolve-form';
import { sameConfig } from '@/lib/crm/config/taxonomy/validate-config';
import type { FieldDefinition, FieldMapping, MenuConfig, TaxonomyNode, VariantAxis } from '@/lib/crm/config/taxonomy/types';

export interface Release { version: number; label: string; publishedAt: string; snapshot: ConfigSource }
interface Persisted { draft: ConfigSource; releases: Release[] }
const KEY = 'studio.config.v1';
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const initial = (): Persisted => ({ draft: clone(SEED), releases: [{ version: 1, label: 'Initial seed', publishedAt: new Date().toISOString(), snapshot: clone(SEED) }] });

interface Studio {
  ready: boolean;
  draft: ConfigSource;
  releases: Release[];
  live: Release;
  dirty: boolean;
  upsertNode: (n: TaxonomyNode) => void;
  upsertField: (f: FieldDefinition) => void;
  /** Add or replace one mapping (identified by field + scope + scopeId). */
  upsertMapping: (m: FieldMapping) => void;
  removeMapping: (fieldId: string, scope: FieldMapping['scope'], scopeId?: string) => void;
  /** Move a mapping up or down among the mappings of the given list (display order swap). */
  swapOrder: (a: FieldMapping, b: FieldMapping) => void;
  setAxes: (nodeId: string, axes: VariantAxis[] | null) => void;
  /** Replace the menu overrides of one node (null clears them). */
  setMenu: (nodeId: string, menu: MenuConfig | null) => void;
  publish: (label: string) => Release;
  discard: () => void;
  restore: (version: number) => void;
}

const Ctx = createContext<Studio | null>(null);
export const useStudio = () => { const c = useContext(Ctx); if (!c) throw new Error('useStudio outside StudioProvider'); return c; };

const sameMap = (m: FieldMapping, fieldId: string, scope: string, scopeId?: string) => m.fieldId === fieldId && m.scope === scope && (m.scopeId ?? '') === (scopeId ?? '');

export function StudioProvider({ children }: { children: ReactNode }) {
  const [st, setSt] = useState<Persisted>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw) as Persisted; if (p?.draft && p?.releases?.length) setSt({ ...p, draft: { ...p.draft, menus: p.draft.menus ?? clone(SEED.menus ?? {}) } }); } } catch { /* storage unavailable: start from the seed */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* storage unavailable */ } } }, [st, ready]);

  const edit = useCallback((fn: (d: ConfigSource) => ConfigSource) => setSt((s) => ({ ...s, draft: fn(clone(s.draft)) })), []);
  const live = st.releases[st.releases.length - 1];

  const api = useMemo<Studio>(() => ({
    ready, draft: st.draft, releases: st.releases, live, dirty: !sameConfig(st.draft, live.snapshot),
    upsertNode: (n) => edit((d) => { const i = d.taxonomy.findIndex((x) => x.id === n.id); if (i >= 0) d.taxonomy[i] = n; else d.taxonomy.push(n); return d; }),
    upsertField: (f) => edit((d) => { const i = d.fields.findIndex((x) => x.id === f.id); if (i >= 0) d.fields[i] = f; else d.fields.push(f); return d; }),
    upsertMapping: (m) => edit((d) => {
      const i = d.mappings.findIndex((x) => sameMap(x, m.fieldId, m.scope, m.scopeId));
      if (i >= 0) d.mappings[i] = { ...d.mappings[i], ...m };
      else d.mappings.push({ ...m, order: m.order ?? Math.max(0, ...d.mappings.map((x) => x.order ?? 0)) + 1 });
      return d;
    }),
    removeMapping: (fieldId, scope, scopeId) => edit((d) => { d.mappings = d.mappings.filter((x) => !sameMap(x, fieldId, scope, scopeId)); return d; }),
    swapOrder: (a, b) => edit((d) => {
      const ia = d.mappings.findIndex((x) => sameMap(x, a.fieldId, a.scope, a.scopeId));
      const ib = d.mappings.findIndex((x) => sameMap(x, b.fieldId, b.scope, b.scopeId));
      if (ia >= 0 && ib >= 0) { const t = d.mappings[ia].order; d.mappings[ia].order = d.mappings[ib].order; d.mappings[ib].order = t; }
      return d;
    }),
    setMenu: (nodeId, menu) => edit((d) => { d.menus = { ...(d.menus ?? {}) }; if (menu && (Object.keys(menu.items ?? {}).length || Object.keys(menu.sections ?? {}).length)) d.menus[nodeId] = menu; else delete d.menus[nodeId]; return d; }),
    setAxes: (nodeId, axes) => edit((d) => { if (axes) d.axes[nodeId] = axes; else delete d.axes[nodeId]; return d; }),
    publish: (label) => {
      const rel: Release = { version: live.version + 1, label: label.trim() || `Release ${live.version + 1}`, publishedAt: new Date().toISOString(), snapshot: clone(st.draft) };
      setSt((s) => ({ ...s, releases: [...s.releases, rel] }));
      return rel;
    },
    discard: () => setSt((s) => ({ ...s, draft: clone(s.releases[s.releases.length - 1].snapshot) })),
    restore: (version) => setSt((s) => { const r = s.releases.find((x) => x.version === version); return r ? { ...s, draft: clone(r.snapshot) } : s; }),
  }), [ready, st, live, edit]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

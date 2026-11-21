'use client';

// Studio draft + release store, backed by the database through /api/superadmin/studio/*.
// Edits apply instantly in the page and are saved a moment later (debounced). Publishing flushes the save first.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ConfigSource } from '@/lib/crm/config/taxonomy/resolve-form';
import { sameConfig } from '@/lib/crm/config/taxonomy/validate-config';
import type { FieldDefinition, FieldMapping, MenuConfig, TaxonomyNode, VariantAxis } from '@/lib/crm/config/taxonomy/types';

export interface Release { version: number; label: string; publishedAt: string; snapshot?: ConfigSource }
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const sameMap = (m: FieldMapping, fieldId: string, scope: string, scopeId?: string) => m.fieldId === fieldId && m.scope === scope && (m.scopeId ?? '') === (scopeId ?? '');
const API = '/api/superadmin/studio';

interface Studio {
  ready: boolean;
  /** Set when the database cannot be reached (for example the SQL has not been applied). */
  loadError: string | null;
  saveState: SaveState; saveError: string | null;
  draft: ConfigSource; releases: Release[]; live: Release & { snapshot: ConfigSource }; dirty: boolean;
  upsertNode: (n: TaxonomyNode) => void;
  upsertField: (f: FieldDefinition) => void;
  upsertMapping: (m: FieldMapping) => void;
  removeMapping: (fieldId: string, scope: FieldMapping['scope'], scopeId?: string) => void;
  setAxes: (nodeId: string, axes: VariantAxis[] | null) => void;
  setMenu: (nodeId: string, menu: MenuConfig | null) => void;
  publish: (label: string) => Promise<{ ok: true; version: number } | { ok: false; error: string; detail?: string[] }>;
  discard: () => Promise<void>;
  restore: (version: number) => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<Studio | null>(null);
export const useStudio = () => { const c = useContext(Ctx); if (!c) throw new Error('useStudio outside StudioProvider'); return c; };

const EMPTY: ConfigSource = { taxonomy: [], fields: [], mappings: [], axes: {}, menus: {} };

export function StudioProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ConfigSource>(EMPTY);
  const [live, setLive] = useState<Release & { snapshot: ConfigSource }>({ version: 0, label: '', publishedAt: '', snapshot: EMPTY });
  const [releases, setReleases] = useState<Release[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const draftRef = useRef(draft); const revRef = useRef(0); const timer = useRef<ReturnType<typeof setTimeout> | null>(null); const inflight = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(API, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) { setLoadError(j.error ?? 'Could not load'); setReady(true); return; }
      draftRef.current = j.draft; revRef.current = j.revision;
      setDraft(j.draft); setLive({ ...j.live, snapshot: j.live.snapshot }); setReleases(j.releases); setLoadError(null); setSaveState('idle'); setSaveError(null);
    } catch { setLoadError('Could not reach the server.'); }
    setReady(true);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const save = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const run = async () => {
      setSaveState('saving');
      try {
        const r = await fetch(`${API}/draft`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ config: draftRef.current, revision: revRef.current }) });
        const j = await r.json().catch(() => ({}));
        if (r.ok) { revRef.current = j.revision; setSaveState('saved'); setSaveError(null); }
        else { setSaveState('error'); setSaveError(j.error ? `${j.error}${j.detail ? ' ' + j.detail.join('; ') : ''}` : 'Could not save'); }
      } catch { setSaveState('error'); setSaveError('Could not reach the server. Changes are not saved yet.'); }
    };
    inflight.current = (inflight.current ?? Promise.resolve()).then(run);
    await inflight.current;
  }, []);

  const edit = useCallback((fn: (d: ConfigSource) => ConfigSource) => {
    const next = fn(clone(draftRef.current)); draftRef.current = next; setDraft(next); setSaveState('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void save(); }, 700);
  }, [save]);

  const api = useMemo<Studio>(() => ({
    ready, loadError, saveState, saveError, draft, releases, live, dirty: ready && !loadError && !sameConfig(draft, live.snapshot),
    upsertNode: (n) => edit((d) => { const i = d.taxonomy.findIndex((x) => x.id === n.id); if (i >= 0) d.taxonomy[i] = n; else d.taxonomy.push(n); return d; }),
    upsertField: (f) => edit((d) => { const i = d.fields.findIndex((x) => x.id === f.id); if (i >= 0) d.fields[i] = f; else d.fields.push(f); return d; }),
    upsertMapping: (m) => edit((d) => {
      const i = d.mappings.findIndex((x) => sameMap(x, m.fieldId, m.scope, m.scopeId));
      if (i >= 0) d.mappings[i] = { ...d.mappings[i], ...m };
      else d.mappings.push({ ...m, order: m.order ?? Math.max(0, ...d.mappings.map((x) => x.order ?? 0)) + 1 });
      return d;
    }),
    removeMapping: (fieldId, scope, scopeId) => edit((d) => { d.mappings = d.mappings.filter((x) => !sameMap(x, fieldId, scope, scopeId)); return d; }),
    setAxes: (nodeId, axes) => edit((d) => { if (axes) d.axes[nodeId] = axes; else delete d.axes[nodeId]; return d; }),
    setMenu: (nodeId, menu) => edit((d) => { d.menus = { ...(d.menus ?? {}) }; if (menu && (Object.keys(menu.items ?? {}).length || Object.keys(menu.sections ?? {}).length)) d.menus[nodeId] = menu; else delete d.menus[nodeId]; return d; }),
    publish: async (label) => {
      await save();
      if (saveStateRef.current === 'error') return { ok: false, error: 'Fix the save problem first.' };
      const r = await fetch(`${API}/publish`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ label, revision: revRef.current }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, error: j.error ?? 'Could not publish', detail: j.detail };
      await load(); return { ok: true, version: j.version };
    },
    restore: async (version) => { await fetch(`${API}/restore`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version }) }); await load(); },
    discard: async () => { await fetch(`${API}/restore`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: live.version }) }); await load(); },
    reload: load,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [ready, loadError, saveState, saveError, draft, releases, live, edit, save, load]);

  const saveStateRef = useRef<SaveState>('idle'); saveStateRef.current = saveState;
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

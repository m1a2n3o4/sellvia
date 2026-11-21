'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getVisibleNav, visibleQuickActions, type VisibleSection } from '@/lib/crm/nav';
import type { CrmUser, Workspace } from '@/lib/crm/types';
import { resolveMenu, templatesFor } from '@/lib/crm/config/taxonomy/menu';
import { SEED, type ConfigSource } from '@/lib/crm/config/taxonomy/resolve-form';
import { loadLiveConfig } from '@/lib/studio/live-config';

interface CrmContextValue {
  user: CrmUser;
  workspaces: Workspace[];
  workspace: Workspace;
  setWorkspaceId: (id: string) => void;
  nav: VisibleSection[];
  quickActions: ReturnType<typeof visibleQuickActions>;
  simulated: boolean;
  background: BgKey;
  setBackground: (b: BgKey) => void;
  /** True for the clean reviewer view (only Inbox + Instagram, real business name, no sample content). */
  reviewer: boolean;
  /** Published configuration the menu, forms and suggestions run on. */
  config: ConfigSource;
  configVersion: number;
  /** Registered but no business chosen yet. */
  needsSetup: boolean;
  /** Save the owner's chosen business types (server for real owners, in-page for sample businesses). */
  applyBusinessTypes: (types: string[], businessName?: string) => Promise<{ ok: boolean; error?: string }>;
}

export type BgKey = 'aurora' | 'sunset' | 'ocean' | 'mist';
export const BACKGROUNDS: { key: BgKey; label: string; swatch: string }[] = [
  { key: 'aurora', label: 'Aurora', swatch: 'linear-gradient(135deg,#cdc4ff,#ffe0ad,#b4d6ff)' },
  { key: 'sunset', label: 'Sunset', swatch: 'linear-gradient(135deg,#ffc9b5,#ffb6d6,#ffe7a3)' },
  { key: 'ocean', label: 'Ocean', swatch: 'linear-gradient(135deg,#aee2ff,#bff0e0,#c6d0ff)' },
  { key: 'mist', label: 'Mist', swatch: 'linear-gradient(135deg,#d6dae7,#eff1f8)' },
];
const BG_KEY = 'crm.background';

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({
  user: userProp, workspaces: workspacesProp, simulated, fontClass, reviewer: reviewerProp, serverConfig, children,
}: { user: CrmUser; workspaces: Workspace[]; simulated: boolean; fontClass: string; reviewer?: { businessName: string } | null; serverConfig?: { version: number; config: ConfigSource } | null; children: ReactNode }) {
  const reviewer = !!reviewerProp;
  const user: CrmUser = reviewerProp ? { name: reviewerProp.businessName, initials: reviewerProp.businessName.slice(0, 2).toUpperCase(), role: 'owner' } : userProp;
  const workspaces: Workspace[] = reviewerProp
    ? [{ id: 'reviewer', name: reviewerProp.businessName, branch: reviewerProp.businessName, industry: '', websiteUrl: '', templates: [], branches: [], plan: 'FREE', aiUsagePct: 0, instagramConnected: false, badges: {}, notifications: [] }]
    : workspacesProp;
  const [workspaceId, setWorkspaceId] = useState(workspaces[0].id);
  // Published configuration. Real owners get it from the server; sample businesses use the Studio release in this browser.
  const [liveCfg, setLiveCfg] = useState<ConfigSource>(SEED);
  useEffect(() => { if (!serverConfig) setLiveCfg(loadLiveConfig().cfg); }, [serverConfig]);
  const [background, setBackgroundState] = useState<BgKey>('aurora');
  const [typeOverride, setTypeOverride] = useState<Record<string, string[]>>({});
  const base = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0];
  const cfgForTemplates = serverConfig?.config ?? liveCfg;
  const chosen = typeOverride[base.id];
  const workspace: Workspace = chosen ? { ...base, businessTypes: chosen, needsSetup: false, templates: templatesFor(chosen, cfgForTemplates) } : base;

  // Radix menus render in a portal outside the wrapper; mirror the token class onto <html>.
  useEffect(() => {
    const cls = ['crm-root', ...fontClass.split(' ').filter(Boolean)];
    document.documentElement.classList.add(...cls);
    return () => document.documentElement.classList.remove(...cls);
  }, [fontClass]);

  useEffect(() => {
    try { const v = localStorage.getItem(BG_KEY) as BgKey | null; if (v && BACKGROUNDS.some((b) => b.key === v)) setBackgroundState(v); } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-crm-bg', background);
    return () => document.documentElement.removeAttribute('data-crm-bg');
  }, [background]);
  const setBackground = (b: BgKey) => {
    setBackgroundState(b);
    try { localStorage.setItem(BG_KEY, b); } catch { /* storage unavailable */ }
  };

  const applyBusinessTypes = async (types: string[], businessName?: string) => {
    if (base.real) {
      try {
        const r = await fetch('/api/app/onboarding/confirm', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ businessTypes: types, businessName }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return { ok: false, error: j.error ?? 'Could not save' };
        return { ok: true };
      } catch { return { ok: false, error: 'Could not reach the server' }; }
    }
    setTypeOverride((o) => ({ ...o, [base.id]: types }));
    return { ok: true };
  };

  const value = useMemo<CrmContextValue>(() => ({
    user, workspaces, workspace, setWorkspaceId, simulated, background, setBackground,
    nav: reviewer
      ? getVisibleNav(workspace.templates).map((sec) => ({ ...sec, items: sec.items.filter((i) => i.key === 'inbox' || i.key === 'instagram') })).filter((sec) => sec.items.length > 0)
      : workspace.businessTypes?.length ? resolveMenu(workspace.businessTypes, serverConfig?.config ?? liveCfg) : getVisibleNav(workspace.templates),
    quickActions: reviewer ? [] : visibleQuickActions(workspace.templates),
    reviewer,
    config: serverConfig?.config ?? liveCfg, configVersion: serverConfig?.version ?? 1, needsSetup: !!workspace.needsSetup,
    applyBusinessTypes,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, workspaces, workspace, simulated, background, reviewer, liveCfg, serverConfig, typeOverride]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used inside CrmProvider');
  return ctx;
}

'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getVisibleNav, visibleQuickActions, type VisibleSection } from '@/lib/crm/nav';
import type { CrmUser, Workspace } from '@/lib/crm/types';

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
  user, workspaces, simulated, fontClass, children,
}: { user: CrmUser; workspaces: Workspace[]; simulated: boolean; fontClass: string; children: ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState(workspaces[0].id);
  const [background, setBackgroundState] = useState<BgKey>('aurora');
  const workspace = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0];

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

  const value = useMemo<CrmContextValue>(() => ({
    user, workspaces, workspace, setWorkspaceId, simulated, background, setBackground,
    nav: getVisibleNav(workspace.templates),
    quickActions: visibleQuickActions(workspace.templates),
  }), [user, workspaces, workspace, simulated, background]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used inside CrmProvider');
  return ctx;
}

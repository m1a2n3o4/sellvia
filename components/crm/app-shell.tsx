'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCrm } from './crm-context';
import { useEffect, useState, type ReactNode } from 'react';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { MobileNavigation } from './mobile-nav';
import { WebsiteButton } from './website-button';
import { SetupPrompt } from './onboarding/setup-prompt';
import { NotReady } from './onboarding/not-ready';
import { RealDashboard } from './dashboard/real-dashboard';
import { findNavByPath } from '@/lib/crm/nav';

const KEY = 'crm.sidebar.collapsed';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { reviewer, needsSetup, workspace } = useCrm();
  // Until the owner chooses a business, data screens show "What is your business?" (channels, inbox and settings stay usable).
  const open = ['/app/onboarding', '/app/channels', '/app/inbox', '/app/settings'];
  const gated = needsSetup && !open.some((p) => pathname.startsWith(p));
  // Reviewer view only has Inbox and Instagram; anything else goes to Instagram.
  const allowed = !reviewer || pathname.startsWith('/app/channels/instagram') || pathname.startsWith('/app/inbox');
  // Real owners only ever see real data: built screens render, everything else says "coming soon" (never sample content).
  const READY = ['/app/onboarding', '/app/catalogue/products', '/app/channels/instagram', '/app/inbox', '/app/settings/business'];
  const realView = workspace.real
    ? (pathname === '/app' ? <RealDashboard /> : READY.some((p) => pathname.startsWith(p)) ? null : <NotReady title={findNavByPath(pathname)?.title ?? 'This page'} />)
    : null;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem(KEY) === '1'); } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => { if (!allowed) router.replace('/app/channels/instagram'); }, [allowed, router]);
  const toggle = () => setCollapsed((c) => {
    try { localStorage.setItem(KEY, c ? '0' : '1'); } catch { /* storage unavailable */ }
    return !c;
  });

  return (
    <div className="crm-root flex min-h-screen">
      <AppSidebar collapsed={collapsed} onToggle={toggle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onToggleSidebar={toggle} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 pb-28 lg:px-8 lg:pb-10">
          <div key={pathname} className="crm-page">{!allowed ? null : gated ? <SetupPrompt title={findNavByPath(pathname)?.title ?? 'Welcome'} dashboard={pathname === '/app'} /> : realView ?? children}</div>
        </main>
      </div>
      {!reviewer && <WebsiteButton />}
      <MobileNavigation />
    </div>
  );
}

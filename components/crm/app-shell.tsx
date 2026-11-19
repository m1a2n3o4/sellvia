'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { MobileNavigation } from './mobile-nav';
import { WebsiteButton } from './website-button';

const KEY = 'crm.sidebar.collapsed';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem(KEY) === '1'); } catch { /* storage unavailable */ }
  }, []);
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
          <div key={pathname} className="crm-page">{children}</div>
        </main>
      </div>
      <WebsiteButton />
      <MobileNavigation />
    </div>
  );
}

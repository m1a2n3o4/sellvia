'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getActiveKey } from '@/lib/crm/nav';
import { useCrm } from './crm-context';

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { nav, workspace, reviewer } = useCrm();
  const pathname = usePathname();
  const activeKey = getActiveKey(pathname, nav);

  return (
    <aside
      className="sticky top-3 z-40 m-3 mr-0 hidden h-[calc(100vh-1.5rem)] shrink-0 flex-col rounded-[28px] border border-white/90 bg-white/80 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-[width] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] lg:flex"
      style={{ width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' }}
      aria-label="Primary"
    >
      {/* Brand */}
      <div className={cn('flex h-[72px] shrink-0 items-center px-5', collapsed && 'justify-center px-2')}>
        <Link href={reviewer ? '/app/channels/instagram' : '/app'} className="flex min-w-0 items-center gap-3" aria-label="SatyaSell dashboard">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-brand shadow-[0_8px_18px_-8px_rgba(11,12,17,0.6)]">S</span>
          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5">
                <span className="text-[20px] font-bold leading-tight tracking-tight text-ink">Satya<span className="text-ink/45">Sell</span></span>
                {!reviewer && <span className="rounded-full bg-secondary px-2 text-[10px] font-bold tracking-wide text-ink">{workspace.plan}</span>}
              </span>
              <span className="truncate text-[11px] leading-tight text-muted-foreground">{workspace.name}</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="crm-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-2" aria-label="Main">
        {nav.map((section) => (
          <div key={section.key} className="mb-2">
            {collapsed
              ? <div className="mx-4 my-2 border-t border-black/5" />
              : <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{section.label}</p>}
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = item.key === activeKey;
                const Icon = item.icon;
                const badge = workspace.badges[item.key];
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex items-center justify-between rounded-full text-[14px] font-semibold transition-all duration-200',
                        collapsed ? 'mx-auto h-11 w-11 justify-center' : 'px-3.5 py-2.5',
                        active ? 'bg-primary text-white shadow-[0_10px_20px_-10px_rgba(11,12,17,0.7)]' : 'text-ink/70 hover:bg-white hover:text-ink hover:shadow-[var(--shadow-rest)]',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110', active ? 'text-brand' : 'text-ink/60')} strokeWidth={2} aria-hidden />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </span>
                      {!collapsed && (
                        badge ? <span className="rounded-full bg-danger px-2 text-[11px] font-bold text-white">{badge}</span>
                        : item.tag ? <span className={cn('rounded-full px-2 text-[10px] font-bold uppercase', active ? 'bg-white/15 text-white' : 'bg-secondary text-ink')}>{item.tag}</span>
                        : null
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: AI usage + collapse */}
      <div className={cn('shrink-0 space-y-2 p-3', collapsed && 'px-2')}>
        {!collapsed && !reviewer && (
          <div className="rounded-2xl bg-secondary p-3" aria-label="AI usage">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground">AI Usage</span>
              <span className="num font-bold text-ink">{workspace.aiUsagePct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div className="crm-fill h-full rounded-full bg-brand" style={{ width: `${workspace.aiUsagePct}%` }} />
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn('flex items-center rounded-full text-xs font-semibold text-muted-foreground transition-colors hover:bg-white hover:text-ink', collapsed ? 'mx-auto h-11 w-11 justify-center' : 'w-full justify-between px-3.5 py-2.5')}
        >
          {!collapsed && <span>Collapse</span>}
          {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" aria-hidden /> : <ChevronsLeft className="h-[18px] w-[18px]" aria-hidden />}
        </button>
      </div>
    </aside>
  );
}

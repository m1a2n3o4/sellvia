'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Globe, HelpCircle, PanelLeft, Search } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { findNavByPath } from '@/lib/crm/nav';
import { BACKGROUNDS, useCrm } from './crm-context';
import { QuickCreateMenu } from './quick-create-menu';
import { WorkspaceSwitcher } from './workspace-switcher';

function Breadcrumbs() {
  const crumb = findNavByPath(usePathname());
  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-xs text-muted-foreground xl:flex">
      <span>Workspace</span>
      <span className="text-[#c3c6d0]">/</span>
      <span className="truncate font-bold text-ink">{crumb?.title ?? 'Overview'}</span>
    </nav>
  );
}

function GlobalSearch() {
  const { nav } = useCrm();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const [mac, setMac] = useState(true);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return nav.flatMap((s) => s.items.map((i) => ({ label: i.label, group: s.label, href: i.href })))
      .filter((r) => r.label.toLowerCase().includes(term)).slice(0, 6);
  }, [q, nav]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) { router.push(results[0].href); setQ(''); inputRef.current?.blur(); }
          if (e.key === 'Escape') { setQ(''); inputRef.current?.blur(); }
        }}
        placeholder="Jump to a page…"
        aria-label="Search pages"
        className="h-10 w-full rounded-full border border-white/90 bg-white/80 pl-10 pr-14 text-sm font-medium text-foreground shadow-[var(--shadow-rest)] transition-all placeholder:text-muted-foreground focus:bg-white focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-white px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground shadow-sm">
        {mac ? '⌘K' : 'Ctrl K'}
      </kbd>
      {focused && q.trim() && (
        <ul className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border bg-white p-1 shadow-[0_4px_12px_-2px_rgba(0,8,20,0.08)]">
          {results.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">No matching pages</li>}
          {results.map((r) => (
            <li key={r.href}>
              <Link href={r.href} onClick={() => setQ('')} className="flex items-center justify-between rounded-full px-3 py-2 text-sm hover:bg-secondary">
                <span className="font-medium">{r.label}</span>
                <span className="text-xs text-muted-foreground">{r.group}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AppHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, workspace, background, setBackground } = useCrm();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const iconBtn = 'relative flex h-10 w-10 items-center justify-center rounded-full border border-white/90 bg-white/80 text-ink/70 shadow-[var(--shadow-rest)] transition-all hover:bg-white hover:text-ink hover:shadow-md';
  return (
    <header className={cn(
      'sticky top-3 z-30 mx-3 mt-3 flex h-[60px] items-center gap-3 rounded-full border border-white/90 bg-white/70 px-3 backdrop-blur-xl transition-shadow duration-300 lg:mx-6',
      scrolled ? 'shadow-[var(--shadow-soft)]' : 'shadow-[var(--shadow-rest)]',
    )}>
      <button onClick={onToggleSidebar} className={cn(iconBtn, 'hidden lg:flex')} aria-label="Toggle sidebar" title="Toggle sidebar">
        <PanelLeft className="h-5 w-5" aria-hidden />
      </button>
      <Link href="/app" className="flex items-center gap-2 lg:hidden" aria-label="SatyaSell dashboard">
        <span className="flex h-8 w-8 items-center justify-center rounded-[28px] bg-navy text-base font-bold text-brand">S</span>
      </Link>
      <Breadcrumbs />
      <WorkspaceSwitcher />
      <div className="mx-2 hidden flex-1 justify-center md:flex"><GlobalSearch /></div>

      <div className="ml-auto flex items-center gap-1.5 md:ml-0">
        <a
          href={workspace.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View my website (opens in a new tab)"
          title="View my website"
          className="group hidden h-10 items-center gap-2 rounded-full bg-gradient-to-br from-[#fff1a8] via-[#ffc300] to-[#ff9f1c] px-3 text-[13px] font-bold text-ink shadow-[0_8px_18px_-8px_rgba(255,160,0,0.75)] transition-all hover:scale-[1.03] hover:shadow-[0_10px_22px_-8px_rgba(255,160,0,0.9)] active:scale-95 sm:flex xl:px-4"
        >
          <Globe className="h-[18px] w-[18px] transition-transform duration-500 group-hover:rotate-180" aria-hidden />
          <span className="hidden xl:inline">View my website</span>
        </a>
        <QuickCreateMenu />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={iconBtn} aria-label={`Notifications (${workspace.notifications.length})`}>
              <Bell className="h-5 w-5" aria-hidden />
              {workspace.notifications.length > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white" aria-hidden />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 shadow-[0_4px_12px_-2px_rgba(0,8,20,0.08)]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspace.notifications.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>}
            {workspace.notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
                <span className="text-sm">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(iconBtn, 'hidden sm:flex')} aria-label="Help"><HelpCircle className="h-5 w-5" aria-hidden /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild><Link href="/contact">Contact support</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-white/80" aria-label="Account menu">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ffdf9a] to-[#f8be00] text-[13px] font-bold text-ink">{user.initials}</span>
              <span className="hidden flex-col text-left leading-tight xl:flex">
                <span className="text-[13px] font-bold text-ink">{user.name}</span>
                <span className="text-[11px] capitalize text-muted-foreground">{user.role}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-[0_4px_12px_-2px_rgba(0,8,20,0.08)]">
            <DropdownMenuLabel>
              <span className="block text-sm">{user.name}</span>
              <span className="block text-xs font-normal capitalize text-muted-foreground">{user.role}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/app/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/client">Current dashboard</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Background</p>
              <div className="flex gap-2" role="group" aria-label="Background colour">
                {BACKGROUNDS.map((b) => (
                  <button key={b.key} onClick={() => setBackground(b.key)} aria-pressed={background === b.key} aria-label={b.label} title={b.label}
                    className={cn('h-8 w-8 rounded-full border-2 transition-all hover:scale-110', background === b.key ? 'border-ink' : 'border-white shadow')} style={{ background: b.swatch }} />
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

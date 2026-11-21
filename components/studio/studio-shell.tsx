'use client';

// Studio shell: same "soft pill" look as the business CRM. Super Admin only (middleware guards /superadmin).
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ArrowLeft, Boxes, FileCog, LayoutDashboard, ListTree, Rocket, ScanSearch, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from '@/components/crm/button-styles';
import { useStudio } from '@/lib/studio/store';

const B = '/superadmin/studio';
interface Item { label: string; href: string; icon: typeof Boxes; exact?: boolean }
const NAV: { label: string; items: Item[] }[] = [
  { label: 'Overview', items: [{ label: 'Overview', href: B, icon: LayoutDashboard, exact: true }] },
  { label: 'Business Intelligence', items: [
    { label: 'Categories', href: `${B}/categories`, icon: ListTree },
    { label: 'Business types', href: `${B}/business-types`, icon: Boxes },
    { label: 'Recognition test', href: `${B}/recognition`, icon: ScanSearch },
  ]},
  { label: 'Configuration', items: [{ label: 'Field library', href: `${B}/fields`, icon: FileCog }] },
  { label: 'Release', items: [{ label: 'Publish & versions', href: `${B}/release`, icon: Rocket }] },
];

export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { dirty, live, ready } = useStudio();
  const flat = NAV.flatMap((s) => s.items);
  const active = flat.filter((i) => (i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + '/'))).sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <div className="crm-root flex min-h-screen">
      <aside className="sticky top-3 z-40 m-3 mr-0 hidden h-[calc(100vh-1.5rem)] w-[17rem] shrink-0 flex-col rounded-[28px] border border-white/90 bg-white/80 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:flex" aria-label="Studio">
        <Link href={B} className="flex h-[72px] shrink-0 items-center gap-3 px-5" aria-label="Business Studio">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-brand shadow-[0_8px_18px_-8px_rgba(11,12,17,0.6)]">S</span>
          <span className="flex flex-col"><span className="text-[20px] font-bold leading-tight tracking-tight text-ink">Satya<span className="text-ink/45">Sell</span></span><span className="text-[11px] leading-tight text-muted-foreground">Business Studio</span></span>
        </Link>
        <nav className="crm-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-2">
          {NAV.map((sec) => (
            <div key={sec.label} className="mb-2">
              <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{sec.label}</p>
              <ul className="flex flex-col gap-1">{sec.items.map((it) => { const on = it === active; return (
                <li key={it.href}><Link href={it.href} aria-current={on ? 'page' : undefined}
                  className={cn('group flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[14px] font-semibold transition-all', on ? 'bg-primary text-white shadow-[0_10px_20px_-10px_rgba(11,12,17,0.7)]' : 'text-ink/70 hover:bg-white hover:text-ink hover:shadow-[var(--shadow-rest)]')}>
                  <it.icon className={cn('h-[18px] w-[18px]', on ? 'text-brand' : 'text-ink/60')} aria-hidden />{it.label}
                  {it.href.endsWith('/release') && dirty && <span className="ml-auto h-2 w-2 rounded-full bg-brand" aria-label="Unpublished changes" />}
                </Link></li>); })}</ul>
            </div>
          ))}
        </nav>
        <div className="shrink-0 p-3"><Link href="/superadmin" className="flex items-center gap-2 rounded-full px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-white hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden />Back to Super Admin</Link></div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-3 z-30 mx-3 mt-3 flex h-[60px] items-center gap-3 rounded-full border border-white/90 bg-white/80 px-5 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:mx-6">
          <Link href="/superadmin" className="text-ink lg:hidden" aria-label="Back to Super Admin"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="text-sm font-bold text-ink">{active?.label ?? 'Studio'}</span>
          <span className="ml-auto hidden items-center gap-2 text-xs font-semibold text-muted-foreground sm:flex"><Sparkles className="h-3.5 w-3.5" aria-hidden />Live release v{live.version}</span>
          {ready && dirty && <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-ink">Unpublished changes</span>}
          <Link href={`${B}/release`} className={cn(btn.brand, '!h-9')}>Publish</Link>
        </header>
        <nav className="mx-3 mt-3 flex gap-1.5 overflow-x-auto lg:hidden" aria-label="Studio sections">
          {flat.map((i) => <Link key={i.href} href={i.href} className={cn('shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold', i === active ? 'border border-primary bg-primary text-white' : 'border border-ink/70 bg-white text-ink/70')}>{i.label}</Link>)}
        </nav>
        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 pb-16 lg:px-8"><div key={pathname} className="crm-page">{children}</div></main>
      </div>
    </div>
  );
}

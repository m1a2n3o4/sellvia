'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Home, MoreHorizontal, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getActiveKey, type NavItem } from '@/lib/crm/nav';
import { useCrm } from './crm-context';

export function MobileNavigation() {
  const { nav } = useCrm();
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  const activeKey = getActiveKey(pathname, nav);

  const { bar, rest } = useMemo(() => {
    const all = nav.flatMap((s) => s.items);
    const find = (k: string) => all.find((i) => i.key === k);
    const salesFirst = nav.find((s) => s.key === 'sales')?.items[0];
    const bar: { item: NavItem; label: string; icon?: LucideIcon }[] = [];
    const dash = find('dashboard'); if (dash) bar.push({ item: dash, label: 'Home', icon: Home });
    const inbox = find('inbox'); if (inbox) bar.push({ item: inbox, label: 'Inbox' });
    const cust = find('customers'); if (cust) bar.push({ item: cust, label: cust.label });
    if (salesFirst) bar.push({ item: salesFirst, label: 'Sales' });
    const used = new Set(bar.map((b) => b.item.key));
    const rest = nav.map((s) => ({ ...s, items: s.items.filter((i) => !used.has(i.key)) })).filter((s) => s.items.length);
    return { bar, rest };
  }, [nav]);

  const moreActive = rest.some((s) => s.items.some((i) => i.key === activeKey));
  const salesKeys: string[] = nav.find((s) => s.key === 'sales')?.items.map((i) => i.key) ?? [];

  useEffect(() => { setMore(false); }, [pathname]);
  useEffect(() => {
    if (!more) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMore(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [more]);

  const tab = 'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[11px] font-semibold transition-all duration-200';

  return (
    <>
      <nav aria-label="Primary" className="fixed inset-x-3 bottom-3 z-40 flex gap-1 rounded-full border border-white/90 bg-white/85 p-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-soft)] backdrop-blur-xl lg:hidden">
        {bar.map(({ item, label, icon }) => {
          const Icon = icon ?? item.icon;
          const active = item.key === activeKey || (label === 'Sales' && !!activeKey && salesKeys.includes(activeKey));
          return (
            <Link key={item.key} href={item.href} aria-current={active ? 'page' : undefined}
              className={cn(tab, active ? 'bg-primary text-white' : 'text-muted-foreground')}>
              <Icon className={cn('h-5 w-5', active && 'text-brand')} strokeWidth={active ? 2.25 : 2} aria-hidden />{label}
            </Link>
          );
        })}
        <button onClick={() => setMore(true)} aria-haspopup="dialog" className={cn(tab, moreActive ? 'bg-primary text-white' : 'text-muted-foreground')}>
          <MoreHorizontal className="h-5 w-5" aria-hidden />More
        </button>
      </nav>

      {more && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More">
          <button className="absolute inset-0 animate-in fade-in bg-ink/40" onClick={() => setMore(false)} aria-label="Close menu" />
          <div className="crm-scroll absolute inset-x-0 bottom-0 max-h-[80vh] animate-in slide-in-from-bottom overflow-y-auto rounded-t-[28px] bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] duration-300">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="t-h3">More</h2>
              <button onClick={() => setMore(false)} className="rounded-xl p-2 hover:bg-secondary" aria-label="Close"><X className="h-4 w-4" aria-hidden /></button>
            </div>
            {rest.map((s) => (
              <div key={s.key} className="mb-3">
                <p className="t-micro mb-1.5 px-1 text-muted-foreground">{s.label}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {s.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.key}>
                        <Link href={item.href} className={cn('flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary', item.key === activeKey && 'border-primary bg-primary text-white')}>
                          <Icon className="h-[18px] w-[18px] text-brand" strokeWidth={2.25} aria-hidden />{item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

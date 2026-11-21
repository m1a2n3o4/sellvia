'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from '@/components/crm/button-styles';
import { inputCls } from '@/components/crm/dynamic/dynamic-field';

export { inputCls, btn };
export const slugify = (t: string) => t.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);
export const kebab = (t: string) => slugify(t).replace(/_/g, '-');

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('keydown', k); prev?.focus(); };
  }, [onClose]);
  return (
    <div className="crm-root fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-3 backdrop-blur-sm sm:items-center" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={cn('crm-card crm-scroll max-h-[92vh] w-full overflow-y-auto p-6 outline-none', wide ? 'max-w-3xl' : 'max-w-xl')} style={{ fontFamily: 'var(--font-crm), Inter, system-ui' }}>
        <div className="mb-5 flex items-center justify-between"><h2 className="t-h3">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-white"><X className="h-4 w-4" /></button></div>
        {children}
      </div>
    </div>
  );
}

export const Label = ({ children, hint, htmlFor }: { children: ReactNode; hint?: string; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="mb-1.5 block"><span className="t-label">{children}</span>{hint && <span className="t-small ml-2 text-muted-foreground">{hint}</span>}</label>
);

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'success' | 'danger' | 'info' }) {
  const t = { neutral: 'bg-secondary text-ink', brand: 'bg-brand/25 text-ink', success: 'bg-success/10 text-success', danger: 'bg-danger/10 text-danger', info: 'bg-primary text-white' }[tone];
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold', t)}>{children}</span>;
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-primary' : 'bg-[#c3c9db]')}>
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

export const SOURCE_TONE = { global: 'neutral', category: 'brand', subcategory: 'info' } as const;

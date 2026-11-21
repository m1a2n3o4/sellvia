'use client';

// Menu tab of a business type: rename, show/hide and rename sections, with a live sidebar preview.
import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudio } from '@/lib/studio/store';
import { MAX_LABEL, MENU_CATALOGUE, baseLabel, isCore, resolveMenu, templatesFor } from '@/lib/crm/config/taxonomy/menu';
import type { MenuConfig, MenuItemOverride } from '@/lib/crm/config/taxonomy/types';
import type { ModuleKey } from '@/lib/crm/config/types';
import { Chip, Switch, inputCls } from './ui';

export function MenuEditor({ nodeId }: { nodeId: string }) {
  const { draft, setMenu } = useStudio();
  const cfg: MenuConfig = draft.menus?.[nodeId] ?? {};
  const preview = useMemo(() => resolveMenu([nodeId], draft), [nodeId, draft]);
  const baseNav = useMemo(() => resolveMenu([nodeId], { ...draft, menus: {} }), [nodeId, draft]);
  const baseKeys = new Set(baseNav.flatMap((s) => s.items.map((i) => i.key)));
  const shown = new Set(preview.flatMap((s) => s.items.map((i) => i.key)));
  const tpl = templatesFor([nodeId], draft);

  const setItem = (key: ModuleKey, patch: MenuItemOverride | null) => {
    const items = { ...(cfg.items ?? {}) };
    if (patch === null) delete items[key]; else items[key] = { ...items[key], ...patch };
    const o = items[key]; if (o && o.enabled === undefined && !o.label && o.order === undefined) delete items[key];
    setMenu(nodeId, { ...cfg, items });
  };
  const setSection = (sec: string, label: string) => {
    const sections = { ...(cfg.sections ?? {}) }; if (label.trim()) sections[sec] = label; else delete sections[sec];
    setMenu(nodeId, { ...cfg, sections });
  };
  const overridden = Object.keys(cfg.items ?? {}).length + Object.keys(cfg.sections ?? {}).length;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_17rem]">
      <section className="crm-card p-4 sm:p-5">
        <div className="mb-1 flex items-center justify-between gap-2"><h3 className="t-h3 !text-[16px]">Menu names and items</h3>
          {overridden > 0 && <button onClick={() => setMenu(nodeId, null)} className="t-small inline-flex items-center gap-1 font-semibold underline"><RotateCcw className="h-3.5 w-3.5" />Reset to template</button>}</div>
        <p className="t-small mb-4 text-muted-foreground">Starts from the template ({tpl.join(', ') || 'standard'}). Rename anything, or switch items on and off. Screens that do not exist yet show &quot;coming soon&quot;.</p>
        {MENU_CATALOGUE.map((c) => (
          <div key={c.section} className="mb-5">
            <div className="mb-2 flex items-center gap-2"><label className="t-micro text-muted-foreground" htmlFor={`sec-${c.section}`}>Section</label>
              <input id={`sec-${c.section}`} maxLength={MAX_LABEL} className={cn(inputCls, '!h-9 max-w-[16rem]')} value={cfg.sections?.[c.section] ?? ''} placeholder={c.sectionLabel} onChange={(e) => setSection(c.section, e.target.value)} /></div>
            <ul className="divide-y divide-white/80">
              {c.items.map((it) => {
                const o = cfg.items?.[it.key]; const on = shown.has(it.key); const core = isCore(it.key);
                const fromTemplate = baseKeys.has(it.key);
                return (
                  <li key={it.key} className={cn('flex flex-wrap items-center gap-3 py-2', !on && 'opacity-60')}>
                    <span className="flex min-w-[9rem] flex-1 items-center gap-2"><it.icon className="h-4 w-4 text-ink/60" aria-hidden /><span className="text-sm font-semibold text-ink">{it.label}</span>
                      {core && <Chip tone="brand">Always on</Chip>}{!core && !fromTemplate && on && <Chip tone="info">Added</Chip>}{!core && fromTemplate && o?.enabled === false && <Chip tone="danger">Hidden</Chip>}</span>
                    <input aria-label={`Menu name for ${it.label}`} maxLength={MAX_LABEL} className={cn(inputCls, '!h-9 w-48')} value={o?.label ?? ''} placeholder={baseLabel([nodeId], it.key, draft)} onChange={(e) => setItem(it.key, { label: e.target.value })} />
                    <Switch on={on} onChange={(v) => setItem(it.key, { enabled: v === fromTemplate ? undefined : v })} label={`Show ${it.label}`} />
                    {core ? <span className="w-8" /> : <button aria-label={`Reset ${it.label}`} disabled={!o} onClick={() => setItem(it.key, null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-white disabled:opacity-30"><RotateCcw className="h-3.5 w-3.5" /></button>}
                  </li>);
              })}
            </ul>
          </div>))}
      </section>
      <aside className="crm-card h-fit p-4 xl:sticky xl:top-24" aria-label="Menu preview">
        <p className="t-micro mb-2 text-muted-foreground">What the owner sees</p>
        {preview.map((s) => (<div key={s.key} className="mb-3"><p className="t-micro px-2 pb-1 text-muted-foreground">{s.label}</p>
          <ul className="space-y-1">{s.items.map((i) => <li key={i.key} className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[13px] font-semibold"><i.icon className="h-4 w-4 text-ink/60" aria-hidden />{i.label}</li>)}</ul></div>))}
      </aside>
    </div>
  );
}

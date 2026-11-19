'use client';

import { ArrowRight } from 'lucide-react';
import { useCrm } from '@/components/crm/crm-context';
import { StatusBadge } from '@/components/crm/status-badge';
import { NAV } from '@/lib/crm/nav';
import { getTemplates, resolveModules } from '@/lib/crm/config/resolve';
import { CORE_MODULES } from '@/lib/crm/config/templates';

/** Read-only view of the resolved configuration (Stage C1). Editing arrives with the Platform Admin studio. */
export function BusinessSetup() {
  const { workspace } = useCrm();
  const templates = getTemplates(workspace.templates);
  const mods = resolveModules(workspace.templates);
  const defaults = new Map(NAV.flatMap((s) => s.items).map((i) => [i.key, i.label]));
  const renamed = Array.from(mods.values()).filter((m) => m.label && m.label !== defaults.get(m.key));

  return (
    <div className="space-y-5">
      <section className="crm-card p-5">
        <h2 className="t-h3">Active templates</h2>
        <p className="t-body mt-1 text-muted-foreground">
          One workspace can run several business types. Customers, team, inbox and billing are shared; each template adds its own modules and workflows.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {templates.map((t, i) => (
            <div key={t.key} className="crm-soft p-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">{t.name}</span>
                {i === 0 && <StatusBadge tone="accent">Primary</StatusBadge>}
                <StatusBadge>v{t.version}</StatusBadge>
              </div>
              <p className="t-small mt-1 text-muted-foreground">{t.industry} · {t.category}</p>
              <p className="t-body mt-2">{t.description}</p>
              <p className="t-small mt-2 text-muted-foreground">Website menu: {t.storefrontMenu.join(' · ')}</p>
            </div>
          ))}
        </div>
        {workspace.branches.length > 0 && (
          <p className="t-small mt-4 text-muted-foreground">Branches / locations: <span className="font-semibold text-ink">{workspace.branches.join(', ')}</span> (branches live inside the workspace, they are not separate tenants).</p>
        )}
      </section>

      <section className="crm-card p-5">
        <h2 className="t-h3">Labels set by the templates</h2>
        {renamed.length === 0 ? (
          <p className="t-body mt-1 text-muted-foreground">No renamed modules. Default labels are used.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {renamed.map((m) => (
              <li key={m.key} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <code className="rounded-full bg-muted px-2 py-0.5 text-[12px]">{m.key}</code>
                <span className="text-muted-foreground">{defaults.get(m.key)}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                <span className="font-semibold text-ink">{m.label}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="t-small mt-3 text-muted-foreground">The internal key never changes, only what the business sees.</p>
      </section>

      <section className="crm-card p-5">
        <h2 className="t-h3">Workflows</h2>
        <div className="mt-3 space-y-4">
          {templates.flatMap((t) => t.workflows.map((w) => (
            <div key={`${t.key}-${w.key}`}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">{w.label}</span>
                <span className="t-small text-muted-foreground">{t.name} · module <code>{w.module}</code></span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {w.statuses.map((st) => (
                  <StatusBadge key={st.key} tone={st.tone === 'warning' ? 'accent' : st.tone === 'info' ? 'info' : st.tone === 'success' ? 'success' : st.tone === 'danger' ? 'danger' : 'neutral'}>{st.label}</StatusBadge>
                ))}
              </div>
              {w.note && <p className="t-small mt-1.5 text-muted-foreground">{w.note}</p>}
            </div>
          )))}
        </div>
      </section>

      {templates.some((t) => t.fieldGroups.length > 0) && (
        <section className="crm-card p-5">
          <h2 className="t-h3">Forms</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {templates.flatMap((t) => t.fieldGroups.map((g) => (
              <div key={`${t.key}-${g.module}`} className="crm-soft p-4">
                <p className="font-semibold text-ink">{g.label} <span className="t-small font-normal text-muted-foreground">({t.name})</span></p>
                <ul className="mt-2 space-y-1 text-sm">
                  {g.fields.map((f) => (
                    <li key={f.key} className="flex items-center justify-between gap-2">
                      <span>{f.label}{f.required && <span className="text-danger"> *</span>}</span>
                      <span className="t-small text-muted-foreground">{f.section} · {f.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )))}
          </div>
        </section>
      )}

      <p className="t-small text-muted-foreground">
        Simulated configuration. Core modules always on: {CORE_MODULES.filter((k) => k !== 'business-setup').join(', ')}.
        Templates will be edited in the Platform Admin studio (<code>/superadmin/studio</code>) in a later stage.
      </p>
    </div>
  );
}

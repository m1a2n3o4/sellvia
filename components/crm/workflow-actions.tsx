'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { WorkflowDef } from '@/lib/crm/config/types';
import { btn } from './button-styles';

/**
 * Shows only the transitions the template workflow allows. A `guard` stands in for the domain service
 * (availability, capacity...) that must also approve a move: workflow config never replaces it.
 */
export function WorkflowActions({ workflow, status, onMove, guard }: {
  workflow?: WorkflowDef; status: string; onMove: (to: string) => void; guard?: (to: string) => string | null;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const cur = workflow?.statuses.find((s) => s.key === status);
  if (!workflow || !cur || cur.next.length === 0) return <p className="t-small text-muted-foreground">No further steps.</p>;
  const go = (to: string) => { const why = guard?.(to) ?? null; setMsg(why); if (!why) onMove(to); };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {cur.next.map((n) => {
          const label = workflow.statuses.find((s) => s.key === n)?.label ?? n;
          return <button key={n} onClick={() => go(n)} className={cn(['cancelled', 'refunded'].includes(n) ? btn.outline : btn.brand)}>{label}</button>;
        })}
      </div>
      {msg && <p role="alert" className="mt-2 rounded-2xl bg-danger/10 px-3 py-2 text-[13px] font-semibold text-danger">{msg}</p>}
      {workflow.note && !msg && <p className="t-small mt-2 text-muted-foreground">{workflow.note}</p>}
    </div>
  );
}

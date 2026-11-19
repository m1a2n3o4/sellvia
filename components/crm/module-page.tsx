'use client';

import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCrm } from './crm-context';
import { EmptyState } from './empty-state';
import { PageHeader } from './page-header';
import type { ModuleKey } from '@/lib/crm/config/types';
import { resolveModules } from '@/lib/crm/config/resolve';
import { btn } from './button-styles';

/** Resolves a module's label from the active workspace templates. */
export function useModule(key: ModuleKey) {
  const { nav } = useCrm();
  const item = nav.flatMap((s) => s.items).find((i) => i.key === key);
  return { enabled: !!item, label: item?.label ?? key };
}

/**
 * Page wrapper for template-driven modules. Title comes from the template label ("Guests", "Rooms"...),
 * and a business whose templates do not include the module sees a clear notice instead of the screen.
 */
export function ModulePage({ module, description, reviewerDescription, actions, children }: {
  module: ModuleKey; description?: string; reviewerDescription?: string; actions?: ReactNode; children: ReactNode;
}) {
  const { enabled, label } = useModule(module);
  const { workspace, workspaces, setWorkspaceId, reviewer } = useCrm();
  if (!enabled) {
    const options = workspaces.filter((w) => resolveModules(w.templates).has(module));
    return (
      <>
        <PageHeader title={label} />
        <EmptyState icon={Lock} title="Not part of this business setup" description={`${workspace.name} does not use this module. Switch to a business that does to see it.`}
          action={options.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2">
              {options.map((w) => <button key={w.id} onClick={() => setWorkspaceId(w.id)} className={btn.brand}>Switch to {w.name}</button>)}
            </div>
          ) : undefined} />
      </>
    );
  }
  return (<><PageHeader title={label} description={reviewer && reviewerDescription ? reviewerDescription : description} actions={actions} />{children}</>);
}

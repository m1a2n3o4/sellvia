'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCrm } from './crm-context';

/** Branch chip from the design; opens the business switcher. */
export function WorkspaceSwitcher() {
  const { workspaces, workspace, setWorkspaceId, simulated } = useCrm();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex max-w-[11rem] items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-navy transition-colors hover:bg-[#dce9ff]"
          aria-label={`Business: ${workspace.name}. Switch business`}
        >
          <span className="truncate">{workspace.branch}</span>
          <ChevronDown className="h-3 w-3 shrink-0" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 shadow-[0_4px_12px_-2px_rgba(0,8,20,0.08)]">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {simulated ? 'Sample businesses (simulated)' : 'Your businesses'}
        </DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem key={w.id} onSelect={() => setWorkspaceId(w.id)} className="flex items-center justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{w.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{w.industry}</span>
            </span>
            {w.id === workspace.id && <Check className="h-4 w-4 text-navy" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

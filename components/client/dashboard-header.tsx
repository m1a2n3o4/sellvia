'use client';

import { useBranch } from '@/lib/store/branch-context';
import { ExternalLink, ChevronDown, Store } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DashboardHeader() {
  const { selectedBranch, branches, loading } = useBranch();

  if (loading) return null;

  // Specific store selected
  if (selectedBranch) {
    const storeUrl = `/store/${selectedBranch.slug}`;
    return (
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-2 min-w-0">
          <Store className="h-4 w-4 text-purple-600 flex-shrink-0" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {selectedBranch.name}
          </h2>
          {selectedBranch.city && (
            <span className="text-xs text-gray-500 flex-shrink-0">({selectedBranch.city})</span>
          )}
        </div>
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Visit Store
        </a>
      </div>
    );
  }

  // Master Dashboard (All Stores)
  const enabledBranches = branches.filter((b) => b.enabled);

  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <Store className="h-4 w-4 text-purple-600" />
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
          Master Dashboard
        </h2>
      </div>

      {enabledBranches.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors outline-none">
            <ExternalLink className="h-3.5 w-3.5" />
            Store Links
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            {enabledBranches.map((branch) => (
              <DropdownMenuItem key={branch.id} asChild>
                <a
                  href={`/store/${branch.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                  <span>{branch.name}</span>
                  {branch.city && (
                    <span className="text-xs text-gray-400 ml-auto">({branch.city})</span>
                  )}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BranchInfo } from '@/lib/store/branch-context';
import { LayoutDashboard, ExternalLink } from 'lucide-react';

interface StoreSelectorModalProps {
  open: boolean;
  branches: BranchInfo[];
  onSelect: (branchId: string | null) => void;
}

export function StoreSelectorModal({ open, branches, onSelect }: StoreSelectorModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">Select Your Store</DialogTitle>
          <DialogDescription>Choose which store to manage</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-1 max-h-[60vh] overflow-y-auto">
          {/* Master Dashboard option */}
          <button
            onClick={() => onSelect(null)}
            className="w-full text-left p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">Master Dashboard</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">View all stores combined</p>
              </div>
            </div>
          </button>

          {/* Individual stores */}
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => onSelect(branch.id)}
              className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {branch.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {branch.name}
                    {branch.city && (
                      <span className="text-xs font-normal text-gray-500 ml-1.5">— {branch.city}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <ExternalLink className="h-3 w-3" />
                    satyasell.com/store/{branch.slug}
                  </p>
                </div>
                {!branch.enabled && (
                  <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">
                    Offline
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

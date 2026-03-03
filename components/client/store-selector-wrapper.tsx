'use client';

import { useEffect } from 'react';
import { useBranch } from '@/lib/store/branch-context';
import { StoreSelectorModal } from './store-selector-modal';

const SELECTOR_KEY = 'store_selector_shown';

export function StoreSelectorWrapper({
  open,
  onDone,
}: {
  open: boolean;
  onDone: () => void;
}) {
  const { branches, setSelectedBranchId, hasBranches, loading } = useBranch();

  // Auto-dismiss if tenant has only 1 store (or none)
  useEffect(() => {
    if (open && !loading && !hasBranches) {
      localStorage.setItem(SELECTOR_KEY, '1');
      onDone();
    }
  }, [open, loading, hasBranches, onDone]);

  if (!open || loading || !hasBranches) return null;

  const handleSelect = (id: string | null) => {
    setSelectedBranchId(id);
    localStorage.setItem(SELECTOR_KEY, '1');
    onDone();
  };

  return <StoreSelectorModal open={open} branches={branches} onSelect={handleSelect} />;
}

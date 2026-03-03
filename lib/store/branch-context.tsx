'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface BranchInfo {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  enabled: boolean;
}

interface BranchContextType {
  branches: BranchInfo[];
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
  selectedBranch: BranchInfo | null;
  loading: boolean;
  hasBranches: boolean;
}

const BranchContext = createContext<BranchContextType | null>(null);

const STORAGE_KEY = 'sellvia_selected_branch';

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [selectedBranchId, setSelectedBranchIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load saved selection from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== 'null') {
        setSelectedBranchIdState(saved);
      }
    } catch {}
    setInitialized(true);
  }, []);

  // Fetch stores list once
  useEffect(() => {
    fetch('/api/client/stores')
      .then((r) => r.json())
      .then((data) => {
        const list = data.stores || data || [];
        if (Array.isArray(list)) {
          setBranches(
            list.map((s: Record<string, unknown>) => ({
              id: s.id as string,
              name: s.name as string,
              slug: s.slug as string,
              city: (s.city as string) || null,
              enabled: s.enabled as boolean,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Validate saved selection still exists
  useEffect(() => {
    if (!initialized || loading) return;
    if (selectedBranchId && branches.length > 0 && !branches.find((b) => b.id === selectedBranchId)) {
      setSelectedBranchIdState(null);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }, [branches, selectedBranchId, initialized, loading]);

  const setSelectedBranchId = useCallback((id: string | null) => {
    setSelectedBranchIdState(id);
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, []);

  const selectedBranch = selectedBranchId
    ? branches.find((b) => b.id === selectedBranchId) || null
    : null;

  const hasBranches = branches.length > 1;

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranchId,
        setSelectedBranchId,
        selectedBranch,
        loading,
        hasBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
}

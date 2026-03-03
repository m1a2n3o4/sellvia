'use client';

import { useBranch } from '@/lib/store/branch-context';
import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function BranchPicker() {
  const { branches, selectedBranchId, setSelectedBranchId, hasBranches, loading } = useBranch();

  if (loading || !hasBranches) return null;

  return (
    <Select
      value={selectedBranchId || 'all'}
      onValueChange={(v) => setSelectedBranchId(v === 'all' ? null : v)}
    >
      <SelectTrigger className="w-full h-9 text-xs border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
        <MapPin className="h-3.5 w-3.5 text-purple-600 mr-1.5 flex-shrink-0" />
        <SelectValue placeholder="All Branches" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Branches</SelectItem>
        {branches.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}{b.city ? ` — ${b.city}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

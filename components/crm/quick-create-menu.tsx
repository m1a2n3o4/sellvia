'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCrm } from './crm-context';

export function QuickCreateMenu() {
  const { quickActions } = useCrm();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(11,12,17,0.55)] transition-all hover:bg-primary-hover active:scale-[0.97]"
          aria-label="Quick create"
        >
          <Plus className="h-[18px] w-[18px] text-brand" strokeWidth={2.5} aria-hidden />
          <span className="hidden sm:inline">Quick Create</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 shadow-[0_4px_12px_-2px_rgba(0,8,20,0.08)]">
        {quickActions.map((a) => (
          <DropdownMenuItem key={a.href} asChild><Link href={a.href}>{a.label}</Link></DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

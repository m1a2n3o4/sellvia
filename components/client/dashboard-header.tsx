'use client';

import { useBranch } from '@/lib/store/branch-context';
import { useBrand } from '@/lib/store/brand-context';
import { shade } from '@/lib/store/colors';
import { ExternalLink, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DashboardHeader() {
  const { selectedBranch, branches, loading } = useBranch();
  const brand = useBrand();
  const shell = 'relative shrink-0 overflow-hidden flex items-center justify-between gap-3 mb-5 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-white shadow-lg';
  const shellStyle = { background: `linear-gradient(120deg, ${shade(brand.theme, -0.4)}, ${brand.theme} 60%, ${shade(brand.accent, -0.05)} 140%)` };
  const mark = brand.logo ? (
    <img src={brand.logo} alt={brand.name} className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover bg-white ring-2 ring-white/80 shadow-md flex-shrink-0" />
  ) : (
    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/90 flex items-center justify-center font-extrabold text-2xl flex-shrink-0" style={{ color: brand.theme }}>{(brand.name || 'B').charAt(0).toUpperCase()}</div>
  );

  if (loading || !brand.loaded) {
    // Wait for the business's own branding so the generic/default store name never flashes
    return <div className={shell} style={{ background: '#e5e7eb', minHeight: 88 }} aria-busy="true" />;
  }

  // Specific store selected
  if (selectedBranch) {
    const storeUrl = `/store/${selectedBranch.slug}`;
    return (
      <div className={shell} style={shellStyle}>
        <div className="flex items-center gap-3 min-w-0">
          {mark}
          <div className="min-w-0">
            <h2 className="font-extrabold text-lg sm:text-2xl leading-tight truncate drop-shadow">
              {brand.name || selectedBranch.name}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 truncate">
              {selectedBranch.name}{selectedBranch.city ? ` · ${selectedBranch.city}` : ''}
            </p>
          </div>
        </div>
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-white/20 hover:bg-white/30 px-3.5 py-2 rounded-full transition-colors flex-shrink-0"
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
    <div className={shell} style={shellStyle}>
      <div className="flex items-center gap-3 min-w-0">
        {mark}
        <div className="min-w-0">
          <h2 className="font-extrabold text-lg sm:text-2xl leading-tight truncate drop-shadow">
            {brand.name || 'Master Dashboard'}
          </h2>
          <p className="text-xs sm:text-sm text-white/80">Master Dashboard</p>
        </div>
      </div>

      {enabledBranches.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-white/20 hover:bg-white/30 px-3.5 py-2 rounded-full transition-colors outline-none">
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

'use client';

import { useState, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type ValidatedRow, type ValidationSummary } from '@/lib/import/validators';

type FilterTab = 'all' | 'valid' | 'warning' | 'error';

interface ImportPreviewProps {
  rows: ValidatedRow[];
  summary: ValidationSummary;
  onConfirmImport: () => void;
  onBack: () => void;
  importing: boolean;
}

const PAGE_SIZE = 20;

export function ImportPreview({ rows, summary, onConfirmImport, onBack, importing }: ImportPreviewProps) {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter(r => r.status === filter);
  }, [rows, filter]);

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const paginatedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const importableCount = summary.valid + summary.warnings;

  const tabs: { key: FilterTab; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'All', count: summary.total, color: '' },
    { key: 'valid', label: 'Valid', count: summary.valid, color: 'text-green-600' },
    { key: 'warning', label: 'Warnings', count: summary.warnings, color: 'text-yellow-600' },
    { key: 'error', label: 'Errors', count: summary.errors, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700">
        <span className="text-sm text-gray-500 dark:text-neutral-400">
          Total: <span className="font-medium text-gray-900 dark:text-white">{summary.total}</span>
        </span>
        <span className="text-sm text-green-600">
          <CheckCircle2 className="h-3.5 w-3.5 inline mr-0.5" />
          Valid: {summary.valid}
        </span>
        {summary.warnings > 0 && (
          <span className="text-sm text-yellow-600">
            <AlertTriangle className="h-3.5 w-3.5 inline mr-0.5" />
            Warnings: {summary.warnings}
          </span>
        )}
        {summary.errors > 0 && (
          <span className="text-sm text-red-600">
            <XCircle className="h-3.5 w-3.5 inline mr-0.5" />
            Errors: {summary.errors}
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-neutral-700">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setPage(1); }}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
              filter === tab.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300'
            )}
          >
            {tab.label}
            <span className={cn('ml-1', tab.color)}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-neutral-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-neutral-900">
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-neutral-400 w-10">#</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-neutral-400">Name</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-neutral-400 w-24">Price</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-neutral-400 w-24 hidden sm:table-cell">Category</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-neutral-400 w-16 hidden sm:table-cell">Stock</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-neutral-400 w-24 hidden md:table-cell">Variants</th>
              <th className="px-3 py-2 text-center font-medium text-gray-500 dark:text-neutral-400 w-10">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
            {paginatedRows.map((row) => (
              <tr
                key={row.rowIndex}
                className={cn(
                  'transition-colors',
                  row.status === 'error' && 'bg-red-50/50 dark:bg-red-950/10',
                  row.status === 'warning' && 'bg-yellow-50/50 dark:bg-yellow-950/10'
                )}
              >
                <td className="px-3 py-2 text-gray-400">{row.rowIndex + 1}</td>
                <td className="px-3 py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                      {row.data.name}
                    </p>
                    {row.issues.length > 0 && (
                      <p className={cn(
                        'text-xs mt-0.5 truncate max-w-[200px]',
                        row.status === 'error' ? 'text-red-500' : 'text-yellow-600'
                      )}>
                        {row.issues[0]}
                        {row.issues.length > 1 && ` (+${row.issues.length - 1} more)`}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">
                  &#8377;{row.data.basePrice.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-gray-500 dark:text-neutral-400 hidden sm:table-cell">
                  {row.data.category || '-'}
                </td>
                <td className="px-3 py-2 text-gray-500 dark:text-neutral-400 hidden sm:table-cell">
                  {row.data.stockQuantity}
                </td>
                <td className="px-3 py-2 hidden md:table-cell">
                  {row.data.variants && row.data.variants.length > 0 ? (
                    <Badge variant="secondary" className="text-[10px]">
                      {row.data.variants.length} variants
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {row.status === 'valid' && <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />}
                  {row.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mx-auto" />}
                  {row.status === 'error' && <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-500 dark:text-neutral-400">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Error/Skip note */}
      {summary.errors > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>{summary.errors}</strong> products will be skipped due to missing required fields.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-700">
        <Button variant="outline" onClick={onBack} disabled={importing}>
          Back
        </Button>
        <Button onClick={onConfirmImport} disabled={importableCount === 0 || importing}>
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              Import {importableCount} Products
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

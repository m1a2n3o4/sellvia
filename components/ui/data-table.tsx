'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  mobileCard?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found.',
  onRowClick,
  keyExtractor,
  mobileCard,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <>
        {/* Mobile loading skeleton */}
        {mobileCard && (
          <div className="space-y-3 md:hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        {/* Desktop loading skeleton */}
        <div className={cn('border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden', mobileCard && 'hidden md:block')}>
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider',
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-neutral-200 dark:border-neutral-700">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <div className="text-sm text-gray-500 dark:text-neutral-400 text-center py-12">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      {mobileCard && (
        <div className="space-y-3 md:hidden">
          {data.map((item) => (
            <div
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4',
                onRowClick && 'cursor-pointer active:bg-neutral-50 dark:active:bg-neutral-700'
              )}
            >
              {mobileCard(item)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop table view */}
      <div className={cn('border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden', mobileCard && 'hidden md:block')}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider',
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900',
                    onRowClick && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-sm text-gray-900 dark:text-white',
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(item)
                        : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { type SatyaSellField, type ColumnMappings } from '@/lib/import/validators';

interface ColumnMapperProps {
  headers: string[];
  autoMatched: ColumnMappings;
  sampleData: Record<string, string>[];
  onMappingConfirmed: (mappings: ColumnMappings) => void;
  onBack: () => void;
}

const FIELD_OPTIONS: { value: SatyaSellField; label: string; required?: boolean }[] = [
  { value: 'name', label: 'Product Name', required: true },
  { value: 'basePrice', label: 'Price', required: true },
  { value: 'category', label: 'Category' },
  { value: 'stockQuantity', label: 'Stock Quantity' },
  { value: 'sku', label: 'SKU' },
  { value: 'brand', label: 'Brand' },
  { value: 'description', label: 'Description' },
  { value: 'variantName', label: 'Variant Name (Size/Option)' },
  { value: 'variantAttribute', label: 'Variant Attribute (Color)' },
  { value: 'skip', label: '-- Skip --' },
];

export function ColumnMapper({ headers, autoMatched, sampleData, onMappingConfirmed, onBack }: ColumnMapperProps) {
  const [mappings, setMappings] = useState<ColumnMappings>(autoMatched);

  const updateMapping = (header: string, field: SatyaSellField) => {
    setMappings(prev => {
      const updated = { ...prev };

      // If this field is already mapped to another column, reset that one to skip
      if (field !== 'skip') {
        for (const [h, f] of Object.entries(updated)) {
          if (f === field && h !== header) {
            updated[h] = 'skip';
          }
        }
      }

      updated[header] = field;
      return updated;
    });
  };

  const hasNameMapping = useMemo(
    () => Object.values(mappings).includes('name'),
    [mappings]
  );
  const hasPriceMapping = useMemo(
    () => Object.values(mappings).includes('basePrice'),
    [mappings]
  );
  const canProceed = hasNameMapping && hasPriceMapping;

  // Get sample values for a header (first 3 non-empty)
  const getSamples = (header: string): string[] => {
    return sampleData
      .map(row => row[header])
      .filter(v => v && v.trim() !== '')
      .slice(0, 3);
  };

  const autoMatchedCount = Object.values(autoMatched).filter(f => f !== 'skip').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          We detected <span className="font-medium text-gray-900 dark:text-white">{headers.length}</span> columns in your file.
          {autoMatchedCount > 0 && (
            <> Auto-matched <span className="font-medium text-green-600">{autoMatchedCount}</span> columns.</>
          )}
        </p>
      </div>

      {/* Required fields reminder */}
      {(!hasNameMapping || !hasPriceMapping) && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Required: Map at least <strong>Product Name</strong> and <strong>Price</strong> to continue.
          </p>
        </div>
      )}

      {/* Mapping rows */}
      <div className="space-y-3">
        {headers.map(header => {
          const isAutoMatched = autoMatched[header] !== 'skip' && mappings[header] === autoMatched[header];
          const currentField = mappings[header] || 'skip';
          const samples = getSamples(header);

          return (
            <div
              key={header}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border transition-colors',
                isAutoMatched
                  ? 'border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/10'
                  : currentField !== 'skip'
                    ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/10'
                    : 'border-gray-200 dark:border-neutral-700'
              )}
            >
              {/* User's column */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    &quot;{header}&quot;
                  </p>
                  {isAutoMatched && (
                    <span className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                      <Check className="h-3 w-3" /> auto
                    </span>
                  )}
                </div>
                {samples.length > 0 && (
                  <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5 truncate">
                    e.g. {samples.join(', ')}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block flex-shrink-0" />

              {/* SatyaSell field dropdown */}
              <div className="w-full sm:w-[220px] flex-shrink-0">
                <Select
                  value={currentField}
                  onValueChange={(v) => updateMapping(header, v as SatyaSellField)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                        {opt.required && ' *'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-700">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => onMappingConfirmed(mappings)} disabled={!canProceed}>
          Preview
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}

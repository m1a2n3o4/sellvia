'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Columns, Eye, CheckCircle2, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CsvUpload, type ImportMode } from '@/components/import/csv-upload';
import { ColumnMapper } from '@/components/import/column-mapper';
import { ImportPreview } from '@/components/import/import-preview';
import { type ParsedFile } from '@/lib/import/csv-parser';
import {
  autoMatchColumns,
  applyMappings,
  validateRow,
  hasVariantMapping,
  groupVariants,
  calculateSummary,
  type ColumnMappings,
  type ValidatedRow,
  type ValidationSummary,
  type ImportProduct,
} from '@/lib/import/validators';

type Step = 1 | 2 | 3 | 4;

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

const STEPS = [
  { num: 1, label: 'Upload', icon: Upload },
  { num: 2, label: 'Map Columns', icon: Columns },
  { num: 3, label: 'Preview', icon: Eye },
  { num: 4, label: 'Done', icon: CheckCircle2 },
];

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('skip_duplicates');
  const [mappings, setMappings] = useState<ColumnMappings>({});
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [summary, setSummary] = useState<ValidationSummary>({ total: 0, valid: 0, warnings: 0, errors: 0 });
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  // Step 1: File selected
  const handleFileSelected = useCallback((_file: File, parsed: ParsedFile, mode: ImportMode) => {
    setParsedFile(parsed);
    setImportMode(mode);
    const autoMatched = autoMatchColumns(parsed.headers);
    setMappings(autoMatched);
    setStep(2);
  }, []);

  // Step 2: Mappings confirmed
  const handleMappingConfirmed = useCallback(async (confirmedMappings: ColumnMappings) => {
    if (!parsedFile) return;
    setMappings(confirmedMappings);

    // Fetch existing SKUs
    let existingSkus = new Set<string>();
    if (importMode !== 'allow_all') {
      try {
        const res = await fetch('/api/client/products?limit=10000&fields=sku');
        const data = await res.json();
        existingSkus = new Set(
          (data.products || [])
            .map((p: { sku?: string }) => p.sku?.toLowerCase())
            .filter(Boolean)
        );
      } catch {
        // If fetch fails, continue without existing SKUs
      }
    }

    // Apply mappings and validate each row
    const seenSkus = new Set<string>();
    const mappedRows: Record<string, string>[] = [];
    const validated: ValidatedRow[] = [];

    for (let i = 0; i < parsedFile.rows.length; i++) {
      const mappedRow = applyMappings(parsedFile.rows[i], confirmedMappings);
      mappedRows.push(mappedRow);
      validated.push(validateRow(mappedRow, i, seenSkus, existingSkus));
    }

    // Group variants if variant column is mapped
    let finalRows = validated;
    if (hasVariantMapping(confirmedMappings)) {
      finalRows = groupVariants(validated, mappedRows, confirmedMappings);
    }

    setValidatedRows(finalRows);
    setSummary(calculateSummary(finalRows));
    setStep(3);
  }, [parsedFile, importMode]);

  // Step 3: Confirm import
  const handleConfirmImport = useCallback(async () => {
    setImporting(true);

    // Filter out error rows and prepare data
    const importable = validatedRows
      .filter(r => r.status !== 'error')
      .map(r => r.data);

    try {
      const res = await fetch('/api/client/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          importMode,
          products: importable as ImportProduct[],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Import failed');
      }

      const data = await res.json();
      setResult(data);
      setStep(4);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  }, [validatedRows, importMode]);

  // Generate error report CSV
  const downloadErrorReport = () => {
    if (!result || result.errors.length === 0) return;
    const csv = [
      'Row,Error',
      ...result.errors.map(e => `${e.row},"${e.message.replace(/"/g, '""')}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-errors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/client/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Import Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Upload a CSV or Excel file to bulk import products
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isComplete = step > s.num;
          return (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400'
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-neutral-500'
                )}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  'w-12 sm:w-20 h-0.5 mx-1 sm:mx-2 mt-[-12px]',
                  step > s.num ? 'bg-green-500' : 'bg-gray-200 dark:bg-neutral-700'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-950">
        {step === 1 && (
          <CsvUpload onFileSelected={handleFileSelected} />
        )}

        {step === 2 && parsedFile && (
          <ColumnMapper
            headers={parsedFile.headers}
            autoMatched={autoMatchColumns(parsedFile.headers)}
            sampleData={parsedFile.rows.slice(0, 5)}
            onMappingConfirmed={handleMappingConfirmed}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ImportPreview
            rows={validatedRows}
            summary={summary}
            onConfirmImport={handleConfirmImport}
            onBack={() => setStep(2)}
            importing={importing}
          />
        )}

        {step === 4 && result && (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Complete!</h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                Your products have been imported successfully.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {result.created > 0 && (
                <span className="text-green-600">
                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                  {result.created} created
                </span>
              )}
              {result.updated > 0 && (
                <span className="text-blue-600">
                  <FileSpreadsheet className="h-4 w-4 inline mr-1" />
                  {result.updated} updated
                </span>
              )}
              {result.skipped > 0 && (
                <span className="text-gray-500">
                  {result.skipped} skipped
                </span>
              )}
              {result.errors.length > 0 && (
                <span className="text-red-600">
                  {result.errors.length} errors
                </span>
              )}
            </div>

            {result.errors.length > 0 && (
              <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                <Download className="h-4 w-4 mr-1.5" />
                Download Error Report
              </Button>
            )}

            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setStep(1);
                setParsedFile(null);
                setResult(null);
                setValidatedRows([]);
              }}>
                Import More
              </Button>
              <Button onClick={() => router.push('/client/products')}>
                View Products
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

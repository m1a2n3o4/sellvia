'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, Loader2, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { parseFile, type ParsedFile } from '@/lib/import/csv-parser';

export type ImportMode = 'skip_duplicates' | 'update_existing' | 'allow_all';

interface CsvUploadProps {
  onFileSelected: (file: File, parsed: ParsedFile, mode: ImportMode) => void;
}

export function CsvUpload({ onFileSelected }: CsvUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('skip_duplicates');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);
    setSelectedFile(file.name);

    try {
      const parsed = await parseFile(file);
      onFileSelected(file, parsed, importMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  }, [onFileSelected, importMode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Import Mode */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 dark:text-white">Import Mode</label>
        <div className="space-y-2">
          {[
            { value: 'skip_duplicates' as ImportMode, label: 'Create new products (skip duplicates)', desc: 'Products with existing SKUs will be skipped to avoid duplicates.' },
            { value: 'update_existing' as ImportMode, label: 'Update existing + create new', desc: 'Products matched by SKU will be updated. New SKUs will be created.' },
            { value: 'allow_all' as ImportMode, label: 'Create all (allow duplicates)', desc: 'Every row creates a new product, even if SKU already exists.' },
          ].map(opt => (
            <label
              key={opt.value}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                importMode === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
              )}
            >
              <input
                type="radio"
                name="importMode"
                value={opt.value}
                checked={importMode === opt.value}
                onChange={() => setImportMode(opt.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 p-8',
          loading && 'pointer-events-none opacity-60',
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : error
              ? 'border-red-300 dark:border-red-800'
              : 'border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-600'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <div className="text-center">
              <p className="font-medium text-gray-900 dark:text-white">Analyzing your file...</p>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{selectedFile}</p>
            </div>
          </>
        ) : selectedFile && !error ? (
          <>
            <FileSpreadsheet className="h-8 w-8 text-green-500" />
            <div className="text-center">
              <p className="font-medium text-gray-900 dark:text-white">{selectedFile}</p>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">File loaded successfully</p>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400 dark:text-neutral-500" />
            <div className="text-center">
              <p className="font-medium text-gray-900 dark:text-white">
                Drag & drop your file here
              </p>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-2">
                Supports: .csv, .xlsx, .xls &middot; Max 5000 products per file
              </p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Template Downloads */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href="/api/client/products/import/template?format=csv" download>
            <Download className="h-4 w-4 mr-1.5" />
            Download CSV Template
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="/api/client/products/import/template?format=xlsx" download>
            <Download className="h-4 w-4 mr-1.5" />
            Download Excel Template
          </a>
        </Button>
      </div>

      {/* Tips */}
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tips</p>
        <ul className="text-xs text-gray-500 dark:text-neutral-400 space-y-1 list-disc list-inside">
          <li>Your file should have columns for: Product Name, Price, Category, Stock, SKU, Brand, Description</li>
          <li>First row should be column headers</li>
          <li>We&apos;ll auto-detect common column names like &quot;MRP&quot;, &quot;Qty&quot;, &quot;Item Code&quot;</li>
          <li>Products with Size/Color columns will be imported as variants</li>
        </ul>
      </div>
    </div>
  );
}

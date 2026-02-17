'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface AIAnalysisResult {
  imageUrl: string;
  imagePath: string;
  prediction: {
    name: string;
    brand: string;
    category: string;
    description: string;
    basePrice: number;
    color: string;
    gender: string;
    material: string;
  } | null;
}

interface FileState {
  file: File;
  preview: string;
  status: 'uploading' | 'done' | 'error';
  error?: string;
  result?: AIAnalysisResult;
}

interface ImageUploadProps {
  onAnalyzed: (result: AIAnalysisResult) => void;
  maxFiles?: number;
  compact?: boolean;
}

export function ImageUpload({ onAnalyzed, maxFiles = 1, compact = false }: ImageUploadProps) {
  const [files, setFiles] = useState<FileState[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, and WebP files are allowed.';
    }
    if (file.size > MAX_SIZE) {
      return 'File too large. Maximum size is 5MB.';
    }
    return null;
  };

  const uploadFile = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file);
    const fileState: FileState = { file, preview, status: 'uploading' };

    setFiles(prev => [...prev, fileState]);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/client/products/ai-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const result: AIAnalysisResult = await res.json();

      setFiles(prev =>
        prev.map(f =>
          f.preview === preview ? { ...f, status: 'done', result } : f
        )
      );

      onAnalyzed(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setFiles(prev =>
        prev.map(f =>
          f.preview === preview ? { ...f, status: 'error', error: message } : f
        )
      );
    }
  }, [onAnalyzed]);

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const remaining = maxFiles - files.length;
    const toProcess = incoming.slice(0, remaining);

    for (const file of toProcess) {
      const error = validateFile(file);
      if (error) {
        setFiles(prev => [
          ...prev,
          { file, preview: '', status: 'error', error },
        ]);
        continue;
      }
      uploadFile(file);
    }
  }, [files.length, maxFiles, uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const canAddMore = files.length < maxFiles;

  return (
    <div className="space-y-3">
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-neutral-400',
            compact ? 'p-4' : 'p-8',
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-600'
          )}
        >
          <Upload className={cn(compact ? 'h-5 w-5' : 'h-8 w-8')} />
          <div className="text-center">
            <p className={cn('font-medium', compact ? 'text-sm' : 'text-base')}>
              {compact ? 'Upload product image' : 'Drop product images here'}
            </p>
            <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
              JPG, PNG, or WebP (max 5MB)
              {maxFiles > 1 && ` - Up to ${maxFiles} images`}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={maxFiles > 1}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {files.length > 0 && (
        <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3')}>
          {files.map((f, i) => (
            <div
              key={i}
              className="relative rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden bg-gray-50 dark:bg-neutral-900"
            >
              {f.preview && (
                <img
                  src={f.preview}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-2">
                {f.status === 'uploading' && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                )}
                {f.status === 'done' && f.result?.prediction && (
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                    {f.result.prediction.name || 'Product detected'}
                  </p>
                )}
                {f.status === 'done' && !f.result?.prediction && (
                  <p className="text-sm text-gray-500 dark:text-neutral-400">
                    Uploaded (no AI data)
                  </p>
                )}
                {f.status === 'error' && (
                  <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{f.error}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

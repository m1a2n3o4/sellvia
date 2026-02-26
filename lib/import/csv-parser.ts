import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

const MAX_ROWS = 5000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function parseFile(file: File): Promise<ParsedFile> {
  if (file.size > MAX_FILE_SIZE) {
    return Promise.reject(new Error('File exceeds 5MB. Please split into smaller files.'));
  }

  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    return parseCsv(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(file);
  } else {
    return Promise.reject(new Error('Unsupported file type. Please upload a .csv, .xlsx, or .xls file.'));
  }
}

function parseCsv(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete(results) {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];

        if (headers.length === 0) {
          reject(new Error('No columns found. Make sure the first row contains column headers.'));
          return;
        }

        if (rows.length === 0) {
          reject(new Error('No data found. The file only contains headers.'));
          return;
        }

        if (rows.length > MAX_ROWS) {
          reject(new Error(`Too many rows (${rows.length.toLocaleString()}). Maximum is ${MAX_ROWS.toLocaleString()} products per import.`));
          return;
        }

        resolve({
          headers: headers.filter(h => h.trim() !== ''),
          rows: rows.map(row => {
            const cleaned: Record<string, string> = {};
            for (const [key, value] of Object.entries(row)) {
              if (key.trim() !== '') {
                cleaned[key] = String(value ?? '');
              }
            }
            return cleaned;
          }),
          totalRows: rows.length,
        });
      },
      error(err) {
        reject(new Error(`Failed to parse CSV: ${err.message}`));
      },
    });
  });
}

function parseExcel(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheet = workbook.SheetNames[0];
        if (!firstSheet) {
          reject(new Error('No sheets found in the Excel file.'));
          return;
        }

        const sheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: '',
          raw: false,
        });

        if (jsonData.length === 0) {
          reject(new Error('No data found. The file only contains headers or is empty.'));
          return;
        }

        if (jsonData.length > MAX_ROWS) {
          reject(new Error(`Too many rows (${jsonData.length.toLocaleString()}). Maximum is ${MAX_ROWS.toLocaleString()} products per import.`));
          return;
        }

        const headers = Object.keys(jsonData[0]).filter(h => h.trim() !== '');
        const rows = jsonData.map(row => {
          const cleaned: Record<string, string> = {};
          for (const [key, value] of Object.entries(row)) {
            if (key.trim() !== '') {
              cleaned[key] = String(value ?? '');
            }
          }
          return cleaned;
        });

        resolve({ headers, rows, totalRows: rows.length });
      } catch {
        reject(new Error('Failed to parse Excel file. The file may be corrupted.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

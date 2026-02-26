import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

const TEMPLATE_HEADERS = [
  'Product Name',
  'Price',
  'Category',
  'Stock Quantity',
  'SKU',
  'Brand',
  'Description',
];

const SAMPLE_ROWS = [
  ['Red Cotton Kurti', '599', "Women's Clothing", '50', 'SKU001', 'FabIndia', 'Beautiful red cotton kurti with embroidery'],
  ['Blue Slim Jeans', '899', "Men's Clothing", '30', 'SKU002', "Levi's", 'Slim fit blue denim jeans'],
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';

  if (format === 'xlsx') {
    const data = [TEMPLATE_HEADERS, ...SAMPLE_ROWS];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = TEMPLATE_HEADERS.map((h) => ({ wch: Math.max(h.length + 2, 15) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="satyasell-product-template.xlsx"',
      },
    });
  }

  // CSV
  const csvContent = [
    TEMPLATE_HEADERS.join(','),
    ...SAMPLE_ROWS.map(row =>
      row.map(cell => {
        // Escape cells that contain commas
        if (cell.includes(',') || cell.includes('"')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ),
  ].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="satyasell-product-template.csv"',
    },
  });
}

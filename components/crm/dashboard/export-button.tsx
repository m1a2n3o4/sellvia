'use client';

import { Download } from 'lucide-react';
import { btn } from '../button-styles';
import type { DashboardData } from '@/lib/crm/mock/dashboard';

/** Downloads the on-screen KPI snapshot as CSV (client-side, no server round trip). */
export function ExportButton({ data }: { data: DashboardData }) {
  const onClick = () => {
    const rows = [
      ['Metric', 'Value', 'Note'],
      ['Gross retail volume', data.gross.value, data.gross.vs],
      ['Active DM leads', String(data.leads.active), data.leads.awaiting],
      ['Recovered carts', data.recovered.value, data.recovered.note],
      ['AI response time', data.ai.avg, data.ai.note],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'satyasell-overview.csv'; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button onClick={onClick} className={btn.outline}>
      <Download className="h-4 w-4" aria-hidden />Export
    </button>
  );
}

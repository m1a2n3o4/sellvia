import type { LucideIcon } from 'lucide-react';

export function KPIStatCard({ label, value, hint, icon: Icon }: {
  label: string; value: string; hint?: string; icon: LucideIcon;
}) {
  return (
    <div className="crm-card crm-card-hover p-4">
      <div className="flex items-center justify-between">
        <p className="t-micro text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-brand" aria-hidden />
      </div>
      <p className="t-h2 num mt-2">{value}</p>
      {hint && <p className="t-small mt-1 text-muted-foreground">{hint}</p>}
    </div>
  );
}

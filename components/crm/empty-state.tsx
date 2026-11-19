import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="crm-card flex flex-col items-center justify-center !border-dashed !border-[#c3c9db] px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-6 w-6 text-brand" strokeWidth={2.25} aria-hidden />
      </div>
      <h2 className="t-h3">{title}</h2>
      {description && <p className="t-body mt-1 max-w-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

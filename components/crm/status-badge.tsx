import { cn } from '@/lib/utils';

const TONES = {
  neutral: 'border-border bg-muted text-ink',
  info: 'border-transparent bg-secondary text-navy',
  accent: 'border-brand/40 bg-brand/15 text-ink',
  success: 'border-transparent bg-success/10 text-success',
  danger: 'border-transparent bg-danger/10 text-danger',
} as const;

export function StatusBadge({ tone = 'neutral', children, className }: {
  tone?: keyof typeof TONES; children: React.ReactNode; className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold', TONES[tone], className)}>
      {children}
    </span>
  );
}

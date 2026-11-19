// Pill buttons from the soft-pill design. Kept under components/ so Tailwind scans them.
const base = 'inline-flex items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45';
export const btn = {
  brand: `${base} h-10 bg-primary px-5 text-white shadow-[0_8px_18px_-8px_rgba(11,12,17,0.55)] hover:bg-primary-hover`,
  navy: `${base} h-10 bg-primary px-5 text-white shadow-[0_8px_18px_-8px_rgba(11,12,17,0.55)] hover:bg-primary-hover`,
  outline: `${base} h-10 border border-white/90 bg-white/80 px-5 text-ink shadow-[var(--shadow-rest)] hover:bg-white hover:shadow-md`,
  ghost: `${base} h-10 px-4 text-ink hover:bg-white/70`,
  small: `${base} h-8 px-3.5 text-[12px]`,
} as const;

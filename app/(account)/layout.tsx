import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import '../app/crm.css';

const font = Urbanist({ subsets: ['latin'], variable: '--font-crm', display: 'swap' });
export const metadata: Metadata = { title: 'SatyaSell account' };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={font.variable}>
      <div className="crm-root flex min-h-screen items-center justify-center px-4 py-10">{children}</div>
    </div>
  );
}

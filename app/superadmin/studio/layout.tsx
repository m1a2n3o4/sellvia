import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import { StudioProvider } from '@/lib/studio/store';
import { StudioShell } from '@/components/studio/studio-shell';
import '../../app/crm.css';

const font = Urbanist({ subsets: ['latin'], variable: '--font-crm', display: 'swap' });
export const metadata: Metadata = { title: 'Business Studio', robots: { index: false, follow: false } };

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={font.variable}>
      <StudioProvider><StudioShell>{children}</StudioShell></StudioProvider>
    </div>
  );
}

import Link from 'next/link';
import { Phone, Instagram, MapPin } from 'lucide-react';
import { shade, telHref, prettyPhone, instagramHandle } from '@/lib/store/colors';

interface StoreFooterProps {
  slug: string;
  storeName: string;
  storeLogo?: string | null;
  themeColor?: string;
  description?: string | null;
  phone?: string | null;
  instagramUrl?: string | null;
  city?: string | null;
}

export function StoreFooter({ slug, storeName, storeLogo, themeColor = '#2563eb', description, phone, instagramUrl, city }: StoreFooterProps) {
  const base = `/store/${slug}`;
  return (
    <footer id="contact" className="mt-12 text-white" style={{ background: `linear-gradient(135deg, ${shade(themeColor, -0.5)}, ${shade(themeColor, -0.25)})` }}>
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            {storeLogo && <img src={storeLogo} alt={storeName} className="h-14 w-14 rounded-full object-cover bg-white ring-2 ring-white/70" />}
            <h3 className="text-xl font-extrabold leading-tight">{storeName}</h3>
          </div>
          {description && <p className="mt-3 text-sm text-white/75 line-clamp-4">{description}</p>}
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-white/90">Quick links</h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li><Link href={base} className="hover:text-white">Home</Link></li>
            <li><Link href={`${base}#shop`} className="hover:text-white">Shop all products</Link></li>
            <li><Link href={`${base}#about`} className="hover:text-white">About us</Link></li>
            <li><Link href={`${base}/cart`} className="hover:text-white">Your cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-white/90">Get in touch</h4>
          <ul className="space-y-2.5 text-sm text-white/80">
            {phone && (
              <li><a href={telHref(phone)} className="inline-flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4" /> {prettyPhone(phone)}</a></li>
            )}
            {instagramUrl && (
              <li><a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white"><Instagram className="h-4 w-4" /> {instagramHandle(instagramUrl)}</a></li>
            )}
            {city && <li className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {city}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-white/60">
          <span>© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
          <span>
            Powered by{' '}
            <Link href="https://www.satyasell.com" target="_blank" className="font-semibold text-white/80 hover:text-white">SatyaSell</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

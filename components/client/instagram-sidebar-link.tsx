'use client';

import { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';
import { SidebarLink } from '@/components/ui/sidebar';

/** Sidebar shortcut to the new Instagram page. Renders nothing unless this business is explicitly enabled. */
export function InstagramSidebarLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let live = true;
    fetch('/api/crm/access', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { show: false }))
      .then((j) => { if (live) setShow(!!j.show); })
      .catch(() => { /* stays hidden */ });
    return () => { live = false; };
  }, []);
  if (!show) return null;
  return <SidebarLink link={{ label: 'Instagram', href: '/instagram', icon: <Instagram className="h-5 w-5 flex-shrink-0 text-pink-600" /> }} />;
}

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, MessageCircle, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onMoreClick: () => void;
}

const tabs = [
  { label: 'Home', href: '/client', icon: LayoutDashboard, exact: true },
  { label: 'Products', href: '/client/products', icon: Package },
  { label: 'Orders', href: '/client/orders', icon: ShoppingCart },
  { label: 'Chats', href: '/client/chats', icon: MessageCircle },
];

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 md:hidden">
      <div className="flex items-center justify-around h-16 px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {tabs.map((tab) => {
          const active = isActive(tab.href, tab.exact);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full min-w-0 gap-0.5 transition-colors',
                active ? 'text-purple-600' : 'text-gray-400'
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className={cn('text-[10px] leading-tight', active ? 'font-semibold' : 'font-normal')}>
                {tab.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center flex-1 h-full min-w-0 gap-0.5 text-gray-400 transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] leading-tight font-normal">More</span>
        </button>
      </div>
    </nav>
  );
}

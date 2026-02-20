'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from '@/components/ui/sidebar';
import { BottomNav } from '@/components/ui/bottom-nav';
import {
  LayoutDashboard,
  MessageCircle,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/client/logout', { method: 'POST' });
      router.push('/client/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't show sidebar on login page
  if (pathname === '/client/login' || pathname === '/client/change-pin') {
    return <>{children}</>;
  }

  const links = [
    {
      label: 'Dashboard',
      href: '/client',
      icon: (
        <LayoutDashboard
          className={cn(
            'h-5 w-5 flex-shrink-0',
            pathname === '/client'
              ? 'text-black dark:text-white'
              : 'text-neutral-500 dark:text-neutral-400'
          )}
        />
      ),
    },
    {
      label: 'Live Chat',
      href: '/client/chats',
      icon: (
        <MessageCircle
          className={cn(
            'h-5 w-5 flex-shrink-0',
            pathname?.startsWith('/client/chats')
              ? 'text-black dark:text-white'
              : 'text-neutral-500 dark:text-neutral-400'
          )}
        />
      ),
    },
    {
      label: 'My Products',
      href: '/client/products',
      icon: (
        <Package
          className={cn(
            'h-5 w-5 flex-shrink-0',
            pathname?.startsWith('/client/products')
              ? 'text-black dark:text-white'
              : 'text-neutral-500 dark:text-neutral-400'
          )}
        />
      ),
    },
    {
      label: 'Orders',
      href: '/client/orders',
      icon: (
        <ShoppingCart
          className={cn(
            'h-5 w-5 flex-shrink-0',
            pathname?.startsWith('/client/orders')
              ? 'text-black dark:text-white'
              : 'text-neutral-500 dark:text-neutral-400'
          )}
        />
      ),
    },
    {
      label: 'My Customers',
      href: '/client/customers',
      icon: (
        <Users
          className={cn(
            'h-5 w-5 flex-shrink-0',
            pathname?.startsWith('/client/customers')
              ? 'text-black dark:text-white'
              : 'text-neutral-500 dark:text-neutral-400'
          )}
        />
      ),
    },
    {
      label: 'Settings',
      href: '/client/settings',
      icon: (
        <Settings
          className={cn(
            'h-5 w-5 flex-shrink-0',
            pathname?.startsWith('/client/settings')
              ? 'text-black dark:text-white'
              : 'text-neutral-500 dark:text-neutral-400'
          )}
        />
      ),
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1',
        'h-screen'
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="flex items-center justify-start gap-2 group/sidebar py-2 w-full"
            >
              <LogOut className="h-5 w-5 flex-shrink-0 text-red-500" />
              <motion.span
                animate={{
                  display: open ? 'inline-block' : 'none',
                  opacity: open ? 1 : 0,
                }}
                className="text-red-500 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                Logout
              </motion.span>
            </button>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="p-4 md:p-8 pb-20 md:pb-8 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col flex-1 w-full h-full overflow-y-auto">
          {children}
        </div>
      </div>

      <BottomNav onMoreClick={() => setOpen(true)} />
    </div>
  );
}

const Logo = () => {
  return (
    <Link
      href="/client"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        BizManager
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/client"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

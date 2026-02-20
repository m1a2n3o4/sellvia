'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/superadmin/logout', {
        method: 'POST',
      });

      router.push('/superadmin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't show nav on login page
  if (pathname === '/superadmin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link
                href="/superadmin"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/superadmin/clients"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname?.startsWith('/superadmin/clients')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Clients
              </Link>
              <Link
                href="/superadmin/enquiries"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname?.startsWith('/superadmin/enquiries')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Enquiries
              </Link>
            </div>

            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">Super Admin</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

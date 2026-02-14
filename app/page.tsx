import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Welcome to BizManager
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage your inventory, orders, and customers efficiently with our
          powerful business management platform
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/superadmin/login"
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Super Admin Login
          </Link>
          <Link
            href="/client/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Client Login
          </Link>
        </div>

        <div className="pt-8 text-sm text-gray-500">
          <p>Built with Next.js 14, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}

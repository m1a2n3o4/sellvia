import Link from 'next/link';

export default function StoreNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🏪</div>
        <h1 className="text-xl font-bold text-gray-900">Store Not Found</h1>
        <p className="text-sm text-gray-500 mt-2">
          The store you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Go to SatyaSell Home
        </Link>
        <p className="text-xs text-gray-400 mt-6">
          Are you a seller? Create your own free store at{' '}
          <Link href="/" className="text-blue-500 hover:underline">
            satyasell.com
          </Link>
        </p>
      </div>
    </div>
  );
}

import Link from 'next/link';

export function StoreFooter() {
  return (
    <footer className="border-t border-gray-100 py-6 mt-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-xs text-gray-400">
          Powered by{' '}
          <Link
            href="https://www.satyasell.com"
            target="_blank"
            className="font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            SatyaSell
          </Link>
        </p>
      </div>
    </footer>
  );
}

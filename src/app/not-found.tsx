import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Seite nicht gefunden
        </h2>
        <p className="text-gray-600 mb-4">
          Die angeforderte Seite konnte nicht gefunden werden.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
} 
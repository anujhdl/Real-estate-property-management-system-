import { Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20 bg-zinc-50">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-900 text-gold-400 flex items-center justify-center mx-auto mb-5">
          <Building2 className="w-5 h-5" />
        </div>
        <p className="font-mono text-xs font-medium text-gold-600 mb-2">404 — Page Not Found</p>
        <h1 className="font-display text-4xl font-semibold text-zinc-900 mb-3">
          This Address Could Not Be Located
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed mb-8">
          The property listing or page you requested does not exist or may have been moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            to="/properties"
            className="px-5 py-2.5 bg-white border border-zinc-300 text-zinc-900 text-sm font-medium rounded-lg hover:border-zinc-900"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}

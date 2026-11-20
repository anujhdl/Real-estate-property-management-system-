import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftRight, X } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export function CompareDrawer() {
  const { compareIds, properties, toggleCompare, clearCompare } = useProperties();
  const location = useLocation();

  if (compareIds.length === 0 || location.pathname === '/compare') {
    return null;
  }

  const selected = compareIds
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (selected.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl bg-zinc-950 text-white border border-zinc-800 rounded-xl shadow-2xl px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <ArrowLeftRight className="w-4 h-4 text-gold-400 shrink-0" />
        <div className="flex items-center gap-2 overflow-x-auto min-w-0">
          {selected.map((prop) => (
            <span
              key={prop.id}
              className="inline-flex items-center gap-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1 whitespace-nowrap"
            >
              <span className="max-w-[130px] truncate">{prop.title}</span>
              <button
                type="button"
                onClick={() => toggleCompare(prop.id)}
                aria-label={`Remove ${prop.title} from comparison`}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={clearCompare}
          className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          Clear
        </button>
        <Link
          to="/compare"
          className="px-4 py-2 text-xs font-medium bg-gold-500 text-zinc-950 rounded-lg hover:bg-gold-400 transition-colors whitespace-nowrap"
        >
          Compare ({selected.length})
        </Link>
      </div>
    </div>
  );
}

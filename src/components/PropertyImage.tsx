import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface PropertyImageProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function PropertyImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  priority = false,
}: PropertyImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`bg-gradient-to-br from-zinc-100 via-stone-100 to-zinc-200 flex flex-col items-center justify-center text-zinc-500 p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="w-8 h-8 mb-2 text-zinc-400" strokeWidth={1.5} />
        <span className="text-xs font-medium text-zinc-500 text-center line-clamp-2 max-w-[200px]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

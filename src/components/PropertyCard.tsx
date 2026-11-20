import { Link } from 'react-router-dom';
import { ArrowLeftRight, Heart, MapPin } from 'lucide-react';
import { formatArea, formatINR, type Property } from '../models/types';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { PropertyImage } from './PropertyImage';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { toggleFavorite } = useAuth();
  const { isFavorite, isComparing, toggleCompare } = useProperties();

  const saved = isFavorite(property.id);
  const comparing = isComparing(property.id);

  return (
    <article className="group bg-white border border-zinc-200/90 rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-lg flex flex-col">
      {/* Image Frame */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        <Link to={`/properties/${property.id}`} className="block w-full h-full">
          <PropertyImage
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </Link>

        {/* Functional Affordance Controls (Favourite & Compare) */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleCompare(property.id)}
            aria-label={comparing ? 'Remove from comparison' : 'Add to comparison'}
            title={comparing ? 'Comparing' : 'Compare property'}
            className={`w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer ${
              comparing
                ? 'bg-zinc-900 text-gold-400'
                : 'bg-white/90 text-zinc-700 hover:bg-white hover:text-zinc-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => void toggleFavorite(property.id)}
            aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
            title={saved ? 'Saved in favourites' : 'Save property'}
            className={`w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer ${
              saved
                ? 'bg-zinc-900 text-gold-400'
                : 'bg-white/90 text-zinc-700 hover:bg-white hover:text-zinc-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Clean Scrim Price Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pt-8 pb-3 flex items-end justify-between">
          <span className="text-lg font-semibold text-white tabular-nums tracking-tight">
            {formatINR(property.price, property.listingType)}
          </span>
          <span className="text-xs font-medium text-white/90">
            For {property.listingType}
            {property.status !== 'Available' ? ` · ${property.status}` : ''}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Clean unboxed metadata kicker */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5">
          <span>{property.propertyType}</span>
          <span aria-hidden="true">&middot;</span>
          <span className="font-mono text-[11px]">{property.propertyCode}</span>
        </div>

        <Link
          to={`/properties/${property.id}`}
          className="font-display text-xl font-semibold text-zinc-900 group-hover:text-gold-600 transition-colors line-clamp-1 mb-1.5"
        >
          {property.title}
        </Link>

        <p className="flex items-center gap-1.5 text-sm text-zinc-600 mb-4 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
          <span className="truncate">{property.location}</span>
        </p>

        {/* Specifications strip */}
        <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600 tabular-nums">
          <div className="flex items-center gap-2.5">
            {property.bedrooms > 0 && <span>{property.bedrooms} Beds</span>}
            {property.bedrooms > 0 && property.bathrooms > 0 && (
              <span aria-hidden="true" className="text-zinc-300">
                /
              </span>
            )}
            {property.bathrooms > 0 && <span>{property.bathrooms} Baths</span>}
            {(property.bedrooms > 0 || property.bathrooms > 0) && (
              <span aria-hidden="true" className="text-zinc-300">
                /
              </span>
            )}
            <span>{formatArea(property.area)}</span>
          </div>
          <Link
            to={`/properties/${property.id}`}
            className="font-medium text-zinc-900 hover:text-gold-600 transition-colors whitespace-nowrap shrink-0"
          >
            Details &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}

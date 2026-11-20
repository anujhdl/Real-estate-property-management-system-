import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowLeftRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import {
  formatArea,
  formatExactINR,
  formatINR,
  type InquiryType,
} from '../models/types';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { PropertyImage } from '../components/PropertyImage';
import { InquiryForm } from '../components/InquiryForm';
import { PropertyCard } from '../components/PropertyCard';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { properties, isFavorite, isComparing, toggleCompare } = useProperties();
  const { toggleFavorite } = useAuth();

  const property = useMemo(
    () => properties.find((p) => p.id === id) || null,
    [properties, id]
  );

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [preferredInquiryType, setPreferredInquiryType] = useState<InquiryType>('Buying');
  const inquirySectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveImgIdx(0);
    if (property) {
      document.title = `${property.title} | Aurelia Estates`;
      setPreferredInquiryType(property.listingType === 'Rent' ? 'Renting' : 'Buying');
    }
  }, [property]);

  const similarProperties = useMemo(() => {
    if (!property) return [];
    return properties
      .filter((p) => p.id !== property.id && (p.propertyType === property.propertyType || p.city === property.city))
      .slice(0, 3);
  }, [properties, property]);

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-zinc-900 mb-3">
          Property Not Found
        </h1>
        <p className="text-sm text-zinc-600 mb-6">
          This listing may have been removed or its link may be incorrect.
        </p>
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Properties
        </Link>
      </div>
    );
  }

  const images = property.images.length > 0 ? property.images : [''];
  const saved = isFavorite(property.id);
  const comparing = isComparing(property.id);
  const pricePerSqFt = property.area > 0 ? Math.round(property.price / property.area) : 0;

  const lat = property.latitude ?? 19.076;
  const lng = property.longitude ?? 72.8777;
  const mapDelta = 0.02;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - mapDelta}%2C${lat - mapDelta}%2C${lng + mapDelta}%2C${lat + mapDelta}&layer=mapnik&marker=${lat}%2C${lng}`;

  const whatsappNumber =
    (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '919820012345';
  const whatsappHref = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hello Aurelia Estates, I am interested in ${property.title} (${property.propertyCode}) listed at ${formatINR(property.price, property.listingType)}.`
  )}`;

  const scrollToVisitForm = () => {
    setPreferredInquiryType('Site Visit');
    inquirySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb & Actions Bar */}
      <div className="border-b border-zinc-200 bg-zinc-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link to="/properties" className="hover:text-zinc-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              All Properties
            </Link>
            <span aria-hidden="true">/</span>
            <span>{property.city}</span>
            <span aria-hidden="true">/</span>
            <span className="font-mono text-zinc-800">{property.propertyCode}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => toggleCompare(property.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                comparing
                  ? 'bg-zinc-900 text-gold-400 border-zinc-900'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              {comparing ? 'Comparing' : 'Compare'}
            </button>
            <button
              type="button"
              onClick={() => void toggleFavorite(property.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                saved
                  ? 'bg-zinc-900 text-gold-400 border-zinc-900'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Title & Headline Price Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-2">
              <span className="font-medium text-gold-600">{property.propertyType}</span>
              <span aria-hidden="true">&middot;</span>
              <span>For {property.listingType}</span>
              <span aria-hidden="true">&middot;</span>
              <span
                className={
                  property.status === 'Available'
                    ? 'text-emerald-700 font-medium'
                    : 'text-amber-700 font-medium'
                }
              >
                Status: {property.status}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-zinc-900 tracking-tight headline-balance">
              {property.title}
            </h1>
            <p className="mt-2.5 flex items-center gap-1.5 text-sm text-zinc-600">
              <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
              <span>
                {property.location}, {property.city}
              </span>
            </p>
          </div>

          <div className="lg:text-right">
            <p className="text-3xl sm:text-4xl font-semibold text-zinc-900 tabular-nums tracking-tight">
              {formatINR(property.price, property.listingType)}
            </p>
            <p className="text-xs text-zinc-500 mt-1 tabular-nums">
              {formatExactINR(property.price)}
              {property.listingType === 'Buy' && pricePerSqFt > 0
                ? ` · ₹${pricePerSqFt.toLocaleString('en-IN')} / sq. ft.`
                : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout: Gallery + Details (Left) | Sticky Contact & Inquiry Sidebar (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 8 Columns */}
          <div className="lg:col-span-8 space-y-10">
            {/* Large Interactive Gallery */}
            <div>
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                <PropertyImage
                  src={images[activeImgIdx]}
                  alt={`${property.title} — photograph ${activeImgIdx + 1}`}
                  priority
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                      }
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-md hover:bg-white cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                      }
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-md hover:bg-white cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-zinc-950/75 text-white text-xs tabular-nums">
                      {activeImgIdx + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setActiveImgIdx(idx)}
                      className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-opacity cursor-pointer ${
                        idx === activeImgIdx
                          ? 'border-zinc-900 opacity-100'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <PropertyImage
                        src={img}
                        alt={`${property.title} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-zinc-200 tabular-nums">
              <div>
                <p className="text-xs text-zinc-500">Carpet / Plot Area</p>
                <p className="text-base font-semibold text-zinc-900 mt-1">
                  {formatArea(property.area)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Bedrooms</p>
                <p className="text-base font-semibold text-zinc-900 mt-1">
                  {property.bedrooms > 0 ? `${property.bedrooms} Bedrooms` : 'Open Plan / Plot'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Bathrooms</p>
                <p className="text-base font-semibold text-zinc-900 mt-1">
                  {property.bathrooms > 0 ? `${property.bathrooms} Bathrooms` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Property ID</p>
                <p className="text-base font-semibold font-mono text-zinc-900 mt-1">
                  {property.propertyCode}
                </p>
              </div>
            </div>

            {/* Property Description */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-zinc-900 mb-3">
                Architectural Overview
              </h2>
              <p className="text-sm sm:text-base text-zinc-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-zinc-900 mb-4">
                Features &amp; Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 text-sm text-zinc-800"
                  >
                    <Check className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map / Location Section */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h2 className="font-display text-2xl font-semibold text-zinc-900">
                  Location &amp; Neighbourhood
                </h2>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-gold-600 hover:underline"
                >
                  Open Larger Map &rarr;
                </a>
              </div>
              <p className="text-sm text-zinc-600 mb-4">
                {property.location}, {property.city}, India &middot; Coordinates:{' '}
                <span className="font-mono text-xs tabular-nums">
                  {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                </span>
              </p>
              <div className="rounded-xl overflow-hidden border border-zinc-200 h-[320px] bg-zinc-100">
                <iframe
                  title={`Map showing ${property.title} in ${property.location}`}
                  src={osmEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Agent Actions & Inquiry Form */}
          <aside ref={inquirySectionRef} className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-zinc-950 text-white rounded-xl p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-gold-400">Private Advisory Desk</p>
                <h2 className="font-display text-2xl font-semibold text-white mt-1">
                  Arrange a Private Viewing
                </h2>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Connect directly with our {property.city} specialist for floor plans, legal
                  dossier, and chauffeur-assisted inspection.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={scrollToVisitForm}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 text-zinc-950 text-sm font-semibold rounded-lg hover:bg-gold-400 transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule a Site Visit
                </button>
                <a
                  href="tel:+912268409200"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Phone className="w-4 h-4 text-gold-400" />
                  Contact Agent (+91 22 6840 9200)
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-gold-400" />
                  WhatsApp About This Property
                </a>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <h3 className="font-display text-2xl font-semibold text-zinc-900 mb-1">
                Submit Property Inquiry
              </h3>
              <p className="text-xs text-zinc-500 mb-5">
                Regarding <span className="font-medium text-zinc-800">{property.title}</span>
              </p>
              <InquiryForm
                propertyId={property.id}
                propertyTitle={`${property.title} (${property.propertyCode})`}
                defaultInquiryType={preferredInquiryType}
                compact
              />
            </div>
          </aside>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-20 pt-14 border-t border-zinc-200">
            <h2 className="font-display text-3xl font-semibold text-zinc-900 mb-8">
              Similar Properties You May Consider
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {similarProperties.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

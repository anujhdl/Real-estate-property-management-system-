import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { HERO_IMAGE } from '../database/seedProperties';
import {
  PROPERTY_CATEGORIES,
  type ListingType,
} from '../models/types';
import { useProperties } from '../context/PropertyContext';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyImage } from '../components/PropertyImage';

const PRICE_RANGES = [
  { label: 'Any Price', min: '', max: '' },
  { label: 'Up to ₹5 Lakh / mo (Rent)', min: '', max: '500000' },
  { label: '₹2 Cr – ₹5 Cr', min: '20000000', max: '50000000' },
  { label: '₹5 Cr – ₹15 Cr', min: '50000000', max: '150000000' },
  { label: '₹15 Cr+', min: '150000000', max: '' },
];

const POPULAR_CITIES = [
  {
    city: 'Mumbai',
    subtitle: 'Worli Seaface, Lower Parel, BKC & Alibaug',
    image: '/src/assets/images/apt_mumbai_seaface_1795170409446.jpg',
  },
  {
    city: 'Gurugram',
    subtitle: 'Golf Course Road, DLF Phase 5 & Cyber City',
    image: '/src/assets/images/apt_gurgaon_skyline_1795170174191.jpg',
  },
  {
    city: 'Bengaluru',
    subtitle: 'Whitefield, Indiranagar & Devanahalli',
    image: '/src/assets/images/villa_bengaluru_garden_1795170145210.jpg',
  },
  {
    city: 'New Delhi',
    subtitle: 'Vasant Vihar & Noida Expressway Enclaves',
    image: '/src/assets/images/house_delhi_vasant_1795170209059.jpg',
  },
  {
    city: 'Pune',
    subtitle: 'Koregaon Park, Baner & Lonavala Ridges',
    image: '/src/assets/images/apt_pune_koregaon_1795170144314.jpg',
  },
  {
    city: 'Goa',
    subtitle: 'Assagao & North Goa Heritage Estates',
    image: '/src/assets/images/villa_goa_courtyard_1795170409058.jpg',
  },
];

const WHY_CHOOSE_PILLARS = [
  {
    index: '01.',
    title: 'Title-Verified Inventory',
    description:
      'Every residential estate, commercial floor plate, and NA plot undergoes independent legal due diligence, RERA verification, and encumbrance checks prior to listing.',
    metric: '100% RERA & Title Audited',
  },
  {
    index: '02.',
    title: 'Transparent INR Valuation',
    description:
      'Direct benchmark pricing derived from registered sub-registrar transaction comparables across Mumbai, NCR, Bengaluru, Pune, Hyderabad, and Goa.',
    metric: '₹4,200+ Cr Advised Since 2016',
  },
  {
    index: '03.',
    title: 'Private Site Tours & Negotiation',
    description:
      'Dedicated senior advisors arrange chauffeur-assisted inspections, structural walkthroughs, and confidential bilateral price negotiations.',
    metric: '18-Day Avg. Closing Cycle',
  },
  {
    index: '04.',
    title: 'End-to-End Post-Acquisition Care',
    description:
      'From stamp duty documentation and NRI repatriation guidance to corporate tenant onboarding and facility oversight, one desk handles the entire lifecycle.',
    metric: '94% Repeat & Referral Clients',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'We spent eight months evaluating independent bungalows in South Delhi with inconsistent broker disclosures. Aurelia Estates audited three off-market titles in ten days and closed our Vasant Vihar acquisition without a single documentation delay.',
    author: 'Rajiv Malhotra',
    role: 'Managing Director, Malhotra Precision Engineering',
    location: 'New Delhi',
  },
  {
    quote:
      'Relocating our regional headquarters to Cyber City required a turnkey floor plate within six weeks. Their commercial desk negotiated rent-free fit-out terms that reduced our first-year occupancy cost by 19%.',
    author: 'Meera Krishnan',
    role: 'VP of Operations, Verve FinTech India',
    location: 'Gurugram',
  },
  {
    quote:
      'As NRI buyers based in Singapore, purchasing a coastal villa in Alibaug felt daunting. Aurelia coordinated virtual inspections, FEMA compliance, and society handover seamlessly from start to finish.',
    author: 'Siddharth & Ananya Kulkarni',
    role: 'Private Investors',
    location: 'Mumbai & Singapore',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { properties, loading } = useProperties();

  const [listingType, setListingType] = useState<'All' | ListingType>('All');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [priceRangeIdx, setPriceRangeIdx] = useState('0');
  const [bedrooms, setBedrooms] = useState('');

  const uniqueCities = useMemo(() => {
    const set = new Set(properties.map((p) => p.city));
    return Array.from(set).sort();
  }, [properties]);

  const featuredProperties = useMemo(
    () => properties.filter((p) => p.featured).slice(0, 6),
    [properties]
  );

  const recentProperties = useMemo(
    () =>
      [...properties]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [properties]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (listingType !== 'All') params.set('listingType', listingType);
    if (location) params.set('location', location);
    if (category) params.set('category', category);
    const chosenRange = PRICE_RANGES[Number(priceRangeIdx)];
    if (chosenRange?.min) params.set('minPrice', chosenRange.min);
    if (chosenRange?.max) params.set('maxPrice', chosenRange.max);
    if (bedrooms) params.set('bedrooms', bedrooms);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[640px] lg:min-h-[700px] flex items-center bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0">
          <PropertyImage
            src={HERO_IMAGE}
            alt="Luxury contemporary architectural residence at twilight"
            priority
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/55 to-zinc-950/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-gold-400 mb-4 tracking-wide">
              Curated Residential &amp; Commercial Advisory Across India
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.08] tracking-tight headline-balance">
              Find Your Perfect Property, Make It Your Home.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-zinc-200 max-w-2xl leading-relaxed">
              Explore title-verified luxury villas, sea-facing apartments, heritage bungalows,
              gated residential plots, and Grade-A commercial spaces managed by senior advisors.
            </p>
          </div>

          {/* Integrated Property Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mt-10 bg-white rounded-xl shadow-2xl p-4 sm:p-5 max-w-5xl border border-zinc-200/80"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-100">
              <div className="inline-flex items-center p-1 bg-zinc-100 rounded-lg">
                {(['All', 'Buy', 'Rent'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setListingType(tab)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      listingType === tab
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {tab === 'All' ? 'All Listings' : `For ${tab}`}
                  </button>
                ))}
              </div>
              <span className="text-xs text-zinc-500 tabular-nums">
                {properties.length} verified listings across {uniqueCities.length} cities
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label
                  htmlFor="hero-location"
                  className="block text-xs font-medium text-zinc-600 mb-1"
                >
                  Location
                </label>
                <select
                  id="hero-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="hero-category"
                  className="block text-xs font-medium text-zinc-600 mb-1"
                >
                  Property Type
                </label>
                <select
                  id="hero-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="">All Categories</option>
                  {PROPERTY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="hero-price"
                  className="block text-xs font-medium text-zinc-600 mb-1"
                >
                  Price Range
                </label>
                <select
                  id="hero-price"
                  value={priceRangeIdx}
                  onChange={(e) => setPriceRangeIdx(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  {PRICE_RANGES.map((range, i) => (
                    <option key={range.label} value={String(i)}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="hero-beds"
                  className="block text-xs font-medium text-zinc-600 mb-1"
                >
                  Bedrooms
                </label>
                <select
                  id="hero-beds"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="">Any Bedrooms</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-4 h-4 text-gold-400" />
                  Search Properties
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium text-gold-600 mb-2">Signature Portfolio</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight">
              Featured Properties
            </h2>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-gold-600 transition-colors whitespace-nowrap"
          >
            View All {properties.length} Listings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading && properties.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[380px] rounded-xl bg-zinc-100 animate-pulse border border-zinc-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Locations */}
      <section className="bg-zinc-50 border-y border-zinc-200/70 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-medium text-gold-600 mb-2">Regional Presence</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight">
                Popular Locations
              </h2>
            </div>
            <p className="text-sm text-zinc-600 max-w-md">
              Select a city to filter active residential estates, penthouses, plots, and commercial
              assets in that market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_CITIES.map((item) => {
              const count = properties.filter(
                (p) => p.city.toLowerCase() === item.city.toLowerCase()
              ).length;

              return (
                <Link
                  key={item.city}
                  to={`/properties?location=${encodeURIComponent(item.city)}`}
                  className="group relative aspect-[16/10] rounded-xl overflow-hidden bg-zinc-900 block"
                >
                  <PropertyImage
                    src={item.image}
                    alt={`${item.city} real estate listings`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-white">
                        {item.city}
                      </h3>
                      <p className="text-xs text-zinc-200 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gold-400 shrink-0" />
                        <span>{item.subtitle}</span>
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gold-200 tabular-nums whitespace-nowrap shrink-0">
                      {count} {count === 1 ? 'Listing' : 'Listings'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recently Added Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium text-gold-600 mb-2">Fresh to Market</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight">
              Recently Added Properties
            </h2>
          </div>
          <Link
            to="/properties?sortBy=newest"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-gold-600 transition-colors whitespace-nowrap"
          >
            Browse Latest Additions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {recentProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Why Choose Us — Editorial Numbered Architecture */}
      <section className="bg-zinc-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-medium text-gold-400 mb-2">The Aurelia Standard</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight headline-balance">
              Built on Legal Clarity, Market Precision, and Discreet Advisory
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {WHY_CHOOSE_PILLARS.map((pillar) => (
              <div
                key={pillar.index}
                className="pt-6 border-t border-zinc-800 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="font-display text-2xl font-semibold text-white">
                      <span className="text-gold-400 mr-2 font-sans text-sm font-medium tabular-nums">
                        {pillar.index}
                      </span>
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{pillar.description}</p>
                </div>
                <p className="text-xs font-medium text-gold-400 tabular-nums">{pillar.metric}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium text-gold-600 mb-2">Client Outcomes</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight">
            Trusted by Families, Founders, and Institutional Tenants
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item) => (
            <blockquote
              key={item.author}
              className="p-7 bg-zinc-50 border border-zinc-200/80 rounded-xl flex flex-col justify-between gap-6"
            >
              <p className="text-sm text-zinc-700 leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
              <footer className="pt-4 border-t border-zinc-200/80">
                <p className="text-sm font-semibold text-zinc-900">{item.author}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {item.role} &middot; {item.location}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Final Call-to-Action */}
      <section className="border-t border-zinc-200 bg-gold-50/70 py-18">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight headline-balance">
            Ready to Schedule a Private Site Inspection or Request Valuation Advice?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Speak directly with a dedicated regional advisor for private walkthroughs, comparative
            pricing dossiers, and end-to-end transaction support.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-6 py-3 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors whitespace-nowrap"
            >
              Schedule a Private Consultation
            </Link>
            <Link
              to="/properties"
              className="px-6 py-3 bg-white text-zinc-900 border border-zinc-300 text-sm font-medium rounded-lg hover:border-zinc-900 transition-colors whitespace-nowrap"
            >
              Explore All Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

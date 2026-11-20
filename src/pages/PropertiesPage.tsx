import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  PROPERTY_CATEGORIES,
  type ListingType,
  type PropertyFilters,
} from '../models/types';
import { useProperties } from '../context/PropertyContext';
import { PropertyCard } from '../components/PropertyCard';

const DEFAULT_FILTERS: PropertyFilters = {
  search: '',
  location: '',
  propertyType: '',
  listingType: 'All',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  minArea: '',
  sortBy: 'newest',
};

export function PropertiesPage() {
  const { properties, loading } = useProperties();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<PropertyFilters>(() => ({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    propertyType: searchParams.get('category') || '',
    listingType: (searchParams.get('listingType') as 'All' | ListingType) || 'All',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    minArea: searchParams.get('minArea') || '',
    sortBy: (searchParams.get('sortBy') as PropertyFilters['sortBy']) || 'newest',
  }));

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      propertyType: searchParams.get('category') || '',
      listingType: (searchParams.get('listingType') as 'All' | ListingType) || 'All',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      bathrooms: searchParams.get('bathrooms') || '',
      minArea: searchParams.get('minArea') || '',
      sortBy: (searchParams.get('sortBy') as PropertyFilters['sortBy']) || 'newest',
    });
  }, [searchParams]);

  const updateFilter = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);

    const params = new URLSearchParams();
    if (next.search) params.set('search', next.search);
    if (next.location) params.set('location', next.location);
    if (next.propertyType) params.set('category', next.propertyType);
    if (next.listingType !== 'All') params.set('listingType', next.listingType);
    if (next.minPrice) params.set('minPrice', next.minPrice);
    if (next.maxPrice) params.set('maxPrice', next.maxPrice);
    if (next.bedrooms) params.set('bedrooms', next.bedrooms);
    if (next.bathrooms) params.set('bathrooms', next.bathrooms);
    if (next.minArea) params.set('minArea', next.minArea);
    if (next.sortBy !== 'newest') params.set('sortBy', next.sortBy);
    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({}, { replace: true });
  };

  const uniqueCities = useMemo(
    () => Array.from(new Set(properties.map((p) => p.city))).sort(),
    [properties]
  );

  const filteredProperties = useMemo(() => {
    const queryText = filters.search.trim().toLowerCase();
    const minPriceNum = filters.minPrice ? Number(filters.minPrice) : null;
    const maxPriceNum = filters.maxPrice ? Number(filters.maxPrice) : null;
    const minBedsNum = filters.bedrooms ? Number(filters.bedrooms) : null;
    const minBathsNum = filters.bathrooms ? Number(filters.bathrooms) : null;
    const minAreaNum = filters.minArea ? Number(filters.minArea) : null;

    const list = properties.filter((p) => {
      if (filters.listingType !== 'All' && p.listingType !== filters.listingType) return false;
      if (filters.location && p.city.toLowerCase() !== filters.location.toLowerCase()) return false;
      if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
      if (minPriceNum !== null && !Number.isNaN(minPriceNum) && p.price < minPriceNum) return false;
      if (maxPriceNum !== null && !Number.isNaN(maxPriceNum) && p.price > maxPriceNum) return false;
      if (minBedsNum !== null && !Number.isNaN(minBedsNum) && p.bedrooms < minBedsNum) return false;
      if (minBathsNum !== null && !Number.isNaN(minBathsNum) && p.bathrooms < minBathsNum)
        return false;
      if (minAreaNum !== null && !Number.isNaN(minAreaNum) && p.area < minAreaNum) return false;

      if (queryText) {
        const haystack = [
          p.title,
          p.location,
          p.city,
          p.propertyType,
          p.propertyCode,
          p.description,
          ...p.amenities,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(queryText)) return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'area_desc':
          return b.area - a.area;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [properties, filters]);

  const activeFilterCount = [
    filters.search,
    filters.location,
    filters.propertyType,
    filters.listingType !== 'All' ? filters.listingType : '',
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.bathrooms,
    filters.minArea,
  ].filter(Boolean).length;

  const filterControls = (
    <div className="space-y-5">
      {/* Buy / Rent Segmented Control */}
      <div>
        <span className="block text-xs font-medium text-zinc-700 mb-2">Listing Type</span>
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-lg">
          {(['All', 'Buy', 'Rent'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateFilter('listingType', type)}
              className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filters.listingType === type
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Keyword Search */}
      <div>
        <label htmlFor="filter-search" className="block text-xs font-medium text-zinc-700 mb-1.5">
          Search Keyword or ID
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="filter-search"
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Villa, Worli, AE-MUM..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="filter-city" className="block text-xs font-medium text-zinc-700 mb-1.5">
          Location / City
        </label>
        <select
          id="filter-city"
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
        >
          <option value="">All Cities</option>
          {uniqueCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="filter-category" className="block text-xs font-medium text-zinc-700 mb-1.5">
          Property Category
        </label>
        <select
          id="filter-category"
          value={filters.propertyType}
          onChange={(e) => updateFilter('propertyType', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
        >
          <option value="">All Categories</option>
          {PROPERTY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Min & Max Price */}
      <div>
        <span className="block text-xs font-medium text-zinc-700 mb-1.5">Price Range (INR ₹)</span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            aria-label="Minimum price in INR"
            value={filters.minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            placeholder="Min ₹"
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 tabular-nums"
          />
          <input
            type="number"
            min={0}
            aria-label="Maximum price in INR"
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            placeholder="Max ₹"
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 tabular-nums"
          />
        </div>
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="filter-beds" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Bedrooms
          </label>
          <select
            id="filter-beds"
            value={filters.bedrooms}
            onChange={(e) => updateFilter('bedrooms', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-baths" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Bathrooms
          </label>
          <select
            id="filter-baths"
            value={filters.bathrooms}
            onChange={(e) => updateFilter('bathrooms', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
      </div>

      {/* Minimum Property Size */}
      <div>
        <label htmlFor="filter-area" className="block text-xs font-medium text-zinc-700 mb-1.5">
          Minimum Size (sq. ft.)
        </label>
        <input
          id="filter-area"
          type="number"
          min={0}
          step={250}
          value={filters.minArea}
          onChange={(e) => updateFilter('minArea', e.target.value)}
          placeholder="e.g. 2500"
          className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 tabular-nums"
        />
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-zinc-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-xs font-medium text-gold-600 mb-2">Curated Portfolio</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight">
                Property Listings
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Filter by location, category, price in INR, bedrooms, bathrooms, and carpet area.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-zinc-300 rounded-lg text-zinc-900 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>

              <select
                aria-label="Sort properties"
                value={filters.sortBy}
                onChange={(e) =>
                  updateFilter('sortBy', e.target.value as PropertyFilters['sortBy'])
                }
                className="px-3.5 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-800 focus:outline-none focus:border-zinc-900"
              >
                <option value="newest">Sort: Recently Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="area_desc">Area: Largest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block bg-white border border-zinc-200 rounded-xl p-6 sticky top-24">
            <h2 className="font-sans text-sm font-semibold text-zinc-900 mb-5">Refine Search</h2>
            {filterControls}
          </aside>

          {/* Results Column */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 text-sm text-zinc-600 tabular-nums">
              <span>
                Showing <strong className="text-zinc-900">{filteredProperties.length}</strong> of{' '}
                {properties.length} properties
              </span>
              {filters.location && (
                <span className="text-xs text-zinc-500">Market: {filters.location}</span>
              )}
            </div>

            {loading && properties.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-[380px] rounded-xl bg-white border border-zinc-200 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
                <h3 className="font-display text-2xl font-semibold text-zinc-900 mb-2">
                  No Properties Match These Filters
                </h3>
                <p className="text-sm text-zinc-600 max-w-md mx-auto mb-6">
                  Try widening your price range, clearing the bedroom threshold, or viewing all
                  cities across our portfolio.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200">
              <h2 className="font-sans text-base font-semibold text-zinc-900">Refine Search</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="p-2 text-zinc-500 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterControls}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full py-3 bg-zinc-900 text-white text-sm font-medium rounded-lg"
            >
              Show {filteredProperties.length} Properties
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

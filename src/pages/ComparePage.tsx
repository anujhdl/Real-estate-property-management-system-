import { Link } from 'react-router-dom';
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react';
import { formatArea, formatINR } from '../models/types';
import { useProperties } from '../context/PropertyContext';
import { PropertyImage } from '../components/PropertyImage';

export function ComparePage() {
  const { properties, compareIds, toggleCompare, clearCompare } = useProperties();

  const selected = compareIds
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const availableToAdd = properties.filter((p) => !compareIds.includes(p.id));

  return (
    <div className="bg-zinc-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-gold-600 mb-2">Side-by-Side Analysis</p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-900">
              Compare Properties
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              Evaluate up to three properties side by side across price per sq. ft., layout, and
              amenities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selected.length < 3 && (
              <div className="relative">
                <select
                  aria-label="Add property to comparison"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      toggleCompare(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-3.5 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-800 focus:outline-none focus:border-zinc-900"
                >
                  <option value="" disabled>
                    + Add Property to Compare
                  </option>
                  {availableToAdd.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.city})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:border-zinc-900 cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {selected.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-zinc-900 mb-2">
              No Properties Selected Yet
            </h2>
            <p className="text-sm text-zinc-600 max-w-md mx-auto mb-6">
              Select up to 3 properties using the dropdown above or click the compare icon on any
              listing card.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/properties"
                className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800"
              >
                Browse Listings
              </Link>
              {properties.slice(0, 2).length === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    toggleCompare(properties[0].id);
                    toggleCompare(properties[1].id);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white border border-zinc-300 text-zinc-900 text-sm font-medium rounded-lg hover:border-zinc-900 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Compare Top 2 Featured Villas
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="p-5 w-48 text-xs font-semibold text-zinc-500 align-top">
                    Attribute
                  </th>
                  {selected.map((prop) => (
                    <th key={prop.id} className="p-5 align-top w-1/3">
                      <div className="aspect-[16/10] rounded-lg overflow-hidden mb-3 bg-zinc-100">
                        <PropertyImage
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/properties/${prop.id}`}
                          className="font-display text-xl font-semibold text-zinc-900 hover:text-gold-600"
                        >
                          {prop.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleCompare(prop.id)}
                          aria-label={`Remove ${prop.title}`}
                          className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs font-mono text-zinc-500 mt-1">{prop.propertyCode}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm tabular-nums">
                <tr>
                  <td className="p-4 font-medium text-zinc-500">Price (INR)</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4 font-semibold text-zinc-900">
                      {formatINR(p.price, p.listingType)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-500">Rate / sq. ft.</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4 text-zinc-700">
                      {p.listingType === 'Buy' && p.area > 0
                        ? `₹${Math.round(p.price / p.area).toLocaleString('en-IN')}`
                        : 'Lease Asset'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-500">Category</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4 text-zinc-700">
                      {p.propertyType}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-500">Listing Type</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4 text-zinc-700">
                      For {p.listingType}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-500">Location</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4 text-zinc-700">
                      {p.location}, {p.city}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-500">Area</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4 text-zinc-700">
                      {formatArea(p.area)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-500">Bedrooms / Baths</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4 text-zinc-700">
                      {p.bedrooms > 0 ? `${p.bedrooms} Beds / ${p.bathrooms} Baths` : 'Non-Residential / Plot'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-500">Status</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4 font-medium text-zinc-900">
                      {p.status}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-500 align-top">Amenities</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4 text-xs text-zinc-600 align-top">
                      <ul className="space-y-1.5">
                        {p.amenities.map((a) => (
                          <li key={a}>&middot; {a}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-500">Action</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4">
                      <Link
                        to={`/properties/${p.id}`}
                        className="inline-flex items-center px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800"
                      >
                        Inspect &amp; Inquire &rarr;
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

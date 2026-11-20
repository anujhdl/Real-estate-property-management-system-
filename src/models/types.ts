export type PropertyCategory =
  | 'Luxury Villas'
  | 'Modern Apartments'
  | 'Independent Houses'
  | 'Residential Plots'
  | 'Commercial Properties'
  | 'Premium Penthouses'
  | 'Family Homes';

export type ListingType = 'Buy' | 'Rent';
export type PropertyStatus = 'Available' | 'Reserved' | 'Sold' | 'Rented';
export type InquiryType = 'Buying' | 'Renting' | 'Site Visit' | 'General Inquiry';
export type PreferredContact = 'Phone' | 'Email' | 'WhatsApp';
export type InquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Closed';
export type EmailDeliveryStatus = 'sent' | 'failed' | 'pending';

export const PROPERTY_CATEGORIES: readonly PropertyCategory[] = [
  'Luxury Villas',
  'Modern Apartments',
  'Independent Houses',
  'Residential Plots',
  'Commercial Properties',
  'Premium Penthouses',
  'Family Homes',
] as const;

export const PROPERTY_STATUSES: readonly PropertyStatus[] = [
  'Available',
  'Reserved',
  'Sold',
  'Rented',
] as const;

export const INQUIRY_STATUSES: readonly InquiryStatus[] = [
  'New',
  'Contacted',
  'In Progress',
  'Closed',
] as const;

export interface Property {
  id: string;
  propertyCode: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  propertyType: PropertyCategory;
  listingType: ListingType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  amenities: string[];
  status: PropertyStatus;
  featured: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  authProviderId: string;
  role: 'user' | 'admin';
  phone?: string;
  favorites: string[];
  createdAt: string;
}

export interface Inquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  inquiryType: InquiryType;
  preferredContact: PreferredContact;
  message: string;
  status: InquiryStatus;
  emailDeliveryStatus: EmailDeliveryStatus;
  emailError?: string;
  userId: string;
  createdAt: string;
}

export interface PropertyFilters {
  search: string;
  location: string;
  propertyType: string;
  listingType: 'All' | ListingType;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  minArea: string;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';
}

export function formatINR(amount: number, listingType: ListingType = 'Buy'): string {
  const suffix = listingType === 'Rent' ? ' / mo' : '';
  if (amount >= 10_000_000) {
    const crores = amount / 10_000_000;
    return `₹${crores.toFixed(crores % 1 === 0 ? 0 : 2)} Cr${suffix}`;
  }
  if (amount >= 100_000) {
    const lakhs = amount / 100_000;
    return `₹${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 2)} Lakh${suffix}`;
  }
  return `₹${amount.toLocaleString('en-IN')}${suffix}`;
}

export function formatExactINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString('en-IN')} sq. ft.`;
}

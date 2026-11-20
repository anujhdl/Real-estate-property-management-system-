import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Database,
  Edit3,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  formatArea,
  formatINR,
  INQUIRY_STATUSES,
  PROPERTY_CATEGORIES,
  PROPERTY_STATUSES,
  type Inquiry,
  type InquiryStatus,
  type ListingType,
  type Property,
  type PropertyCategory,
  type PropertyStatus,
  type UserProfile,
} from '../models/types';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import {
  createPropertyListing,
  deletePropertyListing,
  seedCatalogToFirestore,
  updatePropertyListing,
  type PropertyInput,
} from '../services/propertyService';
import {
  deleteInquiryAdmin,
  fetchAllInquiriesAdmin,
  updateInquiryStatusAdmin,
} from '../services/inquiryService';
import { fetchAllUsersAdmin } from '../services/userService';
import { uploadPropertyImages } from '../services/uploadService';
import { PropertyImage } from '../components/PropertyImage';

type AdminTab = 'overview' | 'properties' | 'inquiries' | 'users';

const EMPTY_FORM: PropertyInput = {
  propertyCode: '',
  title: '',
  description: '',
  price: 25000000,
  location: '',
  city: 'Mumbai',
  propertyType: 'Luxury Villas',
  listingType: 'Buy',
  bedrooms: 4,
  bathrooms: 4,
  area: 3500,
  images: [],
  amenities: ['24/7 Security', 'Covered Parking', 'Power Backup'],
  status: 'Available',
  featured: false,
  latitude: 19.076,
  longitude: 72.8777,
};

export function AdminDashboardPage() {
  const { firebaseUser, profile, loading, isAdmin, signInWithGoogle, logout } = useAuth();
  const { properties, dataSource, refreshProperties } = useProperties();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingAdminData, setLoadingAdminData] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Property filters & modal
  const [propSearch, setPropSearch] = useState('');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formState, setFormState] = useState<PropertyInput>(EMPTY_FORM);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Inquiry filters
  const [inqSearch, setInqSearch] = useState('');
  const [inqStatusFilter, setInqStatusFilter] = useState<'All' | InquiryStatus>('All');
  const [inqTypeFilter, setInqTypeFilter] = useState('All');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const loadAdminRecords = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingAdminData(true);
    setAdminError(null);
    try {
      const [inqData, userData] = await Promise.all([
        fetchAllInquiriesAdmin(),
        fetchAllUsersAdmin(),
      ]);
      setInquiries(inqData);
      setUsers(userData);
    } catch (err) {
      setAdminError(
        err instanceof Error ? err.message : 'Unable to fetch administrative records.'
      );
    } finally {
      setLoadingAdminData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      void loadAdminRecords();
    }
  }, [isAdmin, loadAdminRecords]);

  const openCreateModal = () => {
    setEditingProperty(null);
    const code = `AE-${Math.floor(200 + Math.random() * 799)}`;
    setFormState({ ...EMPTY_FORM, propertyCode: code });
    setAmenitiesInput(EMPTY_FORM.amenities.join(', '));
    setImageUrlInput('');
    setFormModalOpen(true);
  };

  const openEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setFormState({
      propertyCode: prop.propertyCode,
      title: prop.title,
      description: prop.description,
      price: prop.price,
      location: prop.location,
      city: prop.city,
      propertyType: prop.propertyType,
      listingType: prop.listingType,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      area: prop.area,
      images: [...prop.images],
      amenities: [...prop.amenities],
      status: prop.status,
      featured: prop.featured,
      latitude: prop.latitude,
      longitude: prop.longitude,
    });
    setAmenitiesInput(prop.amenities.join(', '));
    setImageUrlInput('');
    setFormModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setAdminError(null);
    try {
      const uploadedUrls = await uploadPropertyImages(files);
      setFormState((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls].slice(0, 10),
      }));
      showToast(`Uploaded ${uploadedUrls.length} image(s) successfully.`);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setFormState((prev) => ({
      ...prev,
      images: [...prev.images, trimmed].slice(0, 10),
    }));
    setImageUrlInput('');
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const parsedAmenities = amenitiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 25);

    const finalImages =
      formState.images.length > 0
        ? formState.images
        : ['/src/assets/images/villa_alibaug_coast_1795170147192.jpg'];

    const payload: PropertyInput = {
      ...formState,
      images: finalImages,
      amenities: parsedAmenities,
    };

    setSavingProperty(true);
    try {
      // Ensure seeded properties are synced if editing one of them for the first time
      if (dataSource === 'seed') {
        await seedCatalogToFirestore();
      }

      if (editingProperty) {
        await updatePropertyListing(editingProperty.id, payload);
        showToast(`Updated "${payload.title}".`);
      } else {
        await createPropertyListing(payload);
        showToast(`Created new listing "${payload.title}".`);
      }
      await refreshProperties();
      setFormModalOpen(false);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to save property.');
    } finally {
      setSavingProperty(false);
    }
  };

  const handleQuickStatusChange = async (prop: Property, newStatus: PropertyStatus) => {
    try {
      if (dataSource === 'seed') {
        await seedCatalogToFirestore();
      }
      await updatePropertyListing(prop.id, {
        propertyCode: prop.propertyCode,
        title: prop.title,
        description: prop.description,
        price: prop.price,
        location: prop.location,
        city: prop.city,
        propertyType: prop.propertyType,
        listingType: prop.listingType,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        area: prop.area,
        images: prop.images,
        amenities: prop.amenities,
        status: newStatus,
        featured: prop.featured,
        latitude: prop.latitude,
        longitude: prop.longitude,
      });
      await refreshProperties();
      showToast(`Status for ${prop.propertyCode} set to ${newStatus}.`);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Unable to update availability status.');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      if (dataSource === 'seed') {
        await seedCatalogToFirestore();
      }
      await deletePropertyListing(id);
      setConfirmDeleteId(null);
      await refreshProperties();
      showToast('Property deleted from database.');
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Unable to delete property.');
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setAdminError(null);
    try {
      const count = await seedCatalogToFirestore();
      await refreshProperties();
      showToast(
        count > 0
          ? `Seeded ${count} properties into Firestore.`
          : 'All 20 default listings are already synced in Firestore.'
      );
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Database seeding failed.');
    } finally {
      setSeeding(false);
    }
  };

  const handleInquiryStatusUpdate = async (inquiryId: string, status: InquiryStatus) => {
    try {
      await updateInquiryStatusAdmin(inquiryId, status);
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiryId ? { ...item, status } : item))
      );
      showToast(`Inquiry ${inquiryId} marked as ${status}.`);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Unable to update inquiry status.');
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    try {
      await deleteInquiryAdmin(inquiryId);
      setInquiries((prev) => prev.filter((item) => item.id !== inquiryId));
      showToast(`Inquiry ${inquiryId} deleted.`);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Unable to delete inquiry.');
    }
  };

  const filteredProperties = useMemo(() => {
    const q = propSearch.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) =>
      [p.title, p.propertyCode, p.city, p.location, p.propertyType, p.status]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [properties, propSearch]);

  const filteredInquiries = useMemo(() => {
    const q = inqSearch.trim().toLowerCase();
    return inquiries.filter((inq) => {
      if (inqStatusFilter !== 'All' && inq.status !== inqStatusFilter) return false;
      if (inqTypeFilter !== 'All' && inq.inquiryType !== inqTypeFilter) return false;
      if (!q) return true;
      return [inq.fullName, inq.email, inq.phone, inq.propertyTitle, inq.message, inq.id]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [inquiries, inqSearch, inqStatusFilter, inqTypeFilter]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center text-sm text-zinc-500">
        Verifying administrator credentials...
      </div>
    );
  }

  // Unauthenticated Gate
  if (!firebaseUser) {
    return (
      <div className="min-h-[75vh] bg-zinc-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 text-gold-400 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-zinc-900 mb-2">
            Administrator Sign-In
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed mb-6">
            Administrative property management, user rosters, and inquiry CRM controls are strictly
            restricted to authorized Aurelia Estates administrators.
          </p>
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="w-full py-2.5 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Sign In with Authorized Google Account
          </button>
          <Link
            to="/auth"
            className="block mt-4 text-xs text-zinc-500 hover:text-zinc-900"
          >
            Or sign in with email &amp; password &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Non-Admin Authorization Gate
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] bg-zinc-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-zinc-900 mb-2">
            Access Restricted
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed mb-6">
            Signed in as <strong className="text-zinc-900">{firebaseUser.email}</strong>. This
            account does not hold verified administrator permissions for the management console.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800"
            >
              Go to Client Dashboard
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/auth');
              }}
              className="px-5 py-2.5 bg-white border border-zinc-300 text-zinc-800 text-sm font-medium rounded-lg hover:border-zinc-900 cursor-pointer"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableCount = properties.filter((p) => p.status === 'Available').length;
  const newInquiryCount = inquiries.filter((i) => i.status === 'New').length;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-zinc-950 text-zinc-300 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <p className="text-xs font-medium text-gold-400">Management Console</p>
          <p className="font-display text-xl font-semibold text-white mt-0.5 truncate">
            {profile?.name || 'Administrator'}
          </p>
          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{firebaseUser.email}</p>
        </div>

        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
          {(
            [
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'properties', label: `Properties (${properties.length})`, icon: Building2 },
              { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: Mail },
              { id: 'users', label: `Users (${users.length})`, icon: Users },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-zinc-800 hidden lg:block space-y-2">
          <Link
            to="/dashboard"
            className="block w-full text-center py-2 px-3 text-xs font-medium text-zinc-300 bg-zinc-900 rounded-lg hover:bg-zinc-800"
          >
            Client Dashboard
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 min-w-0 p-6 lg:p-10">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200">
          <div>
            <p className="text-xs text-zinc-500">
              Admin Console / <span className="text-zinc-900 font-medium capitalize">{activeTab}</span>
            </p>
            <h1 className="font-display text-3xl font-semibold text-zinc-900 mt-1">
              {activeTab === 'overview'
                ? 'Executive Overview'
                : activeTab === 'properties'
                  ? 'Property Inventory Management'
                  : activeTab === 'inquiries'
                    ? 'Customer Inquiry Pipeline'
                    : 'Registered Users Roster'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {dataSource === 'seed' && (
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-300 text-zinc-900 text-xs font-medium rounded-lg hover:border-zinc-900 cursor-pointer whitespace-nowrap"
              >
                {seeding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-gold-600" />
                )}
                Sync 20 Seed Listings to Firestore
              </button>
            )}
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              Add New Property
            </button>
          </div>
        </div>

        {/* Notifications */}
        {toast && (
          <div className="mb-6 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}
        {adminError && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{adminError}</span>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 tabular-nums">
              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <p className="text-xs text-zinc-500">Total Properties</p>
                <p className="font-display text-3xl font-semibold text-zinc-900 mt-1">
                  {properties.length}
                </p>
                <p className="text-xs text-emerald-700 mt-1">{availableCount} currently available</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <p className="text-xs text-zinc-500">Total Inquiries</p>
                <p className="font-display text-3xl font-semibold text-zinc-900 mt-1">
                  {inquiries.length}
                </p>
                <p className="text-xs text-gold-700 mt-1">{newInquiryCount} awaiting response</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <p className="text-xs text-zinc-500">Registered Users</p>
                <p className="font-display text-3xl font-semibold text-zinc-900 mt-1">
                  {users.length}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Verified client &amp; admin accounts</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <p className="text-xs text-zinc-500">Email Delivery Rate</p>
                <p className="font-display text-3xl font-semibold text-zinc-900 mt-1">
                  {inquiries.length === 0
                    ? '—'
                    : `${Math.round(
                        (inquiries.filter((i) => i.emailDeliveryStatus === 'sent').length /
                          inquiries.length) *
                          100
                      )}%`}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Routed to anujmlahoti24@gmail.com</p>
              </div>
            </div>

            {/* Recent Inquiries Preview */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                <h2 className="font-sans text-sm font-semibold text-zinc-900">Recent Inquiries</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('inquiries')}
                  className="text-xs font-medium text-gold-600 hover:underline cursor-pointer"
                >
                  View All Inquiries &rarr;
                </button>
              </div>
              {loadingAdminData ? (
                <div className="p-8 text-center text-xs text-zinc-500">Loading inquiries...</div>
              ) : inquiries.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500">
                  No customer inquiries recorded yet. Inquiries submitted from property pages or the
                  Contact form will appear here immediately.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                        <th className="py-3 px-5 font-medium">Customer</th>
                        <th className="py-3 px-5 font-medium">Property</th>
                        <th className="py-3 px-5 font-medium">Type</th>
                        <th className="py-3 px-5 font-medium">Email Status</th>
                        <th className="py-3 px-5 font-medium">Lead Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {inquiries.slice(0, 5).map((inq) => (
                        <tr key={inq.id} className="hover:bg-zinc-50">
                          <td className="py-3 px-5 font-medium text-zinc-900">
                            {inq.fullName}
                            <div className="text-zinc-500 font-normal">{inq.email}</div>
                          </td>
                          <td className="py-3 px-5 text-zinc-700 max-w-[220px] truncate">
                            {inq.propertyTitle}
                          </td>
                          <td className="py-3 px-5 text-zinc-600">{inq.inquiryType}</td>
                          <td className="py-3 px-5">
                            <span
                              className={
                                inq.emailDeliveryStatus === 'sent'
                                  ? 'text-emerald-700 font-medium'
                                  : 'text-amber-700 font-medium'
                              }
                            >
                              {inq.emailDeliveryStatus === 'sent' ? 'Emailed' : 'Not Emailed'}
                            </span>
                          </td>
                          <td className="py-3 px-5 font-medium text-zinc-900">{inq.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <div className="space-y-5">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={propSearch}
                onChange={(e) => setPropSearch(e.target.value)}
                placeholder="Search by title, property ID, city, or status..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[820px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                    <th className="py-3 px-4 font-medium">Property</th>
                    <th className="py-3 px-4 font-medium">Category &amp; Type</th>
                    <th className="py-3 px-4 font-medium text-right">Price (INR)</th>
                    <th className="py-3 px-4 font-medium text-right">Area</th>
                    <th className="py-3 px-4 font-medium">Availability</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 tabular-nums">
                  {filteredProperties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-zinc-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded overflow-hidden bg-zinc-100 shrink-0">
                            <PropertyImage
                              src={prop.images[0]}
                              alt={prop.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/properties/${prop.id}`}
                              className="font-semibold text-zinc-900 hover:text-gold-600 block truncate max-w-[240px]"
                            >
                              {prop.title}
                            </Link>
                            <span className="text-zinc-500">
                              <span className="font-mono">{prop.propertyCode}</span> &middot;{' '}
                              {prop.city}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-700">
                        <div>{prop.propertyType}</div>
                        <div className="text-zinc-500">For {prop.listingType}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-zinc-900">
                        {formatINR(prop.price, prop.listingType)}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-600">
                        {formatArea(prop.area)}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          aria-label={`Availability status for ${prop.title}`}
                          value={prop.status}
                          onChange={(e) =>
                            void handleQuickStatusChange(prop, e.target.value as PropertyStatus)
                          }
                          className="px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900"
                        >
                          {PROPERTY_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(prop)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>

                          {confirmDeleteId === prop.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => void handleDeleteProperty(prop.id)}
                                className="px-2.5 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(prop.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INQUIRIES TAB */}
        {activeTab === 'inquiries' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inqSearch}
                  onChange={(e) => setInqSearch(e.target.value)}
                  placeholder="Search customer name, email, phone, property..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                />
              </div>

              <select
                aria-label="Filter by inquiry status"
                value={inqStatusFilter}
                onChange={(e) =>
                  setInqStatusFilter(e.target.value as 'All' | InquiryStatus)
                }
                className="px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
              >
                <option value="All">All Statuses</option>
                {INQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by inquiry type"
                value={inqTypeFilter}
                onChange={(e) => setInqTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
              >
                <option value="All">All Types</option>
                <option value="Buying">Buying</option>
                <option value="Renting">Renting</option>
                <option value="Site Visit">Site Visit</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            {filteredInquiries.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-sm text-zinc-500">
                No inquiries match your current search or filter criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-1">
                          <span className="font-mono">{inq.id}</span>
                          <span>&middot;</span>
                          <span>{inq.inquiryType}</span>
                          <span>&middot;</span>
                          <span>Preferred: {inq.preferredContact}</span>
                          <span>&middot;</span>
                          <span className="tabular-nums">
                            {new Date(inq.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <h3 className="font-sans text-base font-semibold text-zinc-900">
                          {inq.fullName}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-0.5 tabular-nums">
                          {inq.email} &middot; {inq.phone}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <select
                          aria-label={`Update status for inquiry ${inq.id}`}
                          value={inq.status}
                          onChange={(e) =>
                            void handleInquiryStatusUpdate(
                              inq.id,
                              e.target.value as InquiryStatus
                            )
                          }
                          className="px-3 py-1.5 text-xs font-medium bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                        >
                          {INQUIRY_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => void handleDeleteInquiry(inq.id)}
                          aria-label={`Delete inquiry ${inq.id}`}
                          className="p-2 text-zinc-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 text-sm text-zinc-700 space-y-2">
                      <p className="text-xs text-zinc-500">
                        Property:{' '}
                        <span className="font-medium text-zinc-900">{inq.propertyTitle}</span>
                      </p>
                      <p className="leading-relaxed">{inq.message}</p>
                      <p className="text-xs pt-1">
                        Email Notification Status:{' '}
                        <span
                          className={
                            inq.emailDeliveryStatus === 'sent'
                              ? 'text-emerald-700 font-medium'
                              : 'text-amber-700 font-medium'
                          }
                        >
                          {inq.emailDeliveryStatus === 'sent'
                            ? 'Delivered to anujmlahoti24@gmail.com'
                            : `Failed (${inq.emailError || 'SMTP not configured'})`}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                  <th className="py-3 px-5 font-medium">Name</th>
                  <th className="py-3 px-5 font-medium">Email</th>
                  <th className="py-3 px-5 font-medium">Role</th>
                  <th className="py-3 px-5 font-medium">Provider</th>
                  <th className="py-3 px-5 font-medium text-right">Saved Favourites</th>
                  <th className="py-3 px-5 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 tabular-nums">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500">
                      No registered users found yet.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50">
                      <td className="py-3 px-5 font-medium text-zinc-900">{u.name}</td>
                      <td className="py-3 px-5 text-zinc-600">{u.email}</td>
                      <td className="py-3 px-5 capitalize font-medium text-zinc-800">{u.role}</td>
                      <td className="py-3 px-5 text-zinc-500">{u.authProviderId}</td>
                      <td className="py-3 px-5 text-right text-zinc-700">{u.favorites.length}</td>
                      <td className="py-3 px-5 text-right text-zinc-500">
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ADD / EDIT PROPERTY MODAL */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200">
              <h2 className="font-display text-2xl font-semibold text-zinc-900">
                {editingProperty ? `Edit ${editingProperty.propertyCode}` : 'Add New Property'}
              </h2>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                aria-label="Close modal"
                className="p-2 text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={180}
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="e.g. Malabar Hill Sea-View Villa"
                    className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Property ID / Code *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={32}
                    value={formState.propertyCode}
                    onChange={(e) => setFormState({ ...formState, propertyCode: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-zinc-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Category *</label>
                  <select
                    value={formState.propertyType}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        propertyType: e.target.value as PropertyCategory,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  >
                    {PROPERTY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Listing Type *
                  </label>
                  <select
                    value={formState.listingType}
                    onChange={(e) =>
                      setFormState({ ...formState, listingType: e.target.value as ListingType })
                    }
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  >
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Status *</label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({ ...formState, status: e.target.value as PropertyStatus })
                    }
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  >
                    {PROPERTY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Location / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    placeholder="e.g. Bandra West, Pali Hill"
                    className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 tabular-nums">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Area (sq. ft.) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={formState.area}
                    onChange={(e) => setFormState({ ...formState, area: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={formState.bedrooms}
                    onChange={(e) =>
                      setFormState({ ...formState, bedrooms: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={formState.bathrooms}
                    onChange={(e) =>
                      setFormState({ ...formState, bathrooms: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  maxLength={4000}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  placeholder="Private Pool, Gym, Covered Parking, Concierge"
                  className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-lg"
                />
              </div>

              {/* Property Images Upload & Gallery */}
              <div className="space-y-3 pt-2 border-t border-zinc-200">
                <span className="block text-xs font-semibold text-zinc-800">
                  Property Photographs ({formState.images.length} / 10)
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 cursor-pointer">
                    {uploadingImages ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-gold-400" />
                    )}
                    Upload Images (JPEG/PNG/WebP)
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste image path / URL"
                      className="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-2 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {formState.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {formState.images.map((url, idx) => (
                      <div key={`${url}-${idx}`} className="relative group aspect-[4/3] rounded overflow-hidden border border-zinc-200">
                        <PropertyImage src={url} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }))
                          }
                          aria-label="Remove image"
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-zinc-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.featured}
                  onChange={(e) => setFormState({ ...formState, featured: e.target.checked })}
                  className="rounded border-zinc-300"
                />
                Feature this property on the Homepage
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProperty}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-60 cursor-pointer"
                >
                  {savingProperty && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProperty ? 'Save Changes' : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

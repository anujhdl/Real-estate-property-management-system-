import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { handleFirestoreError, OperationType } from '../database/firestoreError';
import { SEED_PROPERTIES } from '../database/seedProperties';
import type { Property } from '../models/types';

const PROPERTIES_COLLECTION = 'properties';

function toIsoString(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

function mapPropertyDoc(id: string, data: Record<string, unknown>): Property {
  return {
    id,
    propertyCode: String(data.propertyCode ?? id.toUpperCase()),
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    price: Number(data.price ?? 0),
    location: String(data.location ?? ''),
    city: String(data.city ?? ''),
    propertyType: data.propertyType as Property['propertyType'],
    listingType: (data.listingType as Property['listingType']) || 'Buy',
    bedrooms: Number(data.bedrooms ?? 0),
    bathrooms: Number(data.bathrooms ?? 0),
    area: Number(data.area ?? 0),
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    amenities: Array.isArray(data.amenities) ? (data.amenities as string[]) : [],
    status: (data.status as Property['status']) || 'Available',
    featured: Boolean(data.featured),
    latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
    longitude: typeof data.longitude === 'number' ? data.longitude : undefined,
    createdAt: toIsoString(data.createdAt),
    updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
  };
}

export async function fetchAllProperties(): Promise<{
  properties: Property[];
  source: 'firestore' | 'seed';
}> {
  try {
    const q = query(collection(db, PROPERTIES_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { properties: SEED_PROPERTIES, source: 'seed' };
    }
    const items = snapshot.docs.map((docSnap) =>
      mapPropertyDoc(docSnap.id, docSnap.data() as Record<string, unknown>)
    );
    return { properties: items, source: 'firestore' };
  } catch (error) {
    console.warn('Unable to fetch properties from Firestore; falling back to seeded catalog.', error);
    return { properties: SEED_PROPERTIES, source: 'seed' };
  }
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return mapPropertyDoc(snap.id, snap.data() as Record<string, unknown>);
    }
    return SEED_PROPERTIES.find((p) => p.id === id) ?? null;
  } catch (error) {
    console.warn('Falling back to seeded property lookup for', id, error);
    return SEED_PROPERTIES.find((p) => p.id === id) ?? null;
  }
}

export async function seedCatalogToFirestore(): Promise<number> {
  let seededCount = 0;
  for (const prop of SEED_PROPERTIES) {
    const docRef = doc(db, PROPERTIES_COLLECTION, prop.id);
    try {
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        const payload: Record<string, unknown> = {
          id: prop.id,
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
          images: prop.images.slice(0, 10),
          amenities: prop.amenities.slice(0, 25),
          status: prop.status,
          featured: prop.featured,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (typeof prop.latitude === 'number') payload.latitude = prop.latitude;
        if (typeof prop.longitude === 'number') payload.longitude = prop.longitude;

        await setDoc(docRef, payload);
        seededCount += 1;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${PROPERTIES_COLLECTION}/${prop.id}`);
    }
  }
  return seededCount;
}

export type PropertyInput = Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;

export async function createPropertyListing(input: PropertyInput): Promise<Property> {
  const id = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const docRef = doc(db, PROPERTIES_COLLECTION, id);

  const payload: Record<string, unknown> = {
    id,
    propertyCode: input.propertyCode.trim().slice(0, 32),
    title: input.title.trim().slice(0, 180),
    description: input.description.trim().slice(0, 4000),
    price: Number(input.price),
    location: input.location.trim().slice(0, 160),
    city: input.city.trim().slice(0, 80),
    propertyType: input.propertyType,
    listingType: input.listingType,
    bedrooms: Number(input.bedrooms),
    bathrooms: Number(input.bathrooms),
    area: Number(input.area),
    images: input.images.slice(0, 10),
    amenities: input.amenities.slice(0, 25),
    status: input.status,
    featured: Boolean(input.featured),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (typeof input.latitude === 'number' && !Number.isNaN(input.latitude)) {
    payload.latitude = input.latitude;
  }
  if (typeof input.longitude === 'number' && !Number.isNaN(input.longitude)) {
    payload.longitude = input.longitude;
  }

  try {
    await setDoc(docRef, payload);
    return {
      ...input,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${PROPERTIES_COLLECTION}/${id}`);
  }
}

export async function updatePropertyListing(
  id: string,
  updates: PropertyInput
): Promise<void> {
  const docRef = doc(db, PROPERTIES_COLLECTION, id);
  const payload: Record<string, unknown> = {
    propertyCode: updates.propertyCode.trim().slice(0, 32),
    title: updates.title.trim().slice(0, 180),
    description: updates.description.trim().slice(0, 4000),
    price: Number(updates.price),
    location: updates.location.trim().slice(0, 160),
    city: updates.city.trim().slice(0, 80),
    propertyType: updates.propertyType,
    listingType: updates.listingType,
    bedrooms: Number(updates.bedrooms),
    bathrooms: Number(updates.bathrooms),
    area: Number(updates.area),
    images: updates.images.slice(0, 10),
    amenities: updates.amenities.slice(0, 25),
    status: updates.status,
    featured: Boolean(updates.featured),
    updatedAt: serverTimestamp(),
  };

  if (typeof updates.latitude === 'number' && !Number.isNaN(updates.latitude)) {
    payload.latitude = updates.latitude;
  }
  if (typeof updates.longitude === 'number' && !Number.isNaN(updates.longitude)) {
    payload.longitude = updates.longitude;
  }

  try {
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PROPERTIES_COLLECTION}/${id}`);
  }
}

export async function deletePropertyListing(id: string): Promise<void> {
  const docRef = doc(db, PROPERTIES_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PROPERTIES_COLLECTION}/${id}`);
  }
}

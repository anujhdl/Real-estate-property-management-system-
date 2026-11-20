import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Property } from '../models/types';
import { SEED_PROPERTIES } from '../database/seedProperties';
import { fetchAllProperties } from '../services/propertyService';
import { useAuth } from './AuthContext';

interface PropertyContextValue {
  properties: Property[];
  loading: boolean;
  dataSource: 'firestore' | 'seed';
  compareIds: string[];
  favoriteIds: string[];
  refreshProperties: () => Promise<void>;
  toggleCompare: (propertyId: string) => void;
  clearCompare: () => void;
  isFavorite: (propertyId: string) => boolean;
  isComparing: (propertyId: string) => boolean;
}

const PropertyContext = createContext<PropertyContextValue | null>(null);

const LOCAL_FAV_KEY = 'aurelia_estates_favorites_v1';

function readGuestFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [properties, setProperties] = useState<Property[]>(SEED_PROPERTIES);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'firestore' | 'seed'>('seed');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [guestFavorites, setGuestFavorites] = useState<string[]>(() => readGuestFavorites());

  const refreshProperties = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAllProperties();
      setProperties(result.properties);
      setDataSource(result.source);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProperties();
  }, [refreshProperties]);

  useEffect(() => {
    const syncGuest = () => setGuestFavorites(readGuestFavorites());
    window.addEventListener('aurelia-favorites-changed', syncGuest);
    window.addEventListener('storage', syncGuest);
    return () => {
      window.removeEventListener('aurelia-favorites-changed', syncGuest);
      window.removeEventListener('storage', syncGuest);
    };
  }, []);

  const favoriteIds = profile ? profile.favorites : guestFavorites;

  const toggleCompare = useCallback((propertyId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), propertyId];
      }
      return [...prev, propertyId];
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  const isFavorite = useCallback(
    (propertyId: string) => favoriteIds.includes(propertyId),
    [favoriteIds]
  );

  const isComparing = useCallback(
    (propertyId: string) => compareIds.includes(propertyId),
    [compareIds]
  );

  return (
    <PropertyContext.Provider
      value={{
        properties,
        loading,
        dataSource,
        compareIds,
        favoriteIds,
        refreshProperties,
        toggleCompare,
        clearCompare,
        isFavorite,
        isComparing,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties(): PropertyContextValue {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error('useProperties must be used within PropertyProvider');
  return ctx;
}

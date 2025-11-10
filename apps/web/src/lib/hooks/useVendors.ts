"use client";

import { useEffect, useState } from 'react';
import { fetchTopVendors, VendorsData } from '../api/vendors';

export interface UseVendorsReturn {
  vendors: VendorsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVendors(limit: number = 10, months: number = 12): UseVendorsReturn {
  const [vendors, setVendors] = useState<VendorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTopVendors(limit, months);
      setVendors(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setVendors(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchVendors();
  }, [limit, months]);

  return {
    vendors,
    loading,
    error,
    refetch: handleFetchVendors,
  };
}
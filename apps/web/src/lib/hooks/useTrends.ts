"use client";

import { useEffect, useState } from 'react';
import { fetchInvoiceTrends, TrendsData } from '../api/trends';

export interface UseTrendsReturn {
  trends: TrendsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTrends(months: number = 12): UseTrendsReturn {
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInvoiceTrends(months);
      setTrends(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setTrends(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchTrends();
  }, [months]);

  return {
    trends,
    loading,
    error,
    refetch: handleFetchTrends,
  };
}
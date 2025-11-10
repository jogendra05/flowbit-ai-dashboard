"use client";

import { useEffect, useState } from 'react';
import { fetchStats, StatsData } from '../api/stats';

export interface UseStatsReturn {
  stats: StatsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage stats data
 * Auto-refreshes every 5 minutes
 */
export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch stats on component mount
    handleFetchStats();

    // Auto-refresh every 5 minutes (300,000 ms)
    const refreshInterval = setInterval(handleFetchStats, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: handleFetchStats,
  };
}

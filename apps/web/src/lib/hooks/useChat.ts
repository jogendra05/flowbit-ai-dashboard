
"use client";

import { useState, useCallback } from 'react';
import { sendChatQuery, testVannaConnection } from '../api/chat';

export interface UseChatReturn {
  sendQuery: (query: string) => Promise<any>;
  loading: boolean;
  error: string | null;
  testConnection: () => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendQuery = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await sendChatQuery(query);

      if (!response.success) {
        setError(response.error || 'Failed to process query');
        return { success: false, error: response.error };
      }

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(async () => {
    try {
      const connected = await testVannaConnection();
      if (!connected) {
        setError('Cannot connect to AI service. Make sure Vanna AI server is running.');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('Connection test failed');
    }
  }, []);

  return {
    sendQuery,
    loading,
    error,
    testConnection,
  };
}
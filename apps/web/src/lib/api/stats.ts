export interface StatsData {
  totalSpend: number;
  invoicesProcessed: number;
  documentsUploaded: number;
  avgInvoiceValue: number;
  overdueDays: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch stats from backend API
 */
export async function fetchStats(): Promise<StatsData> {
  try {
    const response = await fetch(`${API_URL}/api/stats`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: ApiResponse<StatsData> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch stats');
    }

    if (!data.data) {
      throw new Error('No data returned from API');
    }

    return data.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching stats:', errorMessage);
    throw new Error(`Failed to fetch stats: ${errorMessage}`);
  }
}

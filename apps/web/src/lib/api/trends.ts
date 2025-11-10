export interface TrendDataPoint {
  month: string;
  invoiceCount: number;
  totalValue: number;
  avgValue: number;
}

export interface TrendsData {
  trends: TrendDataPoint[];
  totalInvoices: number;
  totalSpend: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchInvoiceTrends(months: number = 12): Promise<TrendsData> {
  try {
    const response = await fetch(`${API_URL}/api/invoice-trends?months=${months}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: ApiResponse<TrendsData> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch trends');
    }

    if (!data.data) {
      throw new Error('No data returned from API');
    }

    return data.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching trends:', errorMessage);
    throw new Error(`Failed to fetch trends: ${errorMessage}`);
  }
}
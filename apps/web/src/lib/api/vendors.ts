export interface VendorSpendData {
  name: string;
  totalSpend: number;
  invoiceCount: number;
  avgInvoiceValue: number;
  lastInvoiceDate: string | null;
}

export interface VendorsData {
  vendors: VendorSpendData[];
  totalVendors: number;
  totalSpend: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchTopVendors(limit: number = 10, months: number = 12): Promise<VendorsData> {
  try {
    const response = await fetch(
      `${API_URL}/api/vendors/top10?limit=${limit}&months=${months}`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: ApiResponse<VendorsData> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch vendors');
    }

    if (!data.data) {
      throw new Error('No data returned from API');
    }

    return data.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching vendors:', errorMessage);
    throw new Error(`Failed to fetch vendors: ${errorMessage}`);
  }
}
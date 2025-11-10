
import { Invoice, Vendor, LineItem, Payment } from '../generated/prisma/index.js';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Stats Response
export interface StatsResponse {
  totalSpend: number;
  invoicesProcessed: number;
  documentsUploaded: number;
  avgInvoiceValue: number;
  overdueDays: number;
}

// Trend Response
export interface InvoiceTrend {
  month: string;
  invoiceCount: number;
  totalValue: number;
  avgValue: number;
}

export interface TrendsResponse {
  trends: InvoiceTrend[];
  totalInvoices: number;
  totalSpend: number;
}

// Vendor Response
export interface VendorSpend {
  id: string;
  name: string;
  totalSpend: number;
  invoiceCount: number;
  avgInvoiceValue: number;
  lastInvoiceDate: Date | null;
}

export interface Top10VendorsResponse {
  vendors: VendorSpend[];
  totalVendors: number;
  totalSpend: number;
}

// Category Response
export interface CategorySpend {
  category: string;
  totalSpend: number;
  itemCount: number;
  percentage: number;
}

export interface CategorySpendResponse {
  categories: CategorySpend[];
  totalSpend: number;
}

// Cash Outflow Response
export interface CashOutflowPeriod {
  period: string;
  startDate: string;
  endDate: string;
  expectedOutflow: number;
  invoiceCount: number;
}

export interface CashOutflowResponse {
  forecast: CashOutflowPeriod[];
  totalForecast: number;
  forecastPeriod: string;
}

// Invoice Response
export interface InvoiceRow {
  id: string;
  invoiceNumber: string | null;
  vendor: { name: string } | null;
  invoiceDate: Date | null;
  dueDate: Date | null;
  total: number;
  status: string;
  isValidated: boolean;
}

export interface InvoicesResponse {
  invoices: InvoiceRow[];
  pagination: PaginationMeta;
}

// Query Types
export interface InvoiceFilters {
  vendorId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'date' | 'amount' | 'vendor';
  sortOrder?: 'asc' | 'desc';
}
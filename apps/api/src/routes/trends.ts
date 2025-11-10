import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiResponse, TrendsResponse, InvoiceTrend } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const months = Math.min(parseInt(req.query.months as string) || 12, 36);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);

    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: { gte: startDate },
        status: { in: ['PROCESSED', 'VALIDATED', 'PAID'] },
      },
      select: {
        invoiceDate: true,
        total: true,
      },
      orderBy: { invoiceDate: 'asc' },
    });

    const groupedByMonth = new Map<string, { count: number; total: number }>();

    invoices.forEach((invoice) => {
      if (!invoice.invoiceDate) return;

      const date = new Date(invoice.invoiceDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!groupedByMonth.has(monthKey)) {
        groupedByMonth.set(monthKey, { count: 0, total: 0 });
      }

      const current = groupedByMonth.get(monthKey)!;
      current.count += 1;
      current.total += invoice.total?.toNumber() || 0;
    });

    const trends: InvoiceTrend[] = [];
    const current = new Date(startDate);

    while (current <= new Date()) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const data = groupedByMonth.get(monthKey) || { count: 0, total: 0 };

      trends.push({
        month: monthKey,
        invoiceCount: data.count,
        totalValue: data.total,
        avgValue: data.count > 0 ? data.total / data.count : 0,
      });

      current.setMonth(current.getMonth() + 1);
    }

    const totalInvoices = invoices.length;
    const totalSpend = invoices.reduce((sum, inv) => sum + (inv.total?.toNumber() || 0), 0);

    res.json({
      success: true,
      data: {
        trends,
        totalInvoices,
        totalSpend,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<TrendsResponse>);
  })
);

export default router;
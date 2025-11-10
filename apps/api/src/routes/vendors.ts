import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiResponse, Top10VendorsResponse, VendorSpend } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/top10',
  asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const months = Math.min(parseInt(req.query.months as string) || 12, 60);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const vendors = await prisma.vendor.findMany({
      include: {
        invoices: {
          where: {
            invoiceDate: { gte: startDate },
            status: { in: ['PROCESSED', 'VALIDATED', 'PAID'] },
          },
          select: {
            total: true,
            invoiceDate: true,
          },
        },
      },
    });

    const vendorStats: VendorSpend[] = vendors
      .map((vendor) => {
        const totalSpend = vendor.invoices.reduce(
          (sum, inv) => sum + (inv.total?.toNumber() || 0),
          0
        );

        return {
          id: vendor.id,
          name: vendor.name,
          totalSpend,
          invoiceCount: vendor.invoices.length,
          avgInvoiceValue: vendor.invoices.length > 0 ? totalSpend / vendor.invoices.length : 0,
          lastInvoiceDate: vendor.invoices.length > 0
            ? new Date(Math.max(...vendor.invoices.map(inv => new Date(inv.invoiceDate || 0).getTime())))
            : null,
        };
      })
      .filter((v) => v.totalSpend > 0)
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, limit);

    const totalSpend = vendorStats.reduce((sum, v) => sum + v.totalSpend, 0);

    res.json({
      success: true,
      data: {
        vendors: vendorStats,
        totalVendors: vendors.length,
        totalSpend,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<Top10VendorsResponse>);
  })
);

export default router;
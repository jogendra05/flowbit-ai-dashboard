import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiResponse, StatsResponse } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-01-01`);

    const totalSpendResult = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        invoiceDate: { gte: yearStart },
        status: { in: ['PROCESSED', 'VALIDATED', 'PAID'] },
      },
    });

    const invoicesProcessed = await prisma.invoice.count({
      where: {
        invoiceDate: { gte: yearStart },
        status: { in: ['PROCESSED', 'VALIDATED', 'PAID'] },
      },
    });

    const documentsUploaded = await prisma.invoice.count();

    const avgResult = await prisma.invoice.aggregate({
      _avg: { total: true },
      where: {
        invoiceDate: { gte: yearStart },
        status: { in: ['PROCESSED', 'VALIDATED', 'PAID'] },
      },
    });

    const today = new Date();
    const overdueCount = await prisma.invoice.count({
      where: {
        payment: {
          dueDate: { lt: today },
          isPaid: false,
        },
      },
    });

    const stats: StatsResponse = {
      totalSpend: totalSpendResult._sum.total?.toNumber() || 0,
      invoicesProcessed,
      documentsUploaded,
      avgInvoiceValue: avgResult._avg.total?.toNumber() || 0,
      overdueDays: overdueCount,
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    } as ApiResponse<StatsResponse>);
  })
);

export default router;
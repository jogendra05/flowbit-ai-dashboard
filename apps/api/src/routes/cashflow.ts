import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiResponse, CashOutflowResponse, CashOutflowPeriod } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const weeks = Math.min(parseInt(req.query.weeks as string) || 12, 52);

    const today = new Date();
    const forecastStart = new Date(today);
    const forecastEnd = new Date(today);
    forecastEnd.setDate(forecastEnd.getDate() + weeks * 7);

    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        payment: {
          isPaid: false,
          dueDate: {
            gte: forecastStart,
            lte: forecastEnd,
          },
        },
      },
      select: {
        id: true,
        total: true,
        payment: {
          select: { dueDate: true },
        },
      },
    });

    const weekMap = new Map<string, { invoices: number; total: number }>();

    unpaidInvoices.forEach((invoice) => {
      if (!invoice.payment?.dueDate) return;

      const dueDate = new Date(invoice.payment.dueDate);
      const weekNum = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );

      if (weekNum <= 0) return;

      const weekKey = `W${String(weekNum).padStart(2, '0')}`;

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { invoices: 0, total: 0 });
      }

      const current = weekMap.get(weekKey)!;
      current.invoices += 1;
      current.total += invoice.total?.toNumber() || 0;
    });

    const forecast: CashOutflowPeriod[] = [];
    const year = today.getFullYear();

    for (let i = 1; i <= weeks; i++) {
      const weekKey = `W${String(i).padStart(2, '0')}`;
      const data = weekMap.get(weekKey);

      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() + (i - 1) * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      forecast.push({
        period: `${year}-${weekKey}`,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        expectedOutflow: data?.total || 0,
        invoiceCount: data?.invoices || 0,
      });
    }

    const totalForecast = forecast.reduce((sum, p) => sum + p.expectedOutflow, 0);

    res.json({
      success: true,
      data: {
        forecast,
        totalForecast,
        forecastPeriod: `next ${weeks} weeks`,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<CashOutflowResponse>);
  })
);

export default router;
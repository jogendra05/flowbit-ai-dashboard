import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiResponse, CategorySpendResponse, CategorySpend } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const months = Math.min(parseInt(req.query.months as string) || 12, 60);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const lineItems = await prisma.lineItem.findMany({
      where: {
        invoice: {
          invoiceDate: { gte: startDate },
          status: { in: ['PROCESSED', 'VALIDATED', 'PAID'] },
        },
      },
      select: {
        category: true,
        description: true,
        totalPrice: true,
      },
    });

    const categoryMap = new Map<string, { total: number; count: number }>();

    lineItems.forEach((item) => {
      const category = item.category || item.description || 'Uncategorized';
      const amount = item.totalPrice?.toNumber() || 0;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, count: 0 });
      }

      const current = categoryMap.get(category)!;
      current.total += amount;
      current.count += 1;
    });

    const totalSpend = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.total,
      0
    );

    const categories: CategorySpend[] = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        category: name,
        totalSpend: data.total,
        itemCount: data.count,
        percentage: totalSpend > 0 ? (data.total / totalSpend) * 100 : 0,
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, limit);

    res.json({
      success: true,
      data: {
        categories,
        totalSpend,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<CategorySpendResponse>);
  })
);

export default router;
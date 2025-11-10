import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiResponse, InvoicesResponse } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize as string) || 20, 1), 100);
    const search = (req.query.search as string) || '';
    const vendorId = req.query.vendorId as string;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const sortBy = (req.query.sortBy as string) || 'date';
    const sortOrder = (req.query.sortOrder as string || 'desc').toLowerCase() as 'asc' | 'desc';

    const where: any = {
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { vendor: { name: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    if (vendorId) {
      where.AND.push({ vendorId });
    }

    if (status) {
      where.AND.push({ status });
    }

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
      if (Object.keys(dateFilter).length > 0) {
        where.AND.push({ invoiceDate: dateFilter });
      }
    }

    if (where.AND.length === 0) {
      delete where.AND;
    }

    let orderBy: any = {};
    switch (sortBy) {
      case 'amount':
        orderBy = { total: sortOrder };
        break;
      case 'vendor':
        orderBy = { vendor: { name: sortOrder } };
        break;
      case 'date':
      default:
        orderBy = { invoiceDate: sortOrder };
    }

    const total = await prisma.invoice.count({ where });

    // Include vendor (name) and payment (so inv.payment?.dueDate is available)
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        vendor: { select: { name: true } },
        payment: true, // added so we can access inv.payment?.dueDate
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const invoiceRows = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      vendor: inv.vendor,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.payment?.dueDate || null,
      total: inv.total?.toNumber() || 0,
      status: inv.status,
      isValidated: inv.isValidated,
    }));

    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      data: {
        invoices: invoiceRows,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<InvoicesResponse>);
  })
);

export default router;
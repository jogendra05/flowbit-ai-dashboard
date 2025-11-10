
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import corsMiddleware from './middleware/cors.js';
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import { prisma } from './lib/prisma.js';

// Routes
import statsRouter from './routes/stats.js';
import trendsRouter from './routes/trends.js';
import vendorsRouter from './routes/vendors.js';
import categoriesRouter from './routes/categories.js';
import cashflowRouter from './routes/cashflow.js';
import invoicesRouter from './routes/invoices.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get(
  '/health',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  })
);

// API Routes
app.use('/api/stats', statsRouter);
app.use('/api/invoice-trends', trendsRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/category-spend', categoriesRouter);
app.use('/api/cash-outflow', cashflowRouter);
app.use('/api/invoices', invoicesRouter);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
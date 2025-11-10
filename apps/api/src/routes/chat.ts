import express, { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const router = express.Router();

const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

type ChatRequest = z.infer<typeof chatRequestSchema>;

interface ChatResponse {
  success: boolean;
  queryId: string;
  userMessage: string;
  generatedSql?: string;
  results?: Record<string, any>[];
  columnNames?: string[];
  error?: string;
}

router.post('/chat-with-data', async (req: Request, res: Response) => {
  try {
    const { message } = chatRequestSchema.parse(req.body);

    const vannaApiBase = process.env.VANNA_API_BASE_URL || 'http://localhost:8000';

    // Call Vanna AI server
    const vannaResponse = await axios.post(
      `${vannaApiBase}/chat`,
      { message },
      { timeout: 30000 }
    );

    const {
      query_id,
      user_message,
      generated_sql,
      results,
      error,
      column_names,
    } = vannaResponse.data;

    // Save to chat history
    if (!error && generated_sql) {
      try {
        await prisma.chatHistory.create({
          data: {
            userQuery: user_message,
            generatedSql: generated_sql,
            resultCount: results?.length || 0,
            success: true,
          },
        });
      } catch (dbError) {
        console.error('Failed to save chat history:', dbError);
      }
    }

    const response: ChatResponse = {
      success: !error,
      queryId: query_id,
      userMessage: user_message,
      generatedSql: generated_sql,
      results,
      columnNames: column_names,
      error,
    };

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        success: false,
        error: error.response?.data?.detail || 'Failed to process query',
      });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request format',
        details: error,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/chat-health
 */
router.get('/chat-health', async (req: Request, res: Response) => {
  try {
    const vannaApiBase = process.env.VANNA_API_BASE_URL || 'http://localhost:8000';
    const health = await axios.get(`${vannaApiBase}/health`);
    
    res.json({
      success: true,
      vannaHealth: health.data,
    });
  } catch (error) {
    console.error('Vanna health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Vanna AI server not responding',
    });
  }
});

/**
 * GET /api/chat-history
 */
router.get('/chat-history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const history = await prisma.chatHistory.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.chatHistory.count();

    res.json({
      success: true,
      data: history,
      pagination: { total, limit, offset },
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history',
    });
  }
});

export default router;

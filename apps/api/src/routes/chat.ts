// import { Router, Request, Response } from 'express';
// import axios from 'axios';
// import { prisma } from '../lib/prisma';
// import { ApiResponse } from '../types';
// import { asyncHandler } from '../middleware/errorHandler';

// const router = Router();

// // Configuration
// const VANNA_SERVER_URL = process.env.VANNA_SERVER_URL || 'http://localhost:8000';
// const RATE_LIMIT_MAP = new Map<string, number[]>(); // IP -> timestamps

// // ==================== RATE LIMITING ====================

// function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
//   const now = Date.now();
//   const windowStart = now - windowMs;

//   if (!RATE_LIMIT_MAP.has(ip)) {
//     RATE_LIMIT_MAP.set(ip, [now]);
//     return true;
//   }

//   const timestamps = RATE_LIMIT_MAP.get(ip)!.filter(t => t > windowStart);

//   if (timestamps.length >= maxRequests) {
//     return false;
//   }

//   timestamps.push(now);
//   RATE_LIMIT_MAP.set(ip, timestamps);
//   return true;
// }

// // ==================== TYPES ====================

// interface VannaRequest {
//   query: string;
//   conversation_id?: string;
// }

// interface VannaResponse {
//   success: boolean;
//   generated_sql: string;
//   results: any[];
//   error?: string;
//   message?: string;
// }

// // ==================== ENDPOINTS ====================

// /**
//  * POST /api/chat-with-data
//  * Forward natural language query to Vanna AI
//  * Returns generated SQL and query results
//  */
// router.post(
//   '/',
//   asyncHandler(async (req: Request, res: Response) => {
//     // Rate limiting
//     const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

//     if (!checkRateLimit(clientIp)) {
//       return res.status(429).json({
//         success: false,
//         error: 'Too many requests. Please wait before asking another question.',
//       });
//     }

//     const { query, conversation_id } = req.body;

//     // Validate input
//     if (!query || typeof query !== 'string' || query.trim().length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Query is required and must be a non-empty string',
//       });
//     }

//     if (query.length > 500) {
//       return res.status(400).json({
//         success: false,
//         error: 'Query must be less than 500 characters',
//       });
//     }

//     try {
//       console.log(`📝 Received query: ${query}`);

//       // Check if Vanna server is running
//       try {
//         await axios.get(`${VANNA_SERVER_URL}/health`);
//       } catch (error) {
//         console.error('❌ Vanna server not available');
//         return res.status(503).json({
//           success: false,
//           error: 'AI service is currently unavailable. Please try again later.',
//         });
//       }

//       // Send query to Vanna AI
//       const vannaRequest: VannaRequest = {
//         query,
//         conversation_id,
//       };

//       console.log(`🔄 Forwarding to Vanna: ${VANNA_SERVER_URL}/chat`);

//       const vannaResponse = await axios.post<VannaResponse>(
//         `${VANNA_SERVER_URL}/chat`,
//         vannaRequest,
//         {
//           timeout: 30000, // 30 second timeout
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       const { success, generated_sql, results, error, message } = vannaResponse.data;

//       if (!success) {
//         console.error(`❌ Vanna error: ${error}`);
//         return res.status(400).json({
//           success: false,
//           error: error || 'Failed to process query',
//         });
//       }

//       console.log(`✅ Query processed. Generated SQL: ${generated_sql}`);
//       console.log(`📊 Results: ${results.length} rows`);

//       // Save chat interaction to database (for history/analytics)
//       try {
//         await prisma.chatHistory.create({
//           data: {
//             userQuery: query,
//             generatedSql: generated_sql,
//             resultCount: results.length,
//             success: true,
//             userIp: clientIp,
//           },
//         });
//       } catch (dbError) {
//         // Don't fail if we can't save to DB
//         console.warn('Could not save chat history:', dbError);
//       }

//       // Return response
//       res.json({
//         success: true,
//         data: {
//           query,
//           generated_sql,
//           results,
//           result_count: results.length,
//           timestamp: new Date().toISOString(),
//         },
//       } as ApiResponse<any>);

//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         console.error(`❌ Vanna request error: ${error.message}`);

//         if (error.code === 'ECONNREFUSED') {
//           return res.status(503).json({
//             success: false,
//             error: 'Cannot connect to AI service. Is Vanna server running?',
//           });
//         }

//         if (error.response?.status === 400) {
//           return res.status(400).json({
//             success: false,
//             error: error.response?.data?.error || 'Invalid query',
//           });
//         }

//         if (error.code === 'ECONNABORTED') {
//           return res.status(504).json({
//             success: false,
//             error: 'Query processing timed out. Please try a simpler question.',
//           });
//         }
//       }

//       console.error('Unexpected error:', error);
//       res.status(500).json({
//         success: false,
//         error: 'An unexpected error occurred',
//       });
//     }
//   })
// );

// /**
//  * GET /api/chat-with-data/history
//  * Get chat history for current user
//  */
// router.get(
//   '/history',
//   asyncHandler(async (req: Request, res: Response) => {
//     try {
//       const { limit = 10, offset = 0 } = req.query;

//       const history = await prisma.chatHistory.findMany({
//         take: Math.min(parseInt(limit as string) || 10, 50),
//         skip: parseInt(offset as string) || 0,
//         orderBy: {
//           createdAt: 'desc',
//         },
//       });

//       res.json({
//         success: true,
//         data: history,
//       });
//     } catch (error) {
//       console.error('Error fetching history:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to fetch chat history',
//       });
//     }
//   })
// );

// /**
//  * DELETE /api/chat-with-data/history/:id
//  * Delete a chat history entry
//  */
// router.delete(
//   '/history/:id',
//   asyncHandler(async (req: Request, res: Response) => {
//     try {
//       const { id } = req.params;

//       await prisma.chatHistory.delete({
//         where: { id },
//       });

//       res.json({
//         success: true,
//         message: 'Chat history deleted',
//       });
//     } catch (error) {
//       console.error('Error deleting history:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to delete chat history',
//       });
//     }
//   })
// );

// /**
//  * POST /api/chat-with-data/test-connection
//  * Test connection to Vanna server
//  */
// router.post(
//   '/test-connection',
//   asyncHandler(async (req: Request, res: Response) => {
//     try {
//       console.log(`🧪 Testing connection to ${VANNA_SERVER_URL}...`);

//       const response = await axios.get(`${VANNA_SERVER_URL}/health`, {
//         timeout: 5000,
//       });

//       if (response.data.status === 'healthy') {
//         return res.json({
//           success: true,
//           message: 'Connected to Vanna AI server',
//           vanna_status: response.data.vanna_status,
//         });
//       }

//       res.status(503).json({
//         success: false,
//         error: 'Vanna server is not healthy',
//       });
//     } catch (error) {
//       console.error('Connection test failed:', error);
//       res.status(503).json({
//         success: false,
//         error: 'Cannot connect to Vanna AI server',
//       });
//     }
//   })
// );

// export default router;
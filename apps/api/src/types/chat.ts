export interface ChatQuery {
  query: string;
  conversation_id?: string;
}

export interface ChatResult {
  query: string;
  generated_sql: string;
  results: any[];
  result_count: number;
  timestamp: string;
}

export interface ChatError {
  success: boolean;
  error: string;
}

export interface VannaHealthResponse {
  status: string;
  vanna_status: string;
}

export interface ChatHistory {
  id: string;
  userQuery: string;
  generatedSql: string;
  resultCount: number;
  success: boolean;
  userIp?: string;
  createdAt: Date;
  updatedAt: Date;
}
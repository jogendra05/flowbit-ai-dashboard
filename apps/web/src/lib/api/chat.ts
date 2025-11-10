export interface ChatRequest {
  query: string;
  conversation_id?: string;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    query: string;
    generated_sql: string;
    results: any[];
    result_count: number;
    timestamp: string;
  };
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function sendChatQuery(query: string): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_URL}/api/chat-with-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query } as ChatRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to send query: ${errorMessage}`,
    };
  }
}

export async function testVannaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/chat-with-data/test-connection`, {
      method: 'POST',
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function getChatHistory(limit: number = 10, offset: number = 0): Promise<any[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/chat-with-data/history?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) throw new Error('Failed to fetch history');

    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function deleteChatHistory(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/chat-with-data/history/${id}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch {
    return false;
  }
}
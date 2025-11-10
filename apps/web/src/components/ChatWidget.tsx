"use client";

import React, { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  results?: Record<string, any>[];
  columnNames?: string[];
  error?: string;
  timestamp: Date;
};

export default function ChatWidgetWithData({ apiPath = "/api/chat-with-data" }: { apiPath?: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // initial assistant greeting
    setMessages((m) => {
      if (m.length === 0) {
        return [
          {
            id: cryptoRandomId(),
            role: "assistant",
            content: "Hi! 👋 Ask me anything about your invoices and vendors.",
            timestamp: new Date(),
          },
        ];
      }
      return m;
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  function cryptoRandomId() {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return String(Math.random()).slice(2);
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: cryptoRandomId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || (typeof data === "object" && data !== null && data.success === false)) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      // build assistant message using the "chat-with-data" shape if present
      const assistantMsg: Message = {
        id: cryptoRandomId(),
        role: "assistant",
        content:
          (data && typeof data === "object" && (data.answer || data.message)) ||
          (data && data.generatedSql ? `Found ${data.results?.length || 0} results` : "No results"),
        sql: data?.generatedSql ?? data?.sql,
        results: data?.results ?? undefined,
        columnNames: data?.columnNames ?? undefined,
        error: data?.error ?? undefined,
        timestamp: new Date(),
      };

      setMessages((m) => [...m, assistantMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: cryptoRandomId(),
        role: "assistant",
        content: `Error: ${err?.message ?? "Something went wrong"}`,
        error: err?.message ?? "Something went wrong",
        timestamp: new Date(),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) sendMessage();
    }
  }

  return (
    <>
      {/* Floating circular button */}
      <button
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((s) => !s)}
        className="fixed z-50 bottom-5 right-5 w-14 h-14 rounded-full bg-indigo-600 shadow-lg flex items-center justify-center text-white hover:scale-105 transform transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`fixed z-40 bottom-20 right-5 flex items-end justify-end pointer-events-none transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div
          className={`pointer-events-auto w-full max-w-sm sm:w-80 h-[60vh] sm:h-[80vh] bg-white rounded-t-lg sm:rounded-lg shadow-xl flex flex-col overflow-hidden transform transition-transform duration-300 ${
            open ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">💬</div>
              <div>
                <div className="text-sm font-medium">Assistant</div>
                <div className="text-xs text-slate-500">Ask me anything</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loading && <div className="text-xs text-slate-500">Thinking…</div>}
              <button
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="p-2 rounded-md hover:bg-slate-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-slate-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-3 space-y-3 bg-gradient-to-b from-white to-slate-50">
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[85%] ${m.role === "user" ? "ml-auto text-right" : "mr-auto text-left"}`}>
                <div
                  className={`inline-block px-3 py-2 rounded-xl break-words whitespace-pre-wrap text-sm ${
                    m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {m.content}
                </div>

                {/* SQL block */}
                {m.sql && (
                  <div className="mt-2 bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono overflow-x-auto max-w-[85%]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-400">SQL</span>
                      <button
                        onClick={() => copyToClipboard(m.sql!, m.id)}
                        className="text-xs text-slate-300 hover:text-white"
                      >
                        {copiedId === m.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap break-words">{m.sql}</pre>
                  </div>
                )}

                {/* Results table */}
                {m.results && m.results.length > 0 && (
                  <div className="mt-3 overflow-x-auto max-w-[85%]">
                    <table className="text-xs w-full border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100">
                          {m.columnNames?.map((col) => (
                            <th key={col} className="border border-slate-300 px-2 py-1 text-left font-semibold">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {m.results.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {m.columnNames?.map((col) => (
                              <td key={col} className="border border-slate-300 px-2 py-1 truncate max-w-xs">
                                {String(row[col] ?? '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {m.results.length > 10 && (
                      <p className="text-xs text-slate-500 mt-2">Showing 10 of {m.results.length} rows</p>
                    )}
                  </div>
                )}

                {/* Error */}
                {m.error && (
                  <div className="mt-3 flex items-start gap-2 bg-red-50 text-red-900 p-2 rounded text-xs max-w-[85%]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <p>{m.error}</p>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 mt-1">
                  {formatDistanceToNow(m.timestamp, { addSuffix: true })}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-900 rounded-lg p-4 shadow">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                      <path d="M22 12a10 10 0 0 1-10 10" />
                    </svg>
                    <span className="text-sm">Processing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Composer */}
          <div className="px-3 py-3 border-t bg-white">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type a message..."
                className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                disabled={loading}
              />

              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-sm">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

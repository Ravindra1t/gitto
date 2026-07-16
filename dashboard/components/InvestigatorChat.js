'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Loader2, AlertCircle } from 'lucide-react';

export default function InvestigatorChat({ owner, repo }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch initial chat session
  useEffect(() => {
    fetchMessages();
    return () => clearInterval(pollIntervalRef.current);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // Polling logic when status is PENDING or PROCESSING
  useEffect(() => {
    if (status === 'PENDING' || status === 'PROCESSING') {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(fetchMessages, 1500);
      }
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [status]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${owner}/${repo}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setStatus(data.status || 'COMPLETED');
        if (data.error) {
          setError(data.error);
        } else {
          setError(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || status === 'PENDING' || status === 'PROCESSING') return;

    const messageText = inputValue.trim();
    setInputValue('');
    setError(null);

    // Optimistically update the UI
    setMessages((prev) => [...prev, { role: 'user', content: messageText }]);
    setStatus('PENDING');

    try {
      const res = await fetch(`/api/chat/${owner}/${repo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const data = await res.json();
      setMessages(data.messages || []);
      setStatus(data.status || 'PENDING');
    } catch (err) {
      setError('Connection failure. Check if the worker is active.');
      setStatus('COMPLETED');
    }
  };

  return (
    <div className="border border-zinc-200 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[500px] hover:border-zinc-300 transition-colors">
      
      {/* Header */}
      <div className="bg-zinc-900 px-6 py-4 flex items-center justify-between border-b border-zinc-800 text-white">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-400 animate-pulse" />
          <h2 className="text-xs font-mono uppercase tracking-wider font-extrabold">
            Interactive Codebase Investigator
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {(status === 'PENDING' || status === 'PROCESSING') && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
          <span className="text-[10px] font-mono text-zinc-400">
            {status === 'PENDING' || status === 'PROCESSING' ? 'INVESTIGATING...' : 'READY'}
          </span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-zinc-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Terminal className="w-8 h-8 text-zinc-300 animate-pulse" />
            <p className="text-xs font-mono text-zinc-400">
              No active investigation. Ask a question to begin.
            </p>
            <p className="text-[10px] text-zinc-400 max-w-sm">
              Example: "Why was PR #95621 marked as High Risk?" or "Summarize reviewer dynamics for auth routes."
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-mono ${
                  isUser 
                    ? 'bg-zinc-900 border-zinc-950 text-white shadow' 
                    : 'bg-white border-zinc-200 text-zinc-700 shadow-sm'
                }`}>
                  {isUser ? 'U' : 'A'}
                </div>
                <div className={`rounded-lg p-3 text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-zinc-900 text-zinc-100 shadow-sm rounded-tr-none' 
                    : 'bg-white border border-zinc-200 text-zinc-800 shadow-sm rounded-tl-none font-sans whitespace-pre-wrap'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}

        {/* Thinking Indicator */}
        {(status === 'PENDING' || status === 'PROCESSING') && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-white border border-zinc-200 text-zinc-700 text-[10px] font-mono">
              A
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg p-3 rounded-tl-none shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Agent is executing tools...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-mono items-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSend} className="border-t border-zinc-200 p-4 bg-white flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={status === 'PENDING' || status === 'PROCESSING'}
          placeholder={status === 'PENDING' || status === 'PROCESSING' ? 'Please wait for response...' : 'Ask about PRs, bottlenecks, or codebase patterns...'}
          className="flex-grow h-10 px-4 border border-zinc-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all bg-zinc-50/50 disabled:bg-zinc-50 disabled:text-zinc-400"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || status === 'PENDING' || status === 'PROCESSING'}
          className="h-10 w-10 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white rounded flex items-center justify-center transition-colors shadow-sm"
        >
          {status === 'PENDING' || status === 'PROCESSING' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

    </div>
  );
}

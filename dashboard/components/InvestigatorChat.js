'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="border border-white/10 bg-[#141414] rounded-none overflow-hidden flex flex-col h-[520px] hover:border-white/20 transition-colors duration-200">
      
      {/* Header */}
      <div className="bg-[#141414] px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neutral-500" />
          <h2 className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 font-extrabold">
            Interactive Codebase Investigator
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {(status === 'PENDING' || status === 'PROCESSING') && (
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neutral-200"></span>
            </span>
          )}
          <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">
            {status === 'PENDING' || status === 'PROCESSING' ? 'INVESTIGATING...' : 'READY'}
          </span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-[#0a0a0a]/30">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2"
            >
              <Terminal className="w-6 h-6 text-neutral-700 animate-pulse" />
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                No active investigation.
              </p>
              <p className="text-[10px] text-neutral-600 max-w-xs font-sans">
                Ask questions about code architecture, developer dynamics, or file history.
              </p>
            </motion.div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-none flex items-center justify-center border text-[9px] font-mono ${
                    isUser 
                      ? 'bg-neutral-800 border-white/10 text-white' 
                      : 'bg-white text-[#0a0a0a] border-transparent font-bold'
                  }`}>
                    {isUser ? 'U' : 'A'}
                  </div>
                  <div className={`rounded-none p-3 text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-neutral-900 text-neutral-100 border border-white/10' 
                      : 'bg-[#141414] border border-white/10 text-neutral-300 font-sans whitespace-pre-wrap'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Thinking Indicator */}
        {(status === 'PENDING' || status === 'PROCESSING') && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-[85%] mr-auto items-center"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-none flex items-center justify-center bg-white text-[#0a0a0a] border-transparent text-[9px] font-mono font-bold">
              A
            </div>
            <div className="bg-[#141414] border border-white/10 rounded-none p-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce" />
              </div>
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Agent is executing tools...</span>
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex gap-2 p-3 bg-red-950/20 border border-red-900/50 rounded-none text-red-400 text-[10px] font-mono items-center">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSend} className="border-t border-white/10 p-4 bg-[#141414] flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={status === 'PENDING' || status === 'PROCESSING'}
          placeholder={status === 'PENDING' || status === 'PROCESSING' ? 'Please wait for response...' : 'Ask about PRs, bottlenecks, or codebase patterns...'}
          className="flex-grow h-10 px-4 bg-[#0a0a0a] border border-white/10 rounded-none text-xs font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-all disabled:text-neutral-500"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || status === 'PENDING' || status === 'PROCESSING'}
          className="h-10 w-10 bg-white hover:bg-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-700 text-[#0a0a0a] rounded-none flex items-center justify-center transition-colors cursor-pointer"
        >
          {status === 'PENDING' || status === 'PROCESSING' ? (
            <Loader2 className="w-4 h-4 animate-spin text-neutral-700" />
          ) : (
            <Send className="w-3.5 h-3.5 text-[#0a0a0a]" />
          )}
        </button>
      </form>

    </div>
  );
}

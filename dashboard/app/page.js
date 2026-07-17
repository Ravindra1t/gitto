'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { analyzeRepository } from './actions';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function AnalysisForm() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error');

  return (
    <form action={analyzeRepository} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="repository" className="block text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
          GitHub Repository
        </label>
        <div className="relative">
          <input
            type="text"
            name="repository"
            id="repository"
            placeholder="e.g. owner/repo or github URL"
            required
            className="w-full h-10 px-3 bg-[#0a0a0a] border border-white/10 rounded-none text-xs text-neutral-50 placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Error notifications */}
      {errorType && (
        <div className="flex gap-2 p-3 text-[11px] bg-red-950/20 border border-red-900/50 text-red-400 rounded-none font-mono">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {errorType === 'invalid_repo' && 'Invalid format. Use "owner/repo" or a GitHub link.'}
            {errorType === 'db_error' && 'Failed to connect to database.'}
            {errorType === 'active_job_exists' && 'You already have another active analysis running.'}
          </span>
        </div>
      )}

      <button
        type="submit"
        className="w-full h-10 bg-white hover:bg-white/90 text-[#0a0a0a] font-mono text-[11px] uppercase tracking-wider font-extrabold rounded-none flex items-center justify-center gap-2 cursor-pointer transition-colors"
      >
        Analyze Repository <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div className="relative flex-grow flex flex-col items-center justify-center px-6 py-20 bg-[#0a0a0a] overflow-hidden">
      {/* Stark background layout lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm z-10 space-y-8"
      >
        {/* Branding header */}
        <div className="space-y-3">
          <h1 className="text-white text-3xl font-black tracking-tight leading-none text-center">
            Gitto
          </h1>
          <p className="text-xs text-neutral-400 text-center font-mono uppercase tracking-wider">
            // Repository Intelligence Engine
          </p>
        </div>

        {/* Input Card */}
        <div className="border border-white/10 bg-[#141414] rounded-none p-6 space-y-6">
          <Suspense fallback={
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
            </div>
          }>
            <AnalysisForm />
          </Suspense>

          {/* Quick instructions / examples */}
          <div className="border-t border-white/10 pt-4 text-[10px] text-neutral-500 space-y-3">
            <p className="font-mono uppercase tracking-wider text-neutral-400">Quick Examples:</p>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <form action={analyzeRepository} className="w-full">
                <input type="hidden" name="repository" value="react/react" />
                <button type="submit" className="w-full text-left truncate text-neutral-400 hover:text-neutral-50 transition-colors cursor-pointer">
                  → react/react
                </button>
              </form>
              <form action={analyzeRepository} className="w-full">
                <input type="hidden" name="repository" value="nodejs/node" />
                <button type="submit" className="w-full text-left truncate text-neutral-400 hover:text-neutral-50 transition-colors cursor-pointer">
                  → nodejs/node
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Feature status bar */}
        <div className="flex justify-between items-center px-1 text-[10px] text-neutral-600 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
            Worker status: Active
          </span>
          <span>Cache: MongoDB Atlas</span>
        </div>
      </motion.div>
    </div>
  );
}

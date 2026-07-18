'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { analyzeRepository } from './actions';
import { 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  BookOpen, 
  Users, 
  Cpu, 
  Zap, 
  GitPullRequest, 
  CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';

function AnalysisForm() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error');

  return (
    <form action={analyzeRepository} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="repository" className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider">
          GitHub Repository
        </label>
        <div className="relative">
          <input
            type="text"
            name="repository"
            id="repository"
            placeholder="e.g. facebook/react or github URL"
            required
            className="w-full h-10 px-3 bg-[#0a0a0c] border border-white/10 rounded-none text-xs text-slate-50 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
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
        className="w-full h-10 bg-white hover:bg-white/95 text-[#0a0a0c] font-mono text-[11px] uppercase tracking-wider font-bold rounded-none flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] border border-transparent"
      >
        Analyze Repository <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div className="relative flex-grow flex flex-col justify-center px-6 py-12 md:py-20 overflow-hidden">
      {/* Background layout lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Branding and Value Proposition */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-7 space-y-8"
        >
          {/* Main Hero Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-indigo-500/20 bg-indigo-950/20 text-indigo-400 font-mono text-[10px] uppercase tracking-wider font-semibold rounded-none">
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
              Now Active: Version 2.0
            </div>
            <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight leading-none">
              Gitto
            </h1>
            <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
              // REPOSITORY INTELLIGENCE & CONTRIBUTION ENGINE
            </p>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
            Gitto reconstructs the dynamics of open-source projects by compiling metrics on size tiers, review velocity, and test coverage across the last 50 merged pull requests. Accelerate contribution paths and learn patterns directly from production codebase history.
          </p>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* For Contributors */}
            <div className="space-y-3 p-5 border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2 text-indigo-400">
                <Users className="w-4 h-4" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-100">
                  For Contributors
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Predict review cycles and audit repository standards. Identify target domains, code coverage expectations, and typical merge speeds before submitting your branch.
              </p>
              <ul className="space-y-1.5 pt-1 text-[10px] text-slate-500 font-mono">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500/80" /> Review velocity insights
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500/80" /> Size-tier acceptances
                </li>
              </ul>
            </div>

            {/* For Students */}
            <div className="space-y-3 p-5 border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2 text-indigo-400">
                <BookOpen className="w-4 h-4" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-100">
                  For Students
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Deconstruct enterprise software design. Study real-world qualitative architectural assessments and use the interactive AI investigator to clear up code patterns.
              </p>
              <ul className="space-y-1.5 pt-1 text-[10px] text-slate-500 font-mono">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500/80" /> Quantitative code domains
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500/80" /> Interactive chat debugger
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        {/* Right Column: Interactive Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="border border-white/10 bg-[#141415]/80 backdrop-blur-md rounded-none p-6 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:border-white/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.08)] transition-all duration-300">
            <Suspense fallback={
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
              </div>
            }>
              <AnalysisForm />
            </Suspense>

            {/* Quick instructions / examples */}
            <div className="border-t border-white/10 pt-4 text-[10px] text-slate-500 space-y-3">
              <p className="font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-indigo-400" />
                Featured Repositories:
              </p>
              <div className="grid grid-cols-2 gap-3 font-mono">
                <form action={analyzeRepository} className="w-full">
                  <input type="hidden" name="repository" value="react/react" />
                  <button type="submit" className="w-full text-left truncate text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer">
                    → react/react
                  </button>
                </form>
                <form action={analyzeRepository} className="w-full">
                  <input type="hidden" name="repository" value="nodejs/node" />
                  <button type="submit" className="w-full text-left truncate text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer">
                    → nodejs/node
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Feature status bar */}
          <div className="flex justify-between items-center px-1 text-[10px] text-slate-600 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Worker status: Active
            </span>
            <span>Cache: MongoDB Atlas</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

import { analyzeRepository } from './actions';
import { Github, AlertCircle, ArrowRight } from 'lucide-react';

export default async function Home({ searchParams }) {
  const resolvedParams = await searchParams;
  const errorType = resolvedParams?.error;


  return (
    <div className="relative flex-grow flex flex-col items-center justify-center px-4 overflow-hidden py-12">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-mono tracking-tighter font-extrabold uppercase">
            Analyze Pull Requests
          </h1>
          <p className="text-sm text-zinc-400 max-w-xs mx-auto">
            Extract code composition, size tiers, and reviewer dynamics for any GitHub repository.
          </p>
        </div>

        {/* Input Card */}
        <div className="border border-border bg-zinc-950/60 backdrop-blur-md rounded-lg p-6 space-y-6">
          <form action={analyzeRepository} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="repository" className="block text-xs font-mono uppercase text-zinc-400">
                GitHub Repository
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="repository"
                  id="repository"
                  placeholder="e.g. facebook/react-native or github URL"
                  required
                  className="w-full h-10 px-3 bg-zinc-900 border border-border rounded text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>

            {/* Error notifications */}
            {errorType && (
              <div className="flex gap-2 p-3 text-xs bg-red-950/20 border border-red-900/50 text-red-400 rounded">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {errorType === 'invalid_repo' && 'Invalid format. Use "owner/repo" or a GitHub link.'}
                  {errorType === 'db_error' && 'Failed to connect to database. Try again.'}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-xs font-bold rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              Analyze Repository <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick instructions / examples */}
          <div className="border-t border-border pt-4 text-[11px] text-zinc-500 space-y-2">
            <p className="font-mono uppercase tracking-wider text-zinc-400">Examples:</p>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <form action={analyzeRepository} className="w-full">
                <input type="hidden" name="repository" value="react/react" />
                <button type="submit" className="w-full text-left truncate hover:text-zinc-300 transition-colors cursor-pointer">
                  → react/react
                </button>
              </form>
              <form action={analyzeRepository} className="w-full">
                <input type="hidden" name="repository" value="nodejs/node" />
                <button type="submit" className="w-full text-left truncate hover:text-zinc-300 transition-colors cursor-pointer">
                  → nodejs/node
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Feature status bar */}
        <div className="flex justify-between items-center px-2 text-[10px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Worker status: Active
          </span>
          <span>Cache: MongoDB Atlas</span>
        </div>
      </div>
    </div>
  );
}

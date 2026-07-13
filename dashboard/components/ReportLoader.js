'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { cancelAnalysis } from '../app/actions';

export default function ReportLoader({ owner, repo }) {
  const router = useRouter();
  const [status, setStatus] = useState('PENDING');
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;

    async function checkStatus() {
      try {
        const res = await fetch(`/api/status/${owner}/${repo}`);
        const data = await res.json();
        
        if (data.status === 'SUCCESS') {
          // Cache hit: reload the page to render the server-side report dashboard
          clearInterval(intervalId);
          window.location.reload();
        } else if (data.status === 'CANCELLED') {
          clearInterval(intervalId);
          router.push('/');
        } else if (data.status === 'FAILED') {
          clearInterval(intervalId);
          setError(data.error || 'The analysis worker encountered an error.');
        } else if (data.status === 'PROCESSING' || data.status === 'PENDING') {
          setStatus(data.status);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }

    // Run initial check immediately, then poll every 2 seconds
    checkStatus();
    intervalId = setInterval(checkStatus, 2000);

    return () => clearInterval(intervalId);
  }, [owner, repo, router]);

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center bg-zinc-50 px-4 py-12">
        <div className="w-full max-w-md border border-red-200 bg-white rounded-lg p-8 text-center space-y-5 shadow-sm">
          <div className="inline-flex p-3 rounded-full bg-red-50 border border-red-100 text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-mono uppercase text-red-600 font-bold">Analysis Failed</h2>
            <p className="text-[11px] text-zinc-500 font-mono">
              Target: {owner}/{repo}
            </p>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
            {error}
          </p>
          <div className="pt-2">
            <form action={cancelAnalysis} className="w-full">
              <input type="hidden" name="owner" value={owner} />
              <input type="hidden" name="repo" value={repo} />
              <button
                type="submit"
                className="w-full inline-flex h-9 items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono font-bold rounded cursor-pointer transition-colors"
              >
                Go Back Home
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md border border-zinc-200 bg-white rounded-lg p-8 text-center space-y-5 shadow-sm">
        <div className="inline-flex p-3 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-900 animate-spin">
          <Loader2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-mono uppercase text-zinc-900 font-bold">
            {status === 'PENDING' ? 'Waiting in Queue...' : 'Analysis in Progress...'}
          </h2>
          <p className="text-[11px] text-zinc-500 font-mono">
            Target: {owner}/{repo}
          </p>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
          {status === 'PENDING'
            ? 'The background worker is currently busy. Your repository is in the queue and will start shortly.'
            : 'Our background worker has picked up this repository and is currently analyzing the last 50 merged pull requests.'}
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <form action={cancelAnalysis} className="w-full">
            <input type="hidden" name="owner" value={owner} />
            <input type="hidden" name="repo" value={repo} />
            <button
              type="submit"
              className="w-full inline-flex h-9 items-center justify-center text-zinc-400 hover:text-zinc-600 text-xs font-mono transition-colors cursor-pointer border border-transparent hover:border-zinc-200 rounded"
            >
              Cancel Analysis
            </button>
          </form>
        </div>
        <div className="text-[10px] text-zinc-400 font-mono pt-2">
          Checking status in the background. Do not refresh.
        </div>
      </div>
    </div>
  );
}

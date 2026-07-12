import Link from 'next/link';
import clientPromise from '../../../../lib/mongodb';
import { SizeChart, DomainChart } from '../../../../components/ReportChart';
import { GitPullRequest, Calendar, ArrowLeft, RefreshCw, Loader2, Database } from 'lucide-react';

export default async function ReportPage({ params }) {
  // Await params as required by Next.js 15+ App Router
  const { owner, repo } = await params;
  const repoId = `${owner}/${repo}`.toLowerCase();

  let report = null;
  let job = null;
  let connectionError = false;

  try {
    const client = await clientPromise;
    const db = client.db('github_pr_analyzer');

    // Fetch report directly on the server
    report = await db.collection('PR_Reports').findOne({ _id: repoId });

    if (!report) {
      // If report is missing, check if it's currently in the job queue
      job = await db.collection('Job_Queue').findOne({ _id: repoId });
    }
  } catch (error) {
    console.error('Error in Server Component data load:', error);
    connectionError = true;
  }

  // Format date helper
  const formatDate = (dateVal) => {
    if (!dateVal) return 'Unknown';
    const date = new Date(dateVal);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 1. Connection/Database Error State
  if (connectionError) {
    return (
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md border border-red-900/50 bg-red-950/10 rounded-lg p-6 text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-red-950/30 text-red-400">
            <Database className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-mono uppercase text-red-400 font-bold">Connection Failed</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Could not establish a connection to the MongoDB Atlas cluster. Please check your credentials and try again.
          </p>
          <Link
            href="/"
            className="inline-flex h-9 px-4 items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-mono font-bold rounded transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  // 2. Cache Miss / Loading State
  if (!report) {
    return (
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        {/* Zero-JS Auto-Refresh: Reloads the page every 10 seconds to check if report is ready */}
        <meta httpEquiv="refresh" content="10" />

        <div className="w-full max-w-md border border-border bg-zinc-950/60 backdrop-blur-md rounded-lg p-8 text-center space-y-5">
          <div className="inline-flex p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 animate-spin">
            <Loader2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-mono uppercase text-zinc-100 font-bold">Analysis in Progress</h2>
            <p className="text-xs text-zinc-400 font-mono text-zinc-500">
              Target: {owner}/{repo}
            </p>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Our background worker has picked up this repository and is currently analyzing the last 50 merged pull requests. This usually takes 1 to 2 minutes.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href={`/report/${owner}/${repo}`}
              className="inline-flex h-9 items-center justify-center border border-zinc-800 hover:bg-zinc-900 text-zinc-200 text-xs font-mono font-bold rounded transition-colors gap-2"
            >
              <RefreshCw className="w-3 h-3" /> Manually Refresh
            </Link>
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center text-zinc-500 hover:text-zinc-300 text-xs font-mono transition-colors"
            >
              Cancel
            </Link>
          </div>
          <div className="text-[10px] text-zinc-600 font-mono pt-2">
            Page will auto-refresh every 10 seconds.
          </div>
        </div>
      </div>
    );
  }

  // 3. Cache Hit / Report Render State
  return (
    <div className="flex-grow bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
          </Link>
          <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Cached Report
          </span>
        </div>

        {/* Title Block */}
        <div className="border border-border bg-zinc-950/60 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">
                <GitPullRequest className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-mono font-bold tracking-tight text-zinc-100">
                {report.repo_name}
              </h1>
            </div>
            <p className="text-xs text-zinc-500">
              PR Analysis Report for the last 50 merged pull requests.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 sm:self-center">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Analyzed: {formatDate(report.analyzed_at)}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sizes Chart Card */}
          <div className="border border-border bg-zinc-950/60 rounded-lg p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-xs font-mono uppercase text-zinc-400 font-bold">
                Pull Request Size Tiers
              </h2>
            </div>
            <SizeChart data={report.size_tiers} />
          </div>

          {/* Domains Chart Card */}
          <div className="border border-border bg-zinc-950/60 rounded-lg p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-xs font-mono uppercase text-zinc-400 font-bold">
                Codebase Domains Affected
              </h2>
            </div>
            <DomainChart data={report.domains} />
          </div>
        </div>

        {/* Qualitative LLM Summary Section */}
        <div className="border border-border bg-zinc-950/60 rounded-lg p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-xs font-mono uppercase text-zinc-400 font-bold">
              Reviewer Dynamics & Feedback Summary
            </h2>
          </div>
          <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
            {report.llm_summaries}
          </div>
        </div>

      </div>
    </div>
  );
}

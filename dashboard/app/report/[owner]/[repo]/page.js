import Link from 'next/link';
import clientPromise from '../../../../lib/mongodb';
import ReportLoader from '../../../../components/ReportLoader';
import { SizeChart, DomainChart, VelocityChart, DiscussionChart } from '../../../../components/ReportChart';
import { GitPullRequest, Calendar, ArrowLeft, Database, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';


// Lightweight server-side markdown parser
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        const cleanLine = line.trim();
        
        // Headers
        if (cleanLine.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-xs font-mono uppercase tracking-wider font-extrabold text-zinc-900 mt-6 mb-2 border-b border-zinc-100 pb-1.5">
              {cleanLine.slice(4)}
            </h3>
          );
        }
        
        // Bullet points
        if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
          const content = cleanLine.slice(2);
          const parts = content.split('**');
          return (
            <li key={idx} className="ml-4 list-disc text-xs text-zinc-600 my-1 leading-relaxed">
              {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-zinc-950">{part}</strong> : part)}
            </li>
          );
        }
        
        // Empty lines
        if (cleanLine === '') {
          return <div key={idx} className="h-1.5" />;
        }
        
        // Standard paragraphs with bold text support
        const parts = cleanLine.split('**');
        return (
          <p key={idx} className="text-xs text-zinc-600 leading-relaxed">
            {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-zinc-950">{part}</strong> : part)}
          </p>
        );
      })}
    </div>
  );
}

export default async function ReportPage({ params }) {
  const { owner, repo } = await params;
  const repoId = `${owner}/${repo}`.toLowerCase();

  let report = null;
  let connectionError = false;

  try {
    const client = await clientPromise;
    const db = client.db('github_pr_analyzer');
    report = await db.collection('PR_Reports').findOne({ _id: repoId });

    if (!report) {
      // Direct page load check: if cache miss, check if there's a failed job in the queue
      const existingJob = await db.collection('Job_Queue').findOne({ _id: repoId });
      if (existingJob && (existingJob.status === 'FAILED' || existingJob.status === 'CANCELLED')) {
        // Reset failed job back to PENDING so the worker runs it again
        await db.collection('Job_Queue').updateOne(
          { _id: repoId },
          {
            $set: {
              status: 'PENDING',
              repo_name: `${owner}/${repo}`,
              created_at: new Date(),
              error: null,
              failed_at: null
            }
          }
        );
        console.log(`[AUTO-RESET] Reset stuck failed job for '${repoId}' to PENDING.`);
      }
    }
  } catch (error) {
    console.error('Error in Server Component data load:', error);
    connectionError = true;
  }

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

  // 1. Connection Error
  if (connectionError) {
    return (
      <div className="flex-grow flex items-center justify-center bg-zinc-50 px-4 py-12">
        <div className="w-full max-w-md border border-zinc-200 bg-white rounded-lg p-6 text-center space-y-4 shadow-sm">
          <div className="inline-flex p-3 rounded-full bg-zinc-50 text-zinc-600 border border-zinc-100">
            <Database className="w-6 h-6" />
          </div>
          <h2 className="text-xs font-mono uppercase text-zinc-900 font-bold">Connection Failed</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Could not establish a connection to the MongoDB Atlas cluster. Please check network logs.
          </p>
          <Link
            href="/"
            className="inline-flex h-9 px-4 items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono font-bold rounded transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  // 2. Cache Miss / Loading State
  if (!report) {
    return <ReportLoader owner={owner} repo={repo} />;
  }

  // 3. Report Screen
  return (
    <div className="flex-grow bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
          </Link>
          <span className="text-[10px] font-mono text-zinc-400 border border-zinc-200 bg-white px-2 py-0.5 rounded flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Cached Report
          </span>
        </div>

        {/* Repository info banner */}
        <div className="border border-zinc-200 bg-white rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-zinc-50 border border-zinc-200 rounded text-zinc-700">
                <GitPullRequest className="w-4 h-4" />
              </div>
              <h1 className="text-md font-mono font-bold tracking-tight text-zinc-900">
                {report.repo_name}
              </h1>
            </div>
            <p className="text-xs text-zinc-400">
              PR Analysis Report based on the last 50 merged pull requests.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 sm:self-center">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Analyzed: {formatDate(report.analyzed_at)}</span>
          </div>
        </div>

        {/* 4-Chart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sizes Chart Card */}
          <div className="border border-zinc-200 bg-white rounded-lg p-6 space-y-4 shadow-sm hover:border-zinc-300 transition-colors">
            <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
              <h2 className="text-xs font-mono uppercase text-zinc-500 font-bold">
                PR Size Tiers
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">Lines Changed</span>
            </div>
            <SizeChart data={report.size_tiers} />
          </div>

          {/* Domains Chart Card */}
          <div className="border border-zinc-200 bg-white rounded-lg p-6 space-y-4 shadow-sm hover:border-zinc-300 transition-colors">
            <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
              <h2 className="text-xs font-mono uppercase text-zinc-500 font-bold">
                Codebase Domains
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">Affected Scope</span>
            </div>
            <DomainChart data={report.domains} />
          </div>

          {/* Velocity Chart Card */}
          <div className="border border-zinc-200 bg-white rounded-lg p-6 space-y-4 shadow-sm hover:border-zinc-300 transition-colors">
            <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
              <h2 className="text-xs font-mono uppercase text-zinc-500 font-bold">
                Merge Velocity
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">Duration Tiers</span>
            </div>
            {report.merge_velocity ? (
              <VelocityChart data={report.merge_velocity} />
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-zinc-50 border border-zinc-200 border-dashed rounded font-mono text-xs text-zinc-400 gap-1.5">
                <HelpCircle className="w-5 h-5 text-zinc-300" />
                <span>No velocity data</span>
                <span className="text-[10px] text-zinc-500 max-w-xs">Run a new analysis to extract this metric.</span>
              </div>
            )}
          </div>

          {/* Discussion Density Chart Card */}
          <div className="border border-zinc-200 bg-white rounded-lg p-6 space-y-4 shadow-sm hover:border-zinc-300 transition-colors">
            <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
              <h2 className="text-xs font-mono uppercase text-zinc-500 font-bold">
                Discussion Density
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">Review Comments</span>
            </div>
            {report.discussion_density ? (
              <DiscussionChart data={report.discussion_density} />
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-zinc-50 border border-zinc-200 border-dashed rounded font-mono text-xs text-zinc-400 gap-1.5">
                <HelpCircle className="w-5 h-5 text-zinc-300" />
                <span>No discussion data</span>
                <span className="text-[10px] text-zinc-500 max-w-xs">Run a new analysis to extract this metric.</span>
              </div>
            )}
          </div>
        </div>

        {/* Qualitative LLM Summary Section */}
        <div className="border border-zinc-200 bg-white rounded-lg p-6 space-y-4 shadow-sm hover:border-zinc-300 transition-colors">
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-xs font-mono uppercase text-zinc-500 font-bold">
              Reviewer Dynamics & Code Patterns
            </h2>
          </div>
          <div className="font-sans">
            {renderMarkdown(report.llm_summaries)}
          </div>
        </div>

      </div>
    </div>
  );
}

import Link from 'next/link';
import clientPromise from '../../../../lib/mongodb';
import ReportLoader from '../../../../components/ReportLoader';
import { SizeChart, DomainChart, VelocityChart, DiscussionChart, IntentChart, RiskChart } from '../../../../components/ReportChart';
import InvestigatorChat from '../../../../components/InvestigatorChat';
import { ReportContainer, ReportCard } from '../../../../components/ReportLayoutWrapper';
import { 
  GitPullRequest, 
  Calendar, 
  ArrowLeft, 
  Database, 
  Clock, 
  ShieldCheck,
  Maximize2,
  FileCode,
  Gauge,
  MessageSquare,
  Bookmark,
  ShieldAlert,
  FlameKindling,
  HelpCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Lightweight server-side markdown parser (adapted for Gitto's dark theme)
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-3 font-sans">
      {lines.map((line, idx) => {
        const cleanLine = line.trim();
        
        // Headers
        if (cleanLine.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-xs font-mono uppercase tracking-wider font-extrabold text-slate-50 mt-6 mb-2 border-b border-white/10 pb-1.5 flex items-center gap-1.5">
              <FlameKindling className="w-3.5 h-3.5 text-indigo-400" />
              {cleanLine.slice(4)}
            </h3>
          );
        }
        
        // Bullet points
        if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
          const content = cleanLine.slice(2);
          const parts = content.split('**');
          return (
            <li key={idx} className="ml-4 list-disc text-xs text-slate-400 my-1 leading-relaxed">
              {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-100">{part}</strong> : part)}
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
          <p key={idx} className="text-xs text-slate-400 leading-relaxed">
            {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-100">{part}</strong> : part)}
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
      <div className="flex-grow flex items-center justify-center bg-[#0a0a0c] px-6 py-12">
        <div className="w-full max-w-sm border border-white/10 bg-[#141415] rounded-none p-8 text-center space-y-6">
          <div className="inline-flex p-3 rounded-none bg-neutral-900 border border-white/10 text-slate-400">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <h2 className="text-xs font-mono uppercase text-slate-50 font-bold tracking-wider">Connection Failed</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Could not establish a connection to the MongoDB Atlas database cluster.
          </p>
          <Link
            href="/"
            className="inline-flex h-10 px-4 items-center justify-center bg-white hover:bg-neutral-200 text-[#0a0a0c] text-xs font-mono font-bold rounded-none transition-colors"
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

  // 3. Report Screen (Fully styled with Stark dark mode layout)
  return (
    <div className="flex-grow bg-[#0a0a0c] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
          </Link>
          <span className="text-[9px] font-mono text-indigo-400 border border-indigo-500/20 bg-indigo-950/20 px-2 py-0.5 rounded-none flex items-center gap-1.5 uppercase tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cached Report
          </span>
        </div>

        {/* Animation container */}
        <ReportContainer>
          
          {/* Repository info banner */}
          <ReportCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#1a1a1d] border border-white/10 rounded-none text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                  <GitPullRequest className="w-4 h-4 text-indigo-400" />
                </div>
                <h1 className="text-sm font-mono font-extrabold tracking-tight text-slate-50 uppercase">
                  {report.repo_name}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                PR Analytics based on the last 50 merged pull requests.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 sm:self-center">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>ANALYZED: {formatDate(report.analyzed_at)}</span>
            </div>
          </ReportCard>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Test Inclusion Rate Card */}
            <ReportCard className="flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Test Inclusion Rate
                </span>
                <div className="text-2xl font-mono font-bold text-slate-50">
                  {report.test_inclusion_rate != null ? `${report.test_inclusion_rate.toFixed(1)}%` : 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-[#1a1a1d] border border-white/10 rounded-none text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
            </ReportCard>

            {/* Time to First Review Card */}
            <ReportCard className="flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Time-To-First-Review
                </span>
                <div className="text-2xl font-mono font-bold text-slate-50">
                  {report.time_to_first_review != null ? `${report.time_to_first_review.toFixed(1)} hrs` : 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-[#1a1a1d] border border-white/10 rounded-none text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Clock className="w-5 h-5" />
              </div>
            </ReportCard>
          </div>

          {/* Grid Layout for Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sizes Chart Card */}
            <ReportCard className="space-y-4">
              <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                <h2 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  PR Size Tiers
                </h2>
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Lines Changed</span>
              </div>
              <SizeChart data={report.size_tiers} />
            </ReportCard>

            {/* Domains Chart Card */}
            <ReportCard className="space-y-4">
              <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                <h2 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  Codebase Domains
                </h2>
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Affected Scope</span>
              </div>
              <DomainChart data={report.domains} />
            </ReportCard>

            {/* Velocity Chart Card */}
            <ReportCard className="space-y-4">
              <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                <h2 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-orange-400" />
                  Merge Velocity
                </h2>
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Merge Speed</span>
              </div>
              {report.merge_velocity ? (
                <VelocityChart data={report.merge_velocity} />
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-[#0a0a0c] border border-white/10 border-dashed rounded-none font-mono text-xs text-slate-600 gap-1.5">
                  <HelpCircle className="w-5 h-5 text-slate-700" />
                  <span>No velocity data</span>
                </div>
              )}
            </ReportCard>

            {/* Discussion Density Chart Card */}
            <ReportCard className="space-y-4">
              <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                <h2 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-fuchsia-400" />
                  Discussion Density
                </h2>
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Review Comments</span>
              </div>
              {report.discussion_density ? (
                <DiscussionChart data={report.discussion_density} />
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-[#0a0a0c] border border-white/10 border-dashed rounded-none font-mono text-xs text-slate-600 gap-1.5">
                  <HelpCircle className="w-5 h-5 text-slate-700" />
                  <span>No discussion data</span>
                </div>
              )}
            </ReportCard>

            {/* PR Intent Chart Card */}
            <ReportCard className="space-y-4">
              <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                <h2 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                  PR Intent
                </h2>
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Changes Category</span>
              </div>
              {report.pr_intent ? (
                <IntentChart data={report.pr_intent} />
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-[#0a0a0c] border border-white/10 border-dashed rounded-none font-mono text-xs text-slate-600 gap-1.5">
                  <HelpCircle className="w-5 h-5 text-slate-700" />
                  <span>No intent data</span>
                </div>
              )}
            </ReportCard>

            {/* Risk Score Chart Card */}
            <ReportCard className="space-y-4">
              <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                <h2 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Risk Score
                </h2>
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Safety Rating</span>
              </div>
              {report.risk_score ? (
                <RiskChart data={report.risk_score} />
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-[#0a0a0c] border border-white/10 border-dashed rounded-none font-mono text-xs text-slate-600 gap-1.5">
                  <HelpCircle className="w-5 h-5 text-slate-700" />
                  <span>No risk data</span>
                </div>
              )}
            </ReportCard>

          </div>

          {/* Qualitative LLM Summary Section */}
          <ReportCard className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold">
                Reviewer Dynamics & Code Patterns
              </h2>
            </div>
            <div>
              {renderMarkdown(report.llm_summaries)}
            </div>
          </ReportCard>

          {/* Interactive Chat Section */}
          <InvestigatorChat owner={owner} repo={repo} />

        </ReportContainer>

      </div>
    </div>
  );
}

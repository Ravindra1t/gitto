import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { owner, repo } = resolvedParams;
  const repoId = `${owner}/${repo}`.toLowerCase();

  try {
    const client = await clientPromise;
    const db = client.db('github_pr_analyzer');

    // 1. Check if the final report is already cached
    const report = await db.collection('PR_Reports').findOne({ _id: repoId }, { projection: { _id: 1 } });
    if (report) {
      return NextResponse.json({ status: 'SUCCESS' });
    }

    // 2. Check the job status in the queue
    const job = await db.collection('Job_Queue').findOne({ _id: repoId });
    if (job) {
      return NextResponse.json({ status: job.status, error: job.error });
    }

    // 3. Job not found in queue or cache
    return NextResponse.json({ status: 'NOT_FOUND' });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json({ status: 'ERROR', error: error.message }, { status: 500 });
  }
}

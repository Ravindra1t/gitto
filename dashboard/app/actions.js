'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import clientPromise from '../lib/mongodb';

// Helper function to get or create a persistent user ID for session locks
async function getOrCreateUserId() {
  const cookieStore = await cookies();
  let userId = cookieStore.get('userId')?.value;
  if (!userId) {
    userId = crypto.randomUUID();
    cookieStore.set('userId', userId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }
  return userId;
}

// Helper function to extract owner and repo from various inputs
function parseRepoName(input) {
  if (!input) return null;
  const cleanInput = input.trim();

  // Try parsing as a full GitHub URL
  // Matches: github.com/owner/repo, https://github.com/owner/repo, etc.
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i;
  const urlMatch = cleanInput.match(urlRegex);
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2].replace(/\.git$/i, '') // strip optional .git
    };
  }

  // Try parsing as 'owner/repo' string
  const pathRegex = /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/;
  const pathMatch = cleanInput.match(pathRegex);
  if (pathMatch) {
    return {
      owner: pathMatch[1],
      repo: pathMatch[2]
    };
  }

  return null;
}

export async function analyzeRepository(formData) {
  const repoInput = formData.get('repository');
  const parsed = parseRepoName(repoInput);

  if (!parsed) {
    // If invalid input, redirect to home page with an error query param
    redirect('/?error=invalid_repo');
  }

  const { owner, repo } = parsed;
  const repoId = `${owner}/${repo}`.toLowerCase();

  try {
    const client = await clientPromise;
    const db = client.db('github_pr_analyzer');
    
    // Check if the analysis report already exists in the cache
    const existingReport = await db.collection('PR_Reports').findOne({ _id: repoId });

    if (existingReport) {
      // CACHE HIT: Redirect to the report page
      redirect(`/report/${owner}/${repo}`);
    }

    // Get current user's session ID
    const userId = await getOrCreateUserId();

    // Check if this user already has an active job in progress (PENDING or PROCESSING)
    const activeUserJob = await db.collection('Job_Queue').findOne({
      userId: userId,
      status: { $in: ['PENDING', 'PROCESSING'] }
    });

    if (activeUserJob) {
      // If the active job is for a DIFFERENT repository, block the user
      if (activeUserJob._id !== repoId) {
        redirect('/?error=active_job_exists');
      }
    }

    // Check if the job already exists in the queue and what its status is
    const existingJob = await db.collection('Job_Queue').findOne({ _id: repoId });

    if (!existingJob || existingJob.status === 'FAILED' || existingJob.status === 'CANCELLED') {
      // CACHE MISS or FAILED job: Add/Reset job status to PENDING
      await db.collection('Job_Queue').updateOne(
        { _id: repoId },
        {
          $set: {
            _id: repoId,
            repo_name: `${owner}/${repo}`, // Preserve original casing for the API call
            status: 'PENDING',
            userId: userId, // Bind the job lock to this user
            created_at: new Date(),
            error: null,
            failed_at: null
          }
        },
        { upsert: true }
      );
    }

    // Redirect to the report page which will display a loading/in-progress state
    redirect(`/report/${owner}/${repo}`);

  } catch (error) {
    // If the redirect is thrown by Next.js, we must let it bubble up
    if (error.digest && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Database error in analyzeRepository Server Action:', error);
    redirect('/?error=db_error');
  }
}

export async function cancelAnalysis(formData) {
  const owner = formData.get('owner');
  const repo = formData.get('repo');
  
  if (!owner || !repo) {
    redirect('/');
  }

  const repoId = `${owner}/${repo}`.toLowerCase();

  try {
    const client = await clientPromise;
    const db = client.db('github_pr_analyzer');
    const userId = await getOrCreateUserId();
    
    // Set status to CANCELLED to signal the worker to terminate, only if it belongs to this user
    await db.collection('Job_Queue').updateOne(
      { _id: repoId, userId: userId },
      { $set: { status: 'CANCELLED' } }
    );
    console.log(`[CANCELLED] Job for '${repoId}' (User: ${userId}) marked as CANCELLED to signal worker.`);
  } catch (error) {
    console.error('Error in cancelAnalysis Server Action:', error);
  }

  redirect('/');
}


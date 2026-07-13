'use server';

import { redirect } from 'next/navigation';
import clientPromise from '../lib/mongodb';

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

    // Check if the job already exists in the queue and what its status is
    const existingJob = await db.collection('Job_Queue').findOne({ _id: repoId });

    if (!existingJob || existingJob.status === 'FAILED') {
      // CACHE MISS or FAILED job: Add/Reset job status to PENDING
      await db.collection('Job_Queue').updateOne(
        { _id: repoId },
        {
          $set: {
            _id: repoId,
            repo_name: `${owner}/${repo}`, // Preserve original casing for the API call
            status: 'PENDING',
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
    
    // Delete the job from the queue
    await db.collection('Job_Queue').deleteOne({ _id: repoId });
    console.log(`[CANCELLED] Job for '${repoId}' kicked off the queue.`);
  } catch (error) {
    console.error('Error in cancelAnalysis Server Action:', error);
  }

  redirect('/');
}


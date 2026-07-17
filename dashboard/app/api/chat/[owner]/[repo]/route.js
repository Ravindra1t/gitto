import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';

export async function GET(request, { params }) {
  const { owner, repo } = await params;
  const repoId = `${owner}/${repo}`.toLowerCase();

  try {
    const client = await clientPromise;
    const db = client.db('github_pr_analyzer');
    const chatSession = await db.collection('Chat_Sessions').findOne({ _id: repoId });

    if (!chatSession) {
      return NextResponse.json({ messages: [], status: 'COMPLETED' });
    }

    // Sanitize the messages array by mapping over it to ensure ONLY role and content are sent
    const sanitizedMessages = (chatSession.messages || []).map(({ role, content }) => ({ role, content }));

    return NextResponse.json({
      messages: sanitizedMessages,
      status: chatSession.status || 'COMPLETED',
      error: chatSession.error || null
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { owner, repo } = await params;
  const repoId = `${owner}/${repo}`.toLowerCase();

  try {
    const body = await request.json();
    const { message, messages } = body;

    const client = await clientPromise;
    const db = client.db('github_pr_analyzer');

    let sanitizedInputMessages = [];
    if (messages && Array.isArray(messages)) {
      // Map over the incoming array to ensure ONLY role and content are extracted
      sanitizedInputMessages = messages.map(({ role, content }) => ({ role, content }));
    } else if (message && typeof message === 'string') {
      sanitizedInputMessages = [{ role: 'user', content: message }];
    } else {
      return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
    }

    // Atomic update: push the sanitized messages and transition status to PENDING
    const result = await db.collection('Chat_Sessions').findOneAndUpdate(
      { _id: repoId },
      {
        $push: {
          messages: { $each: sanitizedInputMessages }
        },
        $set: {
          status: 'PENDING',
          updated_at: new Date(),
          error: null
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    // Synchronous poll: Wait for the Python backend worker to process the session via MongoDB queue
    const startTime = Date.now();
    const timeout = 35000; // 35 seconds max wait time
    let finalSession = result;

    while (Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentSession = await db.collection('Chat_Sessions').findOne({ _id: repoId });
      if (currentSession) {
        finalSession = currentSession;
        if (currentSession.status === 'COMPLETED' || currentSession.status === 'FAILED') {
          break;
        }
      }
    }

    if (finalSession.status === 'FAILED') {
      return NextResponse.json({
        error: finalSession.error || 'Python backend failed to process chat request',
        status: 'FAILED'
      }, { status: 500 });
    }

    // Sanitize the returned messages array by mapping over it to ensure ONLY role and content are sent
    const returnedMessages = (finalSession.messages || []).map(({ role, content }) => ({ role, content }));

    return NextResponse.json({
      messages: returnedMessages,
      status: finalSession.status || 'PENDING'
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}

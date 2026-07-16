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

    return NextResponse.json({
      messages: chatSession.messages || [],
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
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('github_pr_analyzer');

    // Atomic update: push the user message and transition status to PENDING
    const result = await db.collection('Chat_Sessions').findOneAndUpdate(
      { _id: repoId },
      {
        $push: {
          messages: {
            role: 'user',
            content: message,
            timestamp: new Date()
          }
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

    return NextResponse.json({
      messages: result.messages || [],
      status: result.status || 'PENDING'
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}

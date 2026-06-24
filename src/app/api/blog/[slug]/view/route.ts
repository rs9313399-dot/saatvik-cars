import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/blog/[slug]/view — Public endpoint.
 * Increments the view counter on a published blog post.
 * No auth required — view tracking is anonymous & public.
 *
 * Response:
 *   200 { views: number }  — on success
 *   404 { error: string }  — post not found
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Slug is required.' },
        { status: 400 }
      );
    }

    const existing = await db.blogPost.findUnique({
      where: { slug },
      select: { id: true, views: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found.' },
        { status: 404 }
      );
    }

    const updated = await db.blogPost.update({
      where: { id: existing.id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return NextResponse.json({ views: updated.views }, { status: 200 });
  } catch (error) {
    console.error('Blog view increment error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

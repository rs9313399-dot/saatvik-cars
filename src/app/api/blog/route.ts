import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ALLOWED_CATEGORIES = new Set([
  'Guides',
  'Maintenance',
  'News',
  'Reviews',
  'Updates',
]);

/**
 * GET /api/blog — Public endpoint.
 * Returns published blog posts, newest first.
 *
 * Query params:
 *  - category?: one of Guides, Maintenance, News, Reviews, Updates
 *  - limit?:    number of posts to return (default 12, max 50)
 *
 * Response: { posts: Array<BlogPostPublic>, count: number }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category')?.trim() || '';
    const limitRaw = searchParams.get('limit')?.trim() || '';

    // Parse limit safely — default 12, clamp 1..50
    let limit = 12;
    if (limitRaw) {
      const parsed = Number.parseInt(limitRaw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 50);
      }
    }

    // Build where clause
    const where: { published?: boolean; category?: string } = { published: true };
    if (category && ALLOWED_CATEGORIES.has(category)) {
      where.category = category;
    }

    const posts = await db.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        body: true,
        category: true,
        tags: true,
        author: true,
        publishedAt: true,
        views: true,
      },
    });

    return NextResponse.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Blog list error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

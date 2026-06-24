import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seedTestimonials } from '@/lib/seed-testimonials';

// Ensure seed testimonials are inserted once per server process (idempotent).
let seedPromise: Promise<void> | null = null;
function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seedTestimonials().catch((err) => {
      // Allow a retry on the next request if seeding failed.
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

// GET /api/testimonials — public list of approved testimonials, newest first
export async function GET() {
  try {
    // Best-effort seed; ignore failures so the public endpoint still works.
    await ensureSeeded().catch(() => {});

    const testimonials = await db.testimonial.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Testimonials list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/testimonials — public submission, creates with approved: false
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const bodyText = typeof body.body === 'string' ? body.body.trim() : '';

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    if (!bodyText) {
      return NextResponse.json(
        { error: 'Review body is required' },
        { status: 400 }
      );
    }

    // Parse + clamp rating to 1-5
    let rating = 5;
    if (body.rating !== undefined && body.rating !== null) {
      const parsed = Number(body.rating);
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 5) {
        rating = Math.round(parsed);
      }
    }

    const location =
      typeof body.location === 'string' ? body.location.trim().slice(0, 120) : '';
    const carPurchased =
      typeof body.carPurchased === 'string'
        ? body.carPurchased.trim().slice(0, 200)
        : '';
    const title =
      typeof body.title === 'string' ? body.title.trim().slice(0, 200) : '';

    await db.testimonial.create({
      data: {
        name: name.slice(0, 120),
        location,
        rating,
        carPurchased,
        title,
        body: bodyText.slice(0, 4000),
        approved: false,
      },
    });

    return NextResponse.json(
      { message: 'Thank you! Your review will appear after moderation.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Testimonial create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

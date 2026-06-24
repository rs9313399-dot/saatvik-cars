import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Admin auth: check admin_token cookie (and admin-token alias) against DB.
// Returns the admin record or null.
async function getAdminFromRequest(request: NextRequest) {
  // 1. Bearer token in Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const admin = await db.admin.findFirst({ where: { token } });
      if (admin) return admin;
    }
  }

  // 2. Cookie-based auth (project uses admin_token; also accept admin-token alias)
  const token =
    request.cookies.get('admin_token')?.value ||
    request.cookies.get('admin-token')?.value;
  if (!token) return null;
  return db.admin.findFirst({ where: { token } });
}

// GET /api/testimonials/admin — list ALL testimonials (incl. unapproved), newest first
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Admin testimonials list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/testimonials/admin — approve / unapprove a testimonial
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const id = typeof body.id === 'string' ? body.id.trim() : '';
    if (!id) {
      return NextResponse.json(
        { error: 'Testimonial id is required' },
        { status: 400 }
      );
    }

    const approved = Boolean(body.approved);

    const updated = await db.testimonial.update({
      where: { id },
      data: { approved },
    });

    return NextResponse.json({ testimonial: updated });
  } catch (error) {
    console.error('Testimonial update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/testimonials/admin — permanently delete a testimonial
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const id = typeof body.id === 'string' ? body.id.trim() : '';
    if (!id) {
      return NextResponse.json(
        { error: 'Testimonial id is required' },
        { status: 400 }
      );
    }

    await db.testimonial.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Testimonial delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

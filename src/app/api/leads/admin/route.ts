import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth';

const ALLOWED_STATUSES = new Set(['new', 'contacted', 'closed']);

/**
 * Verify admin via the shared admin auth helper.
 */
async function requireAdmin(request: NextRequest): Promise<boolean> {
  return checkAuth(request);
}

/**
 * PATCH /api/leads/admin — Update a lead's status.
 * Body: { id, status: 'new' | 'contacted' | 'closed' }
 */
export async function PATCH(request: NextRequest) {
  try {
    const authenticated = await requireAdmin(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { id, status } = body as Record<string, unknown>;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { error: 'Lead id is required.' },
        { status: 400 }
      );
    }

    if (!status || typeof status !== 'string' || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: new, contacted, closed.' },
        { status: 400 }
      );
    }

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const updated = await db.lead.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ lead: updated });
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/admin — Delete a lead.
 * Body: { id }
 */
export async function DELETE(request: NextRequest) {
  try {
    const authenticated = await requireAdmin(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { id } = body as Record<string, unknown>;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { error: 'Lead id is required.' },
        { status: 400 }
      );
    }

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    await db.lead.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

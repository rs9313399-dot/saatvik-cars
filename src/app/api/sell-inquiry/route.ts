import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { estimateCarValue } from '@/lib/valuation';
import { checkAuth } from '@/lib/auth';

const ALLOWED_CONDITIONS = new Set(['Excellent', 'Good', 'Fair', 'Poor']);
const ALLOWED_STATUSES = new Set(['new', 'reviewed', 'offered', 'closed']);

/** Indian 10-digit mobile (starts 6–9). */
const PHONE_RE = /^[6-9]\d{9}$/;

/**
 * POST /api/sell-inquiry — Public customer endpoint.
 * Creates a sell/trade valuation request from a customer.
 * Computes estimatedPrice server-side using the SAME algorithm
 * the client uses (shared via @/lib/valuation).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const {
      customerName,
      phone,
      email = '',
      brand,
      model,
      year,
      fuelType = '',
      transmission = '',
      kmDriven,
      ownerType = '',
      condition = 'Good',
      photos = [],
      inspectionDate = '',
      inspectionSlot = '',
      message = '',
    } = body as Record<string, unknown>;

    // ── Required field validation ──
    if (
      !customerName ||
      typeof customerName !== 'string' ||
      customerName.trim().length < 2
    ) {
      return NextResponse.json(
        { error: 'Please enter your name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required.' },
        { status: 400 }
      );
    }
    const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (!PHONE_RE.test(normalizedPhone)) {
      return NextResponse.json(
        {
          error:
            'Please enter a valid 10-digit Indian mobile number (starts with 6–9).',
        },
        { status: 400 }
      );
    }

    if (!brand || typeof brand !== 'string' || !brand.trim()) {
      return NextResponse.json(
        { error: 'Please select a car brand.' },
        { status: 400 }
      );
    }
    if (!model || typeof model !== 'string' || !model.trim()) {
      return NextResponse.json(
        { error: 'Please enter the car model.' },
        { status: 400 }
      );
    }

    const yearNum = Number(year);
    if (
      !Number.isFinite(yearNum) ||
      yearNum < 1990 ||
      yearNum > new Date().getFullYear() + 1
    ) {
      return NextResponse.json(
        { error: 'Please select a valid year.' },
        { status: 400 }
      );
    }

    const kmNum = Number(kmDriven);
    if (!Number.isFinite(kmNum) || kmNum < 0 || kmNum > 10_00_000) {
      return NextResponse.json(
        { error: 'Please enter a valid km driven (0–10,00,000).' },
        { status: 400 }
      );
    }

    const normalizedCondition = String(condition).trim();
    if (!ALLOWED_CONDITIONS.has(normalizedCondition)) {
      return NextResponse.json(
        { error: 'Please select the car condition.' },
        { status: 400 }
      );
    }

    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';

    // Photos come in as a JSON-friendly list of filenames
    let photosJson = '[]';
    if (Array.isArray(photos)) {
      const names = photos
        .map((p) => (typeof p === 'string' ? p : String(p ?? '')))
        .filter(Boolean)
        .slice(0, 10);
      photosJson = JSON.stringify(names);
    } else if (typeof photos === 'string' && photos.trim()) {
      photosJson = photos;
    }

    // ── Server-side valuation (source of truth) ──
    const estimatedPrice = estimateCarValue({
      brand: String(brand).trim(),
      model: String(model).trim(),
      year: yearNum,
      fuelType: typeof fuelType === 'string' ? fuelType.trim() : '',
      kmDriven: kmNum,
      ownerType: typeof ownerType === 'string' ? ownerType.trim() : '',
      condition: normalizedCondition,
    });

    const created = await db.sellInquiry.create({
      data: {
        customerName: String(customerName).trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
        brand: String(brand).trim(),
        model: String(model).trim(),
        year: yearNum,
        fuelType: typeof fuelType === 'string' ? fuelType.trim() : '',
        transmission:
          typeof transmission === 'string' ? transmission.trim() : '',
        kmDriven: kmNum,
        ownerType: typeof ownerType === 'string' ? ownerType.trim() : '',
        condition: normalizedCondition,
        estimatedPrice,
        photos: photosJson,
        inspectionDate:
          typeof inspectionDate === 'string' ? inspectionDate.trim() : '',
        inspectionSlot:
          typeof inspectionSlot === 'string' ? inspectionSlot.trim() : '',
        message: typeof message === 'string' ? message.trim() : '',
        status: 'new',
      },
    });

    return NextResponse.json(
      {
        message:
          'Valuation request received! Our team will call you within 24 hours with a final offer.',
        inquiry: created,
        estimatedPrice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sell inquiry creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sell-inquiry — Admin-only. Returns all sell inquiries,
 * newest first. Supports optional `?status=` filter.
 */
export async function GET(request: NextRequest) {
  try {
    const authenticated = await checkAuth(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status')?.trim();

    const where: { status?: string } = {};
    if (status && ALLOWED_STATUSES.has(status)) {
      where.status = status;
    }

    const inquiries = await db.sellInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      inquiries,
      count: inquiries.length,
    });
  } catch (error) {
    console.error('Sell inquiry list error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

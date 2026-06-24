import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth';

// GET /api/cars/[id] - Get single car by ID or slug, increment views
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by ID first, then by slug
    let car = await db.car.findUnique({ where: { id } });

    if (!car) {
      // Try finding by slug
      car = await db.car.findFirst({ where: { slug: id } });
    }

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Increment views
    await db.car.update({
      where: { id: car.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      car: {
        ...car,
        images: car.images ? JSON.parse(car.images) : [],
        views: car.views + 1,
      },
    });
  } catch (error) {
    console.error('Car detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/cars/[id] - Update car (requires auth)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await checkAuth(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingCar = await db.car.findUnique({ where: { id } });
    if (!existingCar) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      'name', 'brand', 'model', 'year', 'price', 'fuelType',
      'transmission', 'kmDriven', 'ownerType', 'location',
      'description', 'tags', 'contactPhone', 'carNumber', 'color', 'insurance', 'rto', 'sunroof', 'finance', 'bodyType', 'images', 'active',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'year' || field === 'price' || field === 'kmDriven') {
          updateData[field] = parseInt(String(body[field]), 10);
        } else if (field === 'images') {
          updateData[field] = JSON.stringify(body[field]);
        } else if (field === 'active') {
          updateData[field] = Boolean(body[field]);
        } else if (field === 'tags') {
          // Handle tags as array or string
          if (Array.isArray(body[field])) {
            updateData[field] = body[field].join(',');
          } else {
            updateData[field] = body[field];
          }
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Regenerate slug if name changed
    if (body.name && body.name !== existingCar.name) {
      const baseSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      let slug = baseSlug;
      let slugCounter = 1;

      while (await db.car.findFirst({ where: { slug, id: { not: id } } })) {
        slug = `${baseSlug}-${slugCounter}`;
        slugCounter++;
      }

      updateData.slug = slug;
    }

    const car = await db.car.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      car: {
        ...car,
        images: car.images ? JSON.parse(car.images) : [],
      },
    });
  } catch (error) {
    console.error('Car update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cars/[id] - Delete car (requires auth)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await checkAuth(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existingCar = await db.car.findUnique({ where: { id } });
    if (!existingCar) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    await db.car.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Car deleted' });
  } catch (error) {
    console.error('Car delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/cars/[id] - Toggle active status (requires auth)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await checkAuth(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.active === undefined || body.active === null) {
      return NextResponse.json(
        { error: 'active field is required' },
        { status: 400 }
      );
    }

    const existingCar = await db.car.findUnique({ where: { id } });
    if (!existingCar) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const car = await db.car.update({
      where: { id },
      data: { active: Boolean(body.active) },
    });

    return NextResponse.json({
      car: {
        ...car,
        images: car.images ? JSON.parse(car.images) : [],
      },
    });
  } catch (error) {
    console.error('Car toggle active error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

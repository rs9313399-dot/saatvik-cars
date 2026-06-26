import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth';

// GET /api/cars - List cars with filtering and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const brand = searchParams.get('brand');
    const fuelType = searchParams.get('fuelType');
    const transmission = searchParams.get('transmission');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    const sort = searchParams.get('sort');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const all = searchParams.get('all');

    // Build where clause
    const where: Record<string, unknown> = {};

    // Only show active cars unless admin requests all
    if (all === 'true') {
      const authenticated = await checkAuth(request);
      if (!authenticated) {
        where.active = true;
      }
      // If authenticated, show all cars (no active filter)
    } else {
      where.active = true;
    }

    if (brand) {
      where.brand = brand;
    }

    if (fuelType) {
      where.fuelType = fuelType;
    }

    if (transmission) {
      where.transmission = transmission;
    }

    if (minPrice || maxPrice) {
 	    const priceFilter: { gte?: number; lte?: number } = {};

    if (minPrice) {
         priceFilter.gte = parseInt(minPrice, 10);
     }

     if (maxPrice) {
    	priceFilter.lte = parseInt(maxPrice, 10);
     }

    where.price = priceFilter;
   }

   if (minYear || maxYear) {
  const yearFilter: { gte?: number; lte?: number } = {};

  if (minYear) {
    yearFilter.gte = parseInt(minYear, 10);
  }

  if (maxYear) {
    yearFilter.lte = parseInt(maxYear, 10);
  }

  where.year = yearFilter;
}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
      ];
    }

    if (featured === 'true') {
      where.tags = { contains: 'featured' };
    }

    // Build order by
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const cars = await db.car.findMany({
      where,
      orderBy,
    });

    // Get total active cars count (unfiltered) for "Showing X of Y"
    const totalActive = await db.car.count({ where: { active: true } });

    // Parse images JSON string for each car
    const parsedCars = cars.map((car) => ({
      ...car,
      images: car.images ? JSON.parse(car.images) : [],
    }));

    return NextResponse.json({ cars: parsedCars, total: parsedCars.length, totalActive });
  } catch (error) {
    console.error('Cars list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cars - Create a new car
export async function POST(request: NextRequest) {
  try {
    const authenticated = await checkAuth(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      brand,
      model,
      year,
      price,
      fuelType,
      transmission,
      kmDriven,
      ownerType,
      location,
      description,
      tags,
      contactPhone,
      carNumber,
      color,
      insurance,
      rto,
      sunroof,
      finance,
      bodyType,
      images,
      active,
    } = body;

    // Validate required fields
    if (!name || !brand || !model || !year || !price || !fuelType || !transmission || !kmDriven || !ownerType || !location || !description || !contactPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let slugCounter = 1;

    while (await db.car.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    const car = await db.car.create({
      data: {
        name,
        slug,
        brand,
        model,
        year: parseInt(String(year), 10),
        price: parseInt(String(price), 10),
        fuelType,
        transmission,
        kmDriven: parseInt(String(kmDriven), 10),
        ownerType,
        location,
        description,
        tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
        contactPhone,
        carNumber: carNumber || '',
        color: color || '',
        insurance: insurance || '',
        rto: rto || '',
        sunroof: sunroof || 'No',
        finance: finance || '',
        bodyType: bodyType || '',
        images: images ? JSON.stringify(images) : JSON.stringify([]),
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(
      {
        car: {
          ...car,
          images: car.images ? JSON.parse(car.images) : [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Car create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

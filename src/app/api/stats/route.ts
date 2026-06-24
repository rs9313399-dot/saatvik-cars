import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth';

// GET /api/stats - Return basic stats (requires auth)
export async function GET(request: NextRequest) {
  try {
    const authenticated = await checkAuth(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalCars, activeCars, viewsResult, callClicksResult, whatsappClicksResult] =
      await Promise.all([
        db.car.count(),
        db.car.count({ where: { active: true } }),
        db.car.aggregate({ _sum: { views: true } }),
        db.car.aggregate({ _sum: { callClicks: true } }),
        db.car.aggregate({ _sum: { whatsappClicks: true } }),
      ]);

    const totalViews = viewsResult._sum.views || 0;
    const totalCallClicks = callClicksResult._sum.callClicks || 0;
    const totalWhatsappClicks = whatsappClicksResult._sum.whatsappClicks || 0;

    // Top 5 most viewed cars
    const topViewedCars = await db.car.findMany({
      where: { active: true },
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        brand: true,
        model: true,
        price: true,
        views: true,
        callClicks: true,
        whatsappClicks: true,
        images: true,
      },
    });

    const parsedTopCars = topViewedCars.map((car) => ({
      ...car,
      images: car.images ? JSON.parse(car.images) : [],
    }));

    return NextResponse.json({
      totalCars,
      activeCars,
      inactiveCars: totalCars - activeCars,
      totalViews,
      totalCallClicks,
      totalWhatsappClicks,
      topViewedCars: parsedTopCars,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

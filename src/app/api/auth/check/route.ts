import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        const admin = await db.admin.findFirst({ where: { token } });
        if (admin) {
          return NextResponse.json({
            authenticated: true,
            admin: { id: admin.id, username: admin.username },
          });
        }
      }
    }

    // 2. Fallback to cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const admin = await db.admin.findFirst({ where: { token } });

    if (!admin) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      admin: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}

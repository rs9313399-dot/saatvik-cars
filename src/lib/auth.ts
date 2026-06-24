import { cookies } from 'next/headers';
import { db } from '@/lib/db';

/**
 * Check if the request is authenticated.
 * Supports both cookie-based and Bearer token auth.
 * If the Bearer token is invalid/stale, falls back to the cookie.
 */
export async function checkAuth(request?: Request): Promise<boolean> {
  // 1. Check Authorization header first (Bearer token)
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        const admin = await db.admin.findFirst({ where: { token } });
        if (admin) return true;
        // Bearer token was present but invalid — fall through to cookie check
      }
    }
  }

  // 2. Fallback to cookie-based auth
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return false;
    const admin = await db.admin.findFirst({ where: { token } });
    return !!admin;
  } catch {
    return false;
  }
}

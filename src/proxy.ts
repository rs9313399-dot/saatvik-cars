import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString('base64');
  const isDevelopment = process.env.NODE_ENV === 'development';
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', contentSecurityPolicy);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

/**
 * MedTrustX — Next.js Edge Middleware
 * Server-side route protection: redirects unauthenticated users to /login.
 * Runs on the edge (before page renders) for zero-latency auth enforcement.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/access-denied', '/api/v1/iam/auth', '/_next', '/favicon', '/icons'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Only protect /dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Check for auth token in cookies or Authorization header
  const token =
    request.cookies.get('mt-auth')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  // If token exists, allow through (client-side will verify expiry)
  if (token) {
    return NextResponse.next();
  }

  // Redirect to login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/v1/protected/:path*'],
};

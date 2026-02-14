import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Super Admin routes
  if (pathname.startsWith('/superadmin')) {
    // Allow login page
    if (pathname === '/superadmin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('superadmin_token')?.value;

    console.log('[Middleware] Super Admin Route:', pathname);
    console.log('[Middleware] Token exists:', !!token);

    if (!token) {
      console.log('[Middleware] No token found, redirecting to login');
      return NextResponse.redirect(new URL('/superadmin/login', request.url));
    }

    try {
      const payload = await verifyJWT(token);
      console.log('[Middleware] Token verified, role:', payload.role);
      if (payload.role !== 'superadmin') {
        console.log('[Middleware] Invalid role, redirecting to login');
        return NextResponse.redirect(new URL('/superadmin/login', request.url));
      }
    } catch (error) {
      console.log('[Middleware] Token verification failed:', error);
      return NextResponse.redirect(new URL('/superadmin/login', request.url));
    }
  }

  // Client routes
  if (pathname.startsWith('/client')) {
    // Allow login page
    if (pathname === '/client/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('client_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/client/login', request.url));
    }

    try {
      const payload = await verifyJWT(token);
      if (payload.role !== 'client') {
        return NextResponse.redirect(new URL('/client/login', request.url));
      }

      // Inject tenant_id into headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-tenant-id', payload.tenantId || '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.redirect(new URL('/client/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/superadmin/:path*', '/client/:path*'],
};

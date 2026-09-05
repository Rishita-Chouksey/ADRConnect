import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Static assets and API routes don't block
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/favicon.ico') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'adrconnect_secret_key_2026',
  });

  const isAuthenticated = !!token;
  const userRole = (token?.role as string) || null;

  // Public route: /login
  if (path === '/login') {
    if (isAuthenticated && userRole) {
      if (userRole === 'nurse') return NextResponse.redirect(new URL('/nurse', req.url));
      if (userRole === 'adr_head') return NextResponse.redirect(new URL('/adr-head', req.url));
      if (userRole === 'admin') return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // Root path / redirects based on role or to /login
  if (path === '/') {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login', req.url));
    if (userRole === 'nurse') return NextResponse.redirect(new URL('/nurse', req.url));
    if (userRole === 'adr_head') return NextResponse.redirect(new URL('/adr-head', req.url));
    if (userRole === 'admin') return NextResponse.redirect(new URL('/admin', req.url));
  }

  // Role Protection Guards
  if (path.startsWith('/nurse')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login', req.url));
    if (userRole !== 'nurse') {
      const redirectUrl = userRole === 'adr_head' ? '/adr-head' : userRole === 'admin' ? '/admin' : '/login';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }

  if (path.startsWith('/adr-head')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login', req.url));
    if (userRole !== 'adr_head') {
      const redirectUrl = userRole === 'nurse' ? '/nurse' : userRole === 'admin' ? '/admin' : '/login';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }

  if (path.startsWith('/admin')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login', req.url));
    if (userRole !== 'admin') {
      const redirectUrl = userRole === 'nurse' ? '/nurse' : userRole === 'adr_head' ? '/adr-head' : '/login';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

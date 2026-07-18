import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If the user does not have the adminAuth cookie, and they are trying to access a protected route
  const hasAdminCookie = request.cookies.has('adminAuth');
  const isLoginPage = request.nextUrl.pathname === '/';
  
  if (!hasAdminCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (hasAdminCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|.*\\..*).*)',
  ],
};

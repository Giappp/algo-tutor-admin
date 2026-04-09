import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const accessToken = request.cookies.get('access-token')?.value;
    console.log("Access Token: " + accessToken);
    const { pathname } = request.nextUrl;

    const isPublicPath = pathname === '/login' || pathname === '/register';

    if (!accessToken && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (accessToken && isPublicPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
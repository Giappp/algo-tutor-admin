import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Lấy token từ cookie (HttpOnly cookie vẫn được gửi lên Middleware)
    const refreshToken = request.cookies.get('refresh-token')?.value; // Thay bằng tên cookie của bạn
    const { pathname } = request.nextUrl;

    // 2. Định nghĩa các route công khai (không cần login)
    const isPublicPath = pathname === '/login' || pathname === '/register';

    // 3. Logic điều hướng
    // Nếu chưa đăng nhập và cố tình vào trang bảo mật
    if (!refreshToken && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (refreshToken && isPublicPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url)); // hoặc trang chủ
    }

    return NextResponse.next();
}

// 4. Cấu hình các route mà Middleware sẽ chạy qua
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
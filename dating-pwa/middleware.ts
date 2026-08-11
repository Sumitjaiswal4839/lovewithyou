import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get("admin_session")?.value;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminSession || !jwtSecret) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      // Verify JWT securely
      const secret = new TextEncoder().encode(jwtSecret);
      await jwtVerify(adminSession, secret);
      return NextResponse.next();
    } catch (error) {
      // Token invalid or expired
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };

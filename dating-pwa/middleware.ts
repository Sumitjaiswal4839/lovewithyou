import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow the base /admin page to load so the login form can be seen.
  // Only protect sub-routes like /admin/dashboard or /admin/users
  if (path.startsWith("/admin/") && path !== "/admin") {
    const adminSession = request.cookies.get("admin_session")?.value;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminSession || !jwtSecret) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    try {
      const secret = new TextEncoder().encode(jwtSecret);
      await jwtVerify(adminSession, secret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = { 
  matcher: ["/admin/:path*"] 
};

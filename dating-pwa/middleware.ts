import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get("admin_session")?.value;
    const adminSecret = process.env.ADMIN_SECRET_KEY;

    // Secure server-side check
    if (!adminSession || adminSession !== adminSecret) {
      // Redirect unauthorized users back to the home page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };

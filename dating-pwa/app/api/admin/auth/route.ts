import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// Simple In-Memory Rate Limiter (Lockout after 5 failed attempts for 5 minutes)
const rateLimitMap = new Map<string, { count: number; lockoutUntil: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
  const now = Date.now();
  const rateData = rateLimitMap.get(ip) || { count: 0, lockoutUntil: 0 };

  // Check Lockout
  if (rateData.lockoutUntil > now) {
    const remainingMins = Math.ceil((rateData.lockoutUntil - now) / 60000);
    return NextResponse.json({ error: `Too many attempts. Try again in ${remainingMins} minutes.` }, { status: 429 });
  }

  try {
    const { username, password } = await req.json();

    const masterHash = process.env.MASTER_PASSWORD_HASH?.replace(/_/g, '$');
    const jwtSecret = process.env.JWT_SECRET;

    if (!masterHash || !jwtSecret) {
      return NextResponse.json({ error: "Server configuration missing." }, { status: 500 });
    }

    let role = "";
    let isAuthorized = false;

    // Dual-Lock Security System
    if (!username || username.trim() === "") {
      // MASTER ADMIN PATH: Username is empty, only check master password
      isAuthorized = await bcrypt.compare(password, masterHash);
      if (isAuthorized) role = "master_admin";
    } else {
      // SUB-ADMIN PATH: Username is provided
      // Verify against Go backend database
      try {
        const isProd = process.env.NODE_ENV === "production";
        const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || (isProd ? "https://lovewithyou.onrender.com" : "http://localhost:8080")).replace(/\/+$/, "");
        
        const verifyRes = await fetch(`${backendUrl}/api/v1/admin/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            isAuthorized = true;
            role = "sub_admin";
          }
        } else {
          // Dummy bcrypt to prevent timing attacks
          await bcrypt.compare(password, masterHash);
        }
      } catch (err) {
        // Backend might be down, fallback to dummy
        await bcrypt.compare(password, masterHash);
      }
    }

    if (!isAuthorized) {
      // Handle Failed Attempt
      rateData.count += 1;
      if (rateData.count >= 5) {
        rateData.lockoutUntil = now + 5 * 60 * 1000; // Lock for 5 mins
      }
      rateLimitMap.set(ip, rateData);
      return NextResponse.json({ error: "Access Denied. Invalid credentials." }, { status: 401 });
    }

    // Success! Reset Rate Limit
    rateLimitMap.delete(ip);

    // Generate Secure JWT Token (Valid for 4 hours)
    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({ role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("4h")
      .sign(secret);

    const response = NextResponse.json({ success: true, message: "Welcome Master" });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 4 * 60 * 60, // 4 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
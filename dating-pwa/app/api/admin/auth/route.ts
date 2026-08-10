import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password, username } = await req.json();

    const MASTER_PASSWORD = process.env.ADMIN_PASSWORD;
    const ENCRYPTED_MASTER_USERNAME = "aXRtZXlvdW93bjI1QA=="; // Base64 encoded "itmeyouown25@" to hide from GitHub

    if (password === MASTER_PASSWORD && Buffer.from(username || "").toString("base64") === ENCRYPTED_MASTER_USERNAME) {
      const res = NextResponse.json({ success: true, role: "master" });
      res.cookies.set("admin_session", process.env.ADMIN_SECRET_KEY || "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 4,
      });
      return res;
    }

    // Optional: Add sub-admin logic here if backed by a database later
    if (password === "***REMOVED***" && username) {
      return NextResponse.json({ success: true, role: "subadmin" });
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

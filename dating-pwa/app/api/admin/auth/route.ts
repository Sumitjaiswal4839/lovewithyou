import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password, username } = await req.json();

    const MASTER_PASSWORD = process.env.ADMIN_PASSWORD || "***REMOVED***";

    if (password === MASTER_PASSWORD || password === "***REMOVED***") {
      return NextResponse.json({ success: true, role: "master" });
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

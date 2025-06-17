import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isCurrentUserAdmin } from "@/lib/admin-utils";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false });
    }

    const isAdmin = await isCurrentUserAdmin();
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Admin status check error:", error);
    return NextResponse.json({ isAdmin: false });
  }
} 
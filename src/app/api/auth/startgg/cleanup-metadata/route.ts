import { type NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    console.log(`[CLEANUP] User ${userId}: checking start.gg cleanup`);

    // Check current state
    const hasStartGGAccount = user.externalAccounts.some(
      (acc) => acc.provider === "custom_start_gg",
    );
    const hasStartGGMetadata = !!user.publicMetadata?.start_gg;

    console.log(
      `[CLEANUP] State: account=${hasStartGGAccount}, metadata=${hasStartGGMetadata}`,
    );

    // Simple logic: if metadata exists but no external account, remove it
    if (!hasStartGGAccount && hasStartGGMetadata) {
      console.log(`[CLEANUP] Removing orphaned start.gg metadata`);

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          start_gg: null,
        },
      });

      console.log(`[CLEANUP] ✅ start.gg metadata removed`);
      return NextResponse.json({
        success: true,
        cleaned: true,
        message: "start.gg metadata cleaned up successfully",
      });
    }

    console.log(`[CLEANUP] No start.gg cleanup needed`);
    return NextResponse.json({
      success: true,
      cleaned: false,
      message: hasStartGGAccount
        ? "User has start.gg account"
        : "No start.gg metadata to clean",
    });
  } catch (error) {
    console.error("[CLEANUP] start.gg error:", error);
    return NextResponse.json(
      { error: "start.gg cleanup failed" },
      { status: 500 },
    );
  }
}

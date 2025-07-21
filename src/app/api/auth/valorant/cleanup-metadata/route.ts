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

    console.log(`[CLEANUP] User ${userId}: checking VALORANT cleanup`);

    // Check current state
    const hasValorantAccount = user.externalAccounts.some(
      (acc) => acc.provider === "custom_valorant",
    );
    const hasValorantMetadata = !!user.publicMetadata?.valorant;

    console.log(
      `[CLEANUP] State: account=${hasValorantAccount}, metadata=${hasValorantMetadata}`,
    );

    // Simple logic: if metadata exists but no external account, remove it
    if (!hasValorantAccount && hasValorantMetadata) {
      console.log(`[CLEANUP] Removing orphaned VALORANT metadata`);

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          valorant: null,
        },
      });

      console.log(`[CLEANUP] ✅ Metadata removed`);
      return NextResponse.json({
        success: true,
        cleaned: true,
        message: "VALORANT metadata cleaned up successfully",
      });
    }

    console.log(`[CLEANUP] No cleanup needed`);
    return NextResponse.json({
      success: true,
      cleaned: false,
      message: hasValorantAccount
        ? "User has VALORANT account"
        : "No VALORANT metadata to clean",
    });
  } catch (error) {
    console.error("[CLEANUP] Error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

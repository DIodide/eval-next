import { type NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { EpicAccountResponse } from "@/types/epic";

export async function POST(req: NextRequest) {
  try {
    console.log("DEBUG 0: epic/process-oauth");
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // console.log("DEBUG 0: user Epic Games accounts", user.externalAccounts);

    // Find the Epic Games external account
    console.log("DEBUG 0: user Epic Games accounts", user.externalAccounts);
    const hasEpicGamesAccount = user.externalAccounts.some(
      (acc) => acc.provider === "oauth_custom_epic_games",
    );
    console.log("DEBUG 1: hasEpicGamesAccount", hasEpicGamesAccount);

    if (!hasEpicGamesAccount) {
      return NextResponse.json(
        { error: "No Epic Games account found" },
        { status: 400 },
      );
    }

    // Get the OAuth access token using Clerk's backend method
    let accessToken: string;
    try {
      const tokenResponse = await client.users.getUserOauthAccessToken(
        userId,
        "custom_epic_games",
      );

      if (!tokenResponse.data || tokenResponse.data.length === 0) {
        console.error("No OAuth access token found for Epic Games account");
        return NextResponse.json(
          { error: "No OAuth access token found for Epic Games account" },
          { status: 400 },
        );
      }
      console.log("Found OAuth access token for Epic Games account");

      accessToken = tokenResponse.data[0]?.token ?? "";

      if (!accessToken) {
        console.error("Invalid OAuth access token for Epic Games account");
        return NextResponse.json(
          { error: "Invalid OAuth access token for Epic Games account" },
          { status: 400 },
        );
      }
    } catch (tokenError) {
      console.error("Error retrieving OAuth access token:", tokenError);
      return NextResponse.json(
        { error: "Failed to retrieve OAuth access token" },
        { status: 500 },
      );
    }

    console.log("DEBUG 1: accessToken", accessToken);

    // Call Epic Games API to get account info
    const epicResponse = await fetch(
      "https://api.epicgames.dev/epic/oauth/v2/userInfo",
      {
        headers: {
          Authorization: `Bearer ${String(accessToken)}`,
          "User-Agent": "EVAL-Gaming/1.0",
        },
      },
    );

    if (!epicResponse.ok) {
      const errorText = await epicResponse.text();
      console.error("Epic Games API error:", errorText);
      return NextResponse.json(
        {
          error: "Failed to fetch Epic Games account data",
          details: errorText,
        },
        { status: 400 },
      );
    }

    const epicData = (await epicResponse.json()) as EpicAccountResponse;

    // Update user's publicMetadata with Epic Games account info
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        epicGames: {
          accountId: epicData.sub,
          displayName: epicData.preferred_username,
          lastUpdated: new Date().toISOString(),
        },
      },
    });

    console.log(
      `Successfully linked Epic Games account for user ${userId}: ${epicData.preferred_username} (${epicData.sub})`,
    );

    return NextResponse.json({
      success: true,
      accountId: epicData.sub,
      displayName: epicData.preferred_username,
    });
  } catch (error) {
    console.error("Error processing Epic Games OAuth:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

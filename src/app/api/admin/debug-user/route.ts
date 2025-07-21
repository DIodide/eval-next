import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        error: "Not authenticated",
        userId: null,
        playerExists: false,
        coachExists: false,
      });
    }

    // Check if player exists
    const player = await db.player.findUnique({
      where: { clerk_id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        created_at: true,
      },
    });

    // Check if coach exists
    const coach = await db.coach.findUnique({
      where: { clerk_id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      userId,
      playerExists: !!player,
      coachExists: !!coach,
      player: player
        ? {
            id: player.id,
            email: player.email,
            first_name: player.first_name,
            last_name: player.last_name,
            username: player.username,
            created_at: player.created_at,
          }
        : null,
      coach: coach
        ? {
            id: coach.id,
            email: coach.email,
            first_name: coach.first_name,
            last_name: coach.last_name,
            username: coach.username,
            created_at: coach.created_at,
          }
        : null,
    });
  } catch (error) {
    console.error("Debug user error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

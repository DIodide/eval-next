import type { PrismaClient } from "@prisma/client";

/**
 * Check and award the Profile Complete badge when all required fields are filled.
 * Call this from the playerProfile.updateProfile mutation.
 */
export async function checkAndAwardProfileCompleteBadge(
  db: PrismaClient,
  playerId: string,
) {
  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      game_profiles: { select: { id: true } },
      social_connections: { select: { id: true } },
    },
  });

  if (!player) return false;

  // Profile completion checks (matching the dashboard calculation logic)
  const hasBasicInfo = !!(
    player.first_name &&
    player.last_name &&
    player.username &&
    player.location &&
    player.bio
  );

  const hasRecruitingInfo = !!(
    player.school &&
    player.gpa &&
    player.class_year &&
    player.graduation_date &&
    player.intended_major
  );

  const hasGameConnections = player.game_profiles.length > 0;
  const hasSocialConnections = player.social_connections.length > 0;

  const isComplete =
    hasBasicInfo && hasRecruitingInfo && hasGameConnections && hasSocialConnections;

  if (isComplete) {
    await db.playerBadge.upsert({
      where: {
        player_id_badge_type: {
          player_id: playerId,
          badge_type: "PROFILE_COMPLETE",
        },
      },
      update: {},
      create: {
        player_id: playerId,
        badge_type: "PROFILE_COMPLETE",
      },
    });
    return true;
  }

  return false;
}

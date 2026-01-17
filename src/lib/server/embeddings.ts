import "server-only";

/**
 * Embedding service for player vector search
 * Handles creating, updating, and searching player embeddings using pgvector
 */

import { db } from "@/server/db";
import {
  generatePlayerEmbedding,
  generateQueryEmbedding,
  formatEmbeddingForPostgres,
  isGeminiConfigured,
} from "./gemini";
import type {
  PlayerEmbeddingData,
  TalentSearchFilters,
  VectorSearchRow,
  EmbeddingRefreshOptions,
  EmbeddingBatchResult,
} from "@/types/talent-search";

/**
 * Fetch a player's data for embedding generation
 */
async function getPlayerForEmbedding(
  playerId: string,
): Promise<PlayerEmbeddingData | null> {
  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      school_ref: {
        select: {
          name: true,
          type: true,
        },
      },
      main_game: {
        select: {
          name: true,
        },
      },
      game_profiles: {
        include: {
          game: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!player) {
    return null;
  }

  return {
    id: player.id,
    firstName: player.first_name,
    lastName: player.last_name,
    username: player.username,
    location: player.location,
    bio: player.bio,
    school: player.school_ref?.name ?? player.school,
    schoolType: player.school_ref?.type ?? null,
    classYear: player.class_year,
    gpa: player.gpa ? parseFloat(player.gpa.toString()) : null,
    intendedMajor: player.intended_major,
    mainGame: player.main_game?.name ?? null,
    gameProfiles: player.game_profiles.map((profile) => ({
      game: profile.game.name,
      username: profile.username,
      rank: profile.rank,
      role: profile.role,
      agents: profile.agents,
      playStyle: profile.play_style,
    })),
  };
}

/**
 * Create or update a player's embedding
 */
export async function upsertPlayerEmbedding(playerId: string): Promise<void> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API is not configured");
  }

  const playerData = await getPlayerForEmbedding(playerId);
  if (!playerData) {
    throw new Error(`Player not found: ${playerId}`);
  }

  const { embedding, embeddingText } = await generatePlayerEmbedding(playerData);
  const embeddingVector = formatEmbeddingForPostgres(embedding);

  // Use raw SQL since Prisma doesn't support vector type natively
  await db.$executeRaw`
    INSERT INTO player_embeddings (player_id, embedding, embedding_text, updated_at)
    VALUES (${playerId}::uuid, ${embeddingVector}::vector, ${embeddingText}, NOW())
    ON CONFLICT (player_id) 
    DO UPDATE SET 
      embedding = ${embeddingVector}::vector,
      embedding_text = ${embeddingText},
      updated_at = NOW()
  `;
}

/**
 * Delete a player's embedding
 */
export async function deletePlayerEmbedding(playerId: string): Promise<void> {
  await db.$executeRaw`
    DELETE FROM player_embeddings WHERE player_id = ${playerId}::uuid
  `;
}

/**
 * Batch refresh embeddings for all players or only those missing embeddings
 */
export async function refreshAllEmbeddings(
  options: EmbeddingRefreshOptions = {},
): Promise<EmbeddingBatchResult> {
  const { onlyMissing = false, batchSize = 10, batchDelay = 1000 } = options;

  if (!isGeminiConfigured()) {
    throw new Error("Gemini API is not configured");
  }

  // Get players to process
  let playerIds: { id: string }[];

  if (onlyMissing) {
    // Get players without embeddings
    playerIds = await db.$queryRaw<{ id: string }[]>`
      SELECT p.id 
      FROM players p
      LEFT JOIN player_embeddings pe ON p.id = pe.player_id
      WHERE pe.id IS NULL
    `;
  } else {
    // Get all players
    playerIds = await db.player.findMany({
      select: { id: true },
    });
  }

  const result: EmbeddingBatchResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    failedIds: [],
  };

  // Process in batches
  for (let i = 0; i < playerIds.length; i += batchSize) {
    const batch = playerIds.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async ({ id }) => {
        result.processed++;
        try {
          await upsertPlayerEmbedding(id);
          result.succeeded++;
        } catch (error) {
          console.error(`Failed to generate embedding for player ${id}:`, error);
          result.failed++;
          result.failedIds.push(id);
        }
      }),
    );

    // Delay between batches to avoid rate limiting
    if (i + batchSize < playerIds.length) {
      await new Promise((resolve) => setTimeout(resolve, batchDelay));
    }
  }

  return result;
}

/**
 * Search players by vector similarity
 * Returns player IDs sorted by similarity to the query
 */
export async function searchPlayersBySimilarity(
  query: string,
  filters: TalentSearchFilters = {},
): Promise<VectorSearchRow[]> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API is not configured");
  }

  const {
    limit = 50,
    minSimilarity = 0.3,
    gameId,
    classYears,
    schoolTypes,
    locations,
    minGpa,
    maxGpa,
    roles,
  } = filters;

  // Generate embedding for the search query
  const queryEmbedding = await generateQueryEmbedding(query);
  const queryVector = formatEmbeddingForPostgres(queryEmbedding);

  // Build dynamic WHERE conditions
  const conditions: string[] = [];
  const params: (string | number | string[])[] = [];
  let paramIndex = 1;

  // Always filter by minimum similarity
  // Using 1 - cosine_distance as similarity score
  conditions.push(`1 - (pe.embedding <=> $${paramIndex}::vector) >= $${paramIndex + 1}`);
  params.push(queryVector, minSimilarity);
  paramIndex += 2;

  // Game filter
  if (gameId) {
    conditions.push(`EXISTS (
      SELECT 1 FROM player_game_profiles pgp 
      WHERE pgp.player_id = p.id AND pgp.game_id = $${paramIndex}::uuid
    )`);
    params.push(gameId);
    paramIndex++;
  }

  // Class year filter
  if (classYears && classYears.length > 0) {
    conditions.push(`p.class_year = ANY($${paramIndex}::text[])`);
    params.push(classYears);
    paramIndex++;
  }

  // School type filter
  if (schoolTypes && schoolTypes.length > 0) {
    conditions.push(`EXISTS (
      SELECT 1 FROM schools s 
      WHERE s.id = p.school_id AND s.type = ANY($${paramIndex}::text[])
    )`);
    params.push(schoolTypes);
    paramIndex++;
  }

  // Location filter
  if (locations && locations.length > 0) {
    const locationConditions = locations
      .map(() => {
        const condition = `p.location ILIKE $${paramIndex}`;
        paramIndex++;
        return condition;
      })
      .join(" OR ");
    conditions.push(`(${locationConditions})`);
    locations.forEach((loc) => params.push(`%${loc}%`));
  }

  // GPA filter
  if (minGpa !== undefined) {
    conditions.push(`p.gpa >= $${paramIndex}`);
    params.push(minGpa);
    paramIndex++;
  }
  if (maxGpa !== undefined) {
    conditions.push(`p.gpa <= $${paramIndex}`);
    params.push(maxGpa);
    paramIndex++;
  }

  // Role filter
  if (roles && roles.length > 0) {
    conditions.push(`EXISTS (
      SELECT 1 FROM player_game_profiles pgp 
      WHERE pgp.player_id = p.id AND pgp.role = ANY($${paramIndex}::text[])
    )`);
    params.push(roles);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Execute the vector similarity search
  // Using raw SQL since Prisma doesn't support pgvector operations
  const sql = `
    SELECT 
      pe.player_id,
      1 - (pe.embedding <=> $1::vector) as similarity
    FROM player_embeddings pe
    INNER JOIN players p ON p.id = pe.player_id
    ${whereClause}
    ORDER BY pe.embedding <=> $1::vector ASC
    LIMIT $${paramIndex}
  `;

  params.push(limit);

  // Execute raw query with dynamic parameters
  const results = await db.$queryRawUnsafe<VectorSearchRow[]>(sql, ...params);

  return results;
}

/**
 * Get the count of players with embeddings
 */
export async function getEmbeddingCount(): Promise<number> {
  const result = await db.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM player_embeddings
  `;
  return Number(result[0].count);
}

/**
 * Get the count of players without embeddings
 */
export async function getMissingEmbeddingCount(): Promise<number> {
  const result = await db.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count 
    FROM players p
    LEFT JOIN player_embeddings pe ON p.id = pe.player_id
    WHERE pe.id IS NULL
  `;
  return Number(result[0].count);
}

/**
 * Check if a player has an embedding
 */
export async function hasEmbedding(playerId: string): Promise<boolean> {
  const result = await db.$queryRaw<[{ exists: boolean }]>`
    SELECT EXISTS(
      SELECT 1 FROM player_embeddings WHERE player_id = ${playerId}::uuid
    ) as exists
  `;
  return result[0].exists;
}

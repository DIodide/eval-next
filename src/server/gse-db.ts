/**
 * GSE External Database Client
 * Separate PostgreSQL connection for GSE league data
 * This database is read-only and contains external league statistics
 */

import { Pool } from "pg";
import { env } from "@/env";
import type { GSERocketLeaguePlayer, GSERocketLeagueStats } from "@/types/gse";

// Create a connection pool for the GSE database
const gsePool = new Pool({
  connectionString: env.GSE_DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Handle pool errors
gsePool.on("error", (err: Error) => {
  console.error("Unexpected error on idle GSE database client", err);
});

/**
 * Query helper function with error handling
 */
async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await gsePool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } catch (error) {
    console.error("GSE Database query error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get all Rocket League Fall 2025 players
 */
export async function getGSERocketLeaguePlayers(): Promise<
  GSERocketLeaguePlayer[]
> {
  const players = await query<GSERocketLeaguePlayer>(
    `SELECT 
      id, ign, player_id, eval_id, eval_score, 
      total_games, stats, team, created_at, updated_at 
     FROM gse_rl_fall25 
     ORDER BY eval_score DESC`,
  );
  return players;
}

/**
 * Get a specific Rocket League player by player_id (Epic Games ID)
 */
export async function getGSERocketLeaguePlayerByPlayerId(
  playerId: string,
): Promise<GSERocketLeaguePlayer | null> {
  const players = await query<GSERocketLeaguePlayer>(
    `SELECT 
      id, ign, player_id, eval_id, eval_score, 
      total_games, stats, team, created_at, updated_at 
     FROM gse_rl_fall25 
     WHERE player_id = $1`,
    [playerId],
  );
  return players[0] ?? null;
}

/**
 * Get a specific Rocket League player by IGN (In-Game Name)
 */
export async function getGSERocketLeaguePlayerByIGN(
  ign: string,
): Promise<GSERocketLeaguePlayer | null> {
  const players = await query<GSERocketLeaguePlayer>(
    `SELECT 
      id, ign, player_id, eval_id, eval_score, 
      total_games, stats, team, created_at, updated_at 
     FROM gse_rl_fall25 
     WHERE LOWER(ign) = LOWER($1)`,
    [ign],
  );
  return players[0] ?? null;
}

/**
 * Get top N players by eval_score
 */
export async function getGSETopPlayers(
  limit = 20,
): Promise<GSERocketLeaguePlayer[]> {
  const players = await query<GSERocketLeaguePlayer>(
    `SELECT 
      id, ign, player_id, eval_id, eval_score, 
      total_games, stats, team, created_at, updated_at 
     FROM gse_rl_fall25 
     ORDER BY eval_score DESC 
     LIMIT $1`,
    [limit],
  );
  return players;
}

/**
 * Search players by IGN (partial match)
 */
export async function searchGSEPlayersByIGN(
  searchTerm: string,
): Promise<GSERocketLeaguePlayer[]> {
  const players = await query<GSERocketLeaguePlayer>(
    `SELECT 
      id, ign, player_id, eval_id, eval_score, 
      total_games, stats, team, created_at, updated_at 
     FROM gse_rl_fall25 
     WHERE LOWER(ign) LIKE LOWER($1)
     ORDER BY eval_score DESC`,
    [`%${searchTerm}%`],
  );
  return players;
}

/**
 * Get player count
 */
export async function getGSEPlayerCount(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM gse_rl_fall25`,
  );
  return parseInt(result[0]?.count ?? "0", 10);
}

/**
 * Close the connection pool (for cleanup)
 */
export async function closeGSEPool(): Promise<void> {
  await gsePool.end();
}

// Export the pool for advanced use cases
export { gsePool };

/**
 * GSE (Garden State Esports) External Data Router
 * Handles queries to the external GSE database for league statistics
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  getGSERocketLeaguePlayers,
  getGSERocketLeaguePlayerByPlayerId,
  getGSERocketLeaguePlayerByIGN,
  getGSETopPlayers,
  searchGSEPlayersByIGN,
  getGSEPlayerCount,
} from "@/server/gse-db";

export const gseRouter = createTRPCRouter({
  /**
   * Get all Rocket League Fall 2025 players
   */
  getRocketLeaguePlayers: publicProcedure.query(async () => {
    try {
      const players = await getGSERocketLeaguePlayers();
      return players;
    } catch (error) {
      console.error("Error fetching GSE Rocket League players:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch GSE Rocket League players",
      });
    }
  }),

  /**
   * Get top N Rocket League players by eval_score
   */
  getTopRocketLeaguePlayers: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ input }) => {
      try {
        const players = await getGSETopPlayers(input.limit);
        return players;
      } catch (error) {
        console.error("Error fetching top GSE players:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch top GSE players",
        });
      }
    }),

  /**
   * Get a specific player by Epic Games player_id
   */
  getRocketLeaguePlayerByPlayerId: publicProcedure
    .input(
      z.object({
        playerId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const player = await getGSERocketLeaguePlayerByPlayerId(input.playerId);
        if (!player) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Player not found",
          });
        }
        return player;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching GSE player by ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch player",
        });
      }
    }),

  /**
   * Get a specific player by IGN (In-Game Name)
   */
  getRocketLeaguePlayerByIGN: publicProcedure
    .input(
      z.object({
        ign: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const player = await getGSERocketLeaguePlayerByIGN(input.ign);
        if (!player) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Player not found",
          });
        }
        return player;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching GSE player by IGN:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch player",
        });
      }
    }),

  /**
   * Search players by IGN (partial match)
   */
  searchRocketLeaguePlayers: publicProcedure
    .input(
      z.object({
        searchTerm: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      try {
        const players = await searchGSEPlayersByIGN(input.searchTerm);
        return players;
      } catch (error) {
        console.error("Error searching GSE players:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search players",
        });
      }
    }),

  /**
   * Get player count
   */
  getRocketLeaguePlayerCount: publicProcedure.query(async () => {
    try {
      const count = await getGSEPlayerCount();
      return { count };
    } catch (error) {
      console.error("Error fetching GSE player count:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch player count",
      });
    }
  }),
});

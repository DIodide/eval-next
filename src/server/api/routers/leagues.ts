import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/server/db-utils";

export const leaguesRouter = createTRPCRouter({
  // Get all leagues
  getAll: publicProcedure
    .input(
      z
        .object({
          game_id: z.string().uuid().optional(),
          state: z.string().optional(),
          tier: z
            .enum(["ELITE", "PROFESSIONAL", "COMPETITIVE", "DEVELOPMENTAL"])
            .optional(),
          status: z
            .enum(["ACTIVE", "COMPLETED", "UPCOMING", "CANCELLED"])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      try {
        const whereClause = {
          ...(input?.state && { state: input.state }),
          ...(input?.tier && { tier: input.tier }),
          ...(input?.status && { status: input.status }),
          // If game_id filter is provided, filter by leagues that have that game
          ...(input?.game_id && {
            league_games: {
              some: {
                game_id: input.game_id,
              },
            },
          }),
        };

        const leagues = await withRetry(() =>
          ctx.db.league.findMany({
            where: whereClause,
            select: {
              id: true,
              name: true,
              short_name: true,
              region: true,
              state: true,
              season: true,
              status: true,
              tier: true,
              description: true,
              logo_url: true,
              banner_url: true,
              league_games: {
                include: {
                  game: {
                    select: {
                      id: true,
                      name: true,
                      short_name: true,
                      color: true,
                      icon: true,
                    },
                  },
                },
              },
              schools: {
                include: {
                  school: {
                    select: {
                      id: true,
                      name: true,
                      location: true,
                      state: true,
                    },
                  },
                },
              },
              teams: {
                include: {
                  team: {
                    select: {
                      id: true,
                      name: true,
                      school: {
                        select: {
                          name: true,
                          location: true,
                        },
                      },
                    },
                  },
                },
              },
              player_participants: {
                select: {
                  id: true,
                },
              },
            },
            orderBy: [{ status: "asc" }, { tier: "asc" }, { name: "asc" }],
          }),
        );

        return leagues;
      } catch (error) {
        console.error("Error fetching leagues:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch leagues",
        });
      }
    }),

  // Get league by ID with full details
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const league = await withRetry(() =>
          ctx.db.league.findUnique({
            where: { id: input.id },
            select: {
              id: true,
              name: true,
              short_name: true,
              description: true,
              region: true,
              state: true,
              tier: true,
              status: true,
              season: true,
              format: true,
              prize_pool: true,
              founded_year: true,
              logo_url: true,
              banner_url: true,
              league_games: {
                include: {
                  game: {
                    select: {
                      id: true,
                      name: true,
                      short_name: true,
                      color: true,
                      icon: true,
                    },
                  },
                },
              },
              schools: {
                include: {
                  school: {
                    select: {
                      id: true,
                      name: true,
                      location: true,
                      state: true,
                      region: true,
                      type: true,
                      website: true,
                    },
                  },
                },
                orderBy: {
                  joined_at: "asc",
                },
              },
              teams: {
                include: {
                  team: {
                    select: {
                      id: true,
                      name: true,
                      school: {
                        select: {
                          id: true,
                          name: true,
                          location: true,
                          state: true,
                        },
                      },
                      members: {
                        select: {
                          player: {
                            select: {
                              id: true,
                              username: true,
                              first_name: true,
                              last_name: true,
                            },
                          },
                          role: true,
                          active: true,
                        },
                        where: {
                          active: true,
                        },
                      },
                    },
                  },
                },
                orderBy: [{ points: "desc" }, { wins: "desc" }],
              },
              player_participants: {
                include: {
                  player: {
                    select: {
                      id: true,
                      username: true,
                      first_name: true,
                      last_name: true,
                      school: true,
                      class_year: true,
                      game_profiles: {
                        select: {
                          username: true,
                          rank: true,
                          rating: true,
                          role: true,
                          agents: true,
                          combine_score: true,
                          league_score: true,
                        },
                        take: 1,
                      },
                    },
                  },
                },
                orderBy: [{ eval_score: "desc" }],
              },
              matches: {
                select: {
                  id: true,
                  scheduled_at: true,
                  played_at: true,
                  status: true,
                  team_a_score: true,
                  team_b_score: true,
                  team_a: {
                    select: {
                      name: true,
                      school: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                  team_b: {
                    select: {
                      name: true,
                      school: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
                orderBy: {
                  scheduled_at: "desc",
                },
                take: 10,
              },
            },
          }),
        );

        if (!league) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League not found",
          });
        }

        return league;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching league:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch league details",
        });
      }
    }),

  // Get league leaderboard (top teams)
  getLeaderboard: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const leagueTeams = await withRetry(() =>
          ctx.db.leagueTeam.findMany({
            where: { league_id: input.id },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  school: {
                    select: {
                      id: true,
                      name: true,
                      location: true,
                      state: true,
                    },
                  },
                  members: {
                    select: {
                      player: {
                        select: {
                          id: true,
                          username: true,
                          first_name: true,
                          last_name: true,
                        },
                      },
                      role: true,
                    },
                    where: {
                      active: true,
                    },
                    take: 5,
                  },
                },
              },
            },
            orderBy: [{ points: "desc" }, { wins: "desc" }, { losses: "asc" }],
            take: input.limit,
          }),
        );

        return leagueTeams.map((leagueTeam, index) => ({
          rank: index + 1,
          team_id: leagueTeam.team.id,
          team_name: leagueTeam.team.name,
          school_name: leagueTeam.team.school.name,
          school_location: leagueTeam.team.school.location,
          wins: leagueTeam.wins,
          losses: leagueTeam.losses,
          points: leagueTeam.points,
          members: leagueTeam.team.members,
        }));
      } catch (error) {
        console.error("Error fetching league leaderboard:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch league leaderboard",
        });
      }
    }),

  // Get top players in a league
  getTopPlayers: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const topPlayers = await withRetry(() =>
          ctx.db.playerLeague.findMany({
            where: { league_id: input.id },
            include: {
              player: {
                select: {
                  id: true,
                  username: true,
                  first_name: true,
                  last_name: true,
                  school: true,
                  class_year: true,
                  game_profiles: {
                    select: {
                      username: true,
                      rank: true,
                      rating: true,
                      role: true,
                      agents: true,
                      combine_score: true,
                      league_score: true,
                    },
                    take: 1,
                  },
                },
              },
            },
            orderBy: [{ eval_score: "desc" }],
            take: input.limit,
          }),
        );

        return topPlayers.map((playerLeague, index) => ({
          rank: index + 1,
          player_id: playerLeague.player.id,
          username:
            playerLeague.player.username ??
            `${playerLeague.player.first_name} ${playerLeague.player.last_name}`,
          first_name: playerLeague.player.first_name,
          last_name: playerLeague.player.last_name,
          school: playerLeague.player.school,
          class_year: playerLeague.player.class_year,
          eval_score: playerLeague.eval_score,
          main_agent: playerLeague.main_agent,
          role: playerLeague.role,
          wins: playerLeague.wins,
          losses: playerLeague.losses,
          games_played: playerLeague.games_played,
          game_profile: playerLeague.player.game_profiles[0] ?? null,
        }));
      } catch (error) {
        console.error("Error fetching top players:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch top players",
        });
      }
    }),

  // Get leagues available for association requests (simplified data)
  getAvailableForAssociation: publicProcedure.query(async ({ ctx }) => {
    try {
      const leagues = await withRetry(() =>
        ctx.db.league.findMany({
          where: {
            status: { in: ["ACTIVE", "UPCOMING"] }, // Show active and upcoming leagues for association
          },
          select: {
            id: true,
            name: true,
            short_name: true,
            tier: true,
            region: true,
            state: true,
            league_games: {
              include: {
                game: {
                  select: {
                    name: true,
                    short_name: true,
                  },
                },
              },
            },
          },
          orderBy: [{ tier: "asc" }, { name: "asc" }],
        }),
      );

      return leagues;
    } catch (error) {
      console.error("Error fetching available leagues:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch available leagues",
      });
    }
  }),
});

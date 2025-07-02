// src/server/api/routers/leagueAssociationRequests.ts
// Admin router for managing league administrator association requests

import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { type Prisma } from "@prisma/client";
import { logLeagueAssociationApproved, logLeagueAssociationRejected, logAdminAction } from "@/lib/discord-logger";

// Type for custom games
interface CustomGameData {
  name: string;
  short_name: string;
  icon?: string;
  color?: string;
}

// Input validation schemas
const approveRequestSchema = z.object({
  requestId: z.string().uuid(),
  adminNotes: z.string().optional(),
});

const rejectRequestSchema = z.object({
  requestId: z.string().uuid(),
  adminNotes: z.string().min(1, "Admin notes are required for rejection"),
});

const searchRequestsSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const leagueAssociationRequestsRouter = createTRPCRouter({
  // Get league association requests with filtering and pagination
  getRequests: adminProcedure
    .input(searchRequestsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const whereClause: Prisma.LeagueAssociationRequestWhereInput = {
          ...(input.status && { status: input.status }),
          ...(input.search && {
            OR: [
              {
                administrator: {
                  OR: [
                    { first_name: { contains: input.search, mode: 'insensitive' } },
                    { last_name: { contains: input.search, mode: 'insensitive' } },
                    { email: { contains: input.search, mode: 'insensitive' } },
                  ],
                },
              },
              {
                league: {
                  name: { contains: input.search, mode: 'insensitive' },
                },
              },
              {
                proposed_league_name: { contains: input.search, mode: 'insensitive' },
              },
            ],
          }),
        };

        const [requests, totalCount] = await Promise.all([
          ctx.db.leagueAssociationRequest.findMany({
            where: whereClause,
            include: {
              administrator: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  username: true,
                  image_url: true,
                  created_at: true,
                  league_id: true,
                },
              },
              league: {
                select: {
                  id: true,
                  name: true,
                  short_name: true,
                  tier: true,
                  region: true,
                  state: true,
                  league_games: {
                    select: {
                      game: {
                        select: {
                          name: true,
                          short_name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: [
              { status: 'asc' },
              { created_at: 'desc' },
            ],
            skip: (input.page - 1) * input.limit,
            take: input.limit,
          }),
          ctx.db.leagueAssociationRequest.count({ where: whereClause }),
        ]);

        // Resolve game names for proposed game IDs
        const requestsWithGameDetails = await Promise.all(
          requests.map(async (request) => {
            if (request.is_new_league_request && Array.isArray(request.proposed_game_ids)) {
              const gameIds = request.proposed_game_ids as unknown as string[];
              const games = await ctx.db.game.findMany({
                where: {
                  id: { in: gameIds },
                },
                select: {
                  id: true,
                  name: true,
                  short_name: true,
                },
              });
              
              return {
                ...request,
                proposed_games: games,
              };
            }
            return request;
          })
        );

        const totalPages = Math.ceil(totalCount / input.limit);

        return {
          requests: requestsWithGameDetails,
          pagination: {
            page: input.page,
            limit: input.limit,
            totalCount,
            totalPages,
            hasNext: input.page < totalPages,
            hasPrev: input.page > 1,
          },
        };
      } catch (error) {
        console.error('Error fetching league association requests:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch league association requests',
        });
      }
    }),

  // Get pending requests count for dashboard
  getPendingCount: adminProcedure.query(async ({ ctx }) => {
    try {
      const count = await ctx.db.leagueAssociationRequest.count({
        where: { status: 'PENDING' },
      });

      return count;
    } catch (error) {
      console.error('Error fetching pending league requests count:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch pending requests count',
      });
    }
  }),

  // Approve a league association request
  approveRequest: adminProcedure
    .input(approveRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because adminProcedure ensures userId exists

      try {
        // Get the request details
        const request = await ctx.db.leagueAssociationRequest.findUnique({
          where: { id: input.requestId },
          include: {
            administrator: {
              select: { id: true, clerk_id: true, league_id: true, first_name: true, last_name: true, email: true },
            },
            league: {
              select: { id: true, name: true },
            },

          },
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'League association request not found',
          });
        }

        if (request.status !== 'PENDING') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Request has already been processed',
          });
        }

        if (request.administrator.league_id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'League administrator already has a league association',
          });
        }

        // Handle league creation or association
        let leagueId: string;
        let leagueName: string;

        if (request.is_new_league_request) {
          // Create new league with multi-game support
          if (!request.proposed_league_name || !request.proposed_tier || !request.proposed_region) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Missing required league information for new league creation',
            });
          }

          // Get the proposed games (already parsed by Prisma)
          const proposedGameIds = Array.isArray(request.proposed_game_ids) ? request.proposed_game_ids as unknown as string[] : [];
          const proposedCustomGames = Array.isArray(request.proposed_custom_games) ? request.proposed_custom_games as unknown as CustomGameData[] : [];

          if (proposedGameIds.length === 0 && proposedCustomGames.length === 0) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'At least one game must be selected for the new league',
            });
          }

          // Create the league first
          const newLeague = await ctx.db.league.create({
            data: {
              name: request.proposed_league_name,
              short_name: request.proposed_league_short_name ?? request.proposed_league_name.substring(0, 10),
              description: request.proposed_league_description ?? '',
              region: request.proposed_region,
              state: request.proposed_state ?? '',
              tier: request.proposed_tier,
              season: request.proposed_season ?? 'TBD',
              status: 'UPCOMING',
              format: request.proposed_format,
              founded_year: request.proposed_founded_year,
            },
          });

          // Create custom games if any
          for (const customGame of proposedCustomGames) {
            const createdGame = await ctx.db.game.create({
              data: {
                name: customGame.name,
                short_name: customGame.short_name,
                icon: customGame.icon,
                color: customGame.color,
                is_custom: true,
                created_by_league_id: newLeague.id,
              },
            });
            proposedGameIds.push(createdGame.id);
          }

          // Create league-game associations
          for (const gameId of proposedGameIds) {
            await ctx.db.leagueGame.create({
              data: {
                league_id: newLeague.id,
                game_id: gameId,
              },
            });
          }

          leagueId = newLeague.id;
          leagueName = newLeague.name;
        } else {
          // Use existing league
          if (!request.league_id || !request.league) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'League information not found',
            });
          }

          leagueId = request.league_id;
          leagueName = request.league.name;
        }

        // Perform database transaction
        const result = await ctx.db.$transaction(async (tx) => {
          // Update the request status
          const updatedRequest = await tx.leagueAssociationRequest.update({
            where: { id: input.requestId },
            data: {
              status: 'APPROVED',
              admin_notes: input.adminNotes,
            },
          });

          // Associate the league administrator with the league
          const updatedLeagueAdmin = await tx.leagueAdministrator.update({
            where: { id: request.administrator.id },
            data: {
              league_id: leagueId,
              league: leagueName,
              updated_at: new Date(),
            },
          });

          return { request: updatedRequest, leagueAdmin: updatedLeagueAdmin, leagueName, leagueId };
        });

        // Update Clerk publicMetadata to mark league admin as onboarded
        try {
          const client = await clerkClient();
          await client.users.updateUser(request.administrator.clerk_id, {
            publicMetadata: {
              onboarded: true,
              userType: 'league_admin',
              leagueId: result.leagueId,
              leagueName: result.leagueName,
            },
          });
        } catch (clerkError) {
          console.error('Failed to update Clerk metadata:', clerkError);
          // Don't throw error here as the database transaction was successful
          // The league admin can still function, they just might need to refresh
        }

        // Log the approval to Discord
        try {
          const adminName = ctx.adminName ?? "Unknown Admin";
          const adminEmail = ctx.adminEmail ?? "Unknown";

          await logLeagueAssociationApproved({
            requestId: input.requestId,
            adminName: `${request.administrator.first_name} ${request.administrator.last_name}`,
            adminEmail: request.administrator.email,
            leagueName: result.leagueName,
            reviewerName: adminName,
            reviewerNotes: input.adminNotes,
            decision: "approved",
            userId: ctx.auth.userId,
            userEmail: adminEmail,
            timestamp: new Date(),
          });

          // Also log the admin action
          await logAdminAction({
            action: "League Association Request Approved",
            details: `Approved league association for ${request.administrator.email} with ${result.leagueName}`,
            targetUserEmail: request.administrator.email,
            userId: ctx.auth.userId,
            userEmail: adminEmail,
            userName: adminName,
            timestamp: new Date(),
          });
        } catch (discordError) {
          console.error("Discord notifications failed:", discordError);
          // Don't fail the main operation if Discord logging fails
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error approving league association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to approve league association request',
        });
      }
    }),

  // Reject a league association request
  rejectRequest: adminProcedure
    .input(rejectRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because adminProcedure ensures userId exists

      try {
        const request = await ctx.db.leagueAssociationRequest.findUnique({
          where: { id: input.requestId },
          include: {
            administrator: {
              select: { first_name: true, last_name: true, email: true },
            },
            league: {
              select: { name: true },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'League association request not found',
          });
        }

        if (request.status !== 'PENDING') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Request has already been processed',
          });
        }

        const updatedRequest = await ctx.db.leagueAssociationRequest.update({
          where: { id: input.requestId },
          data: {
            status: 'REJECTED',
            admin_notes: input.adminNotes,
          },
          include: {
            administrator: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            league: {
              select: {
                name: true,
              },
            },
          },
        });

        // Log the rejection to Discord
        try {
          const adminName = ctx.adminName ?? "Unknown Admin";
          const adminEmail = ctx.adminEmail ?? "Unknown";
          
          // Get league name for logging
          const leagueName = updatedRequest.league?.name ?? 
            (updatedRequest.proposed_league_name ? `${updatedRequest.proposed_league_name} (New League Request)` : "Unknown League");

          await logLeagueAssociationRejected({
            requestId: input.requestId,
            adminName: `${updatedRequest.administrator.first_name} ${updatedRequest.administrator.last_name}`,
            adminEmail: updatedRequest.administrator.email,
            leagueName,
            reviewerName: adminName,
            reviewerNotes: input.adminNotes,
            decision: "rejected",
            userId: ctx.auth.userId,
            userEmail: adminEmail,
            timestamp: new Date(),
          });

          // Also log the admin action
          await logAdminAction({
            action: "League Association Request Rejected",
            details: `Rejected league association for ${updatedRequest.administrator.email} with ${leagueName}. Reason: ${input.adminNotes}`,
            targetUserEmail: updatedRequest.administrator.email,
            userId: ctx.auth.userId,
            userEmail: adminEmail,
            userName: adminName,
            timestamp: new Date(),
          });
        } catch (discordError) {
          console.error("Discord notifications failed:", discordError);
          // Don't fail the main operation if Discord logging fails
        }

        return updatedRequest;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error rejecting league association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reject league association request',
        });
      }
    }),

  // Get request details by ID
  getRequestById: adminProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const request = await ctx.db.leagueAssociationRequest.findUnique({
          where: { id: input.requestId },
          select: {
            id: true,
            status: true,
            created_at: true,
            request_message: true,
            admin_notes: true,
            is_new_league_request: true,
            proposed_league_name: true,
            proposed_league_short_name: true,
            proposed_league_description: true,
            proposed_region: true,
            proposed_state: true,
            proposed_tier: true,
            proposed_season: true,
            proposed_format: true,
            proposed_founded_year: true,
            administrator: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                username: true,
                image_url: true,
                created_at: true,
                league_id: true,
              },
            },
            league: {
              select: {
                id: true,
                name: true,
                short_name: true,
                tier: true,
                region: true,
                state: true,
                league_games: {
                  select: {
                    game: {
                      select: {
                        name: true,
                        short_name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'League association request not found',
          });
        }

        return request;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching league association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch league association request',
        });
      }
    }),
}); 
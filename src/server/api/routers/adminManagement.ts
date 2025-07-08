import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/db-utils";

// Validation schemas for updates
const updateLeagueSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal("")),
  banner_url: z.string().url().optional().nullable().or(z.literal("")),
});

const updateSchoolSchema = z.object({
  id: z.string().uuid(),
  bio: z.string().max(2000).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().max(20).optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal("")),
  banner_url: z.string().url().optional().nullable().or(z.literal("")),
});

const updatePlayerSchema = z.object({
  id: z.string().uuid(),
  main_game_id: z.string().uuid().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  gpa: z.number().min(0).max(4.0).optional().nullable(),
  class_year: z.string().max(20).optional().nullable(),
  graduation_date: z.string().max(50).optional().nullable(),
  intended_major: z.string().max(200).optional().nullable(),
  guardian_email: z.string().email().optional().nullable().or(z.literal("")),
  scholastic_contact: z.string().max(200).optional().nullable(),
  scholastic_contact_email: z.string().email().optional().nullable().or(z.literal("")),
  extra_curriculars: z.string().max(2000).optional().nullable(),
  academic_bio: z.string().max(2000).optional().nullable(),
});

export const adminManagementRouter = createTRPCRouter({
  // Update league information
  updateLeague: adminProcedure
    .input(updateLeagueSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Remove empty strings and convert to null for optional fields
        const cleanedData: Record<string, string | null> = {};
        
        for (const [key, value] of Object.entries(updateData)) {
          if (value === "") {
            cleanedData[key] = null;
          } else if (value !== undefined) {
            cleanedData[key] = value;
          }
        }

        const updatedLeague = await withRetry(() =>
          ctx.db.league.update({
            where: { id },
            data: cleanedData,
            select: {
              id: true,
              name: true,
              description: true,
              logo_url: true,
              banner_url: true,
              updated_at: true,
            },
          })
        );

        return updatedLeague;
      } catch (error) {
        console.error('Error updating league:', error);
        
        // Check if it's a not found error
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'League not found',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update league',
        });
      }
    }),

  // Update school information
  updateSchool: adminProcedure
    .input(updateSchoolSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Remove empty strings and convert to null for optional fields
        const cleanedData: Record<string, string | null> = {};
        
        for (const [key, value] of Object.entries(updateData)) {
          if (value === "") {
            cleanedData[key] = null;
          } else if (value !== undefined) {
            cleanedData[key] = value;
          }
        }

        const updatedSchool = await withRetry(() =>
          ctx.db.school.update({
            where: { id },
            data: cleanedData,
            select: {
              id: true,
              name: true,
              bio: true,
              website: true,
              email: true,
              phone: true,
              logo_url: true,
              banner_url: true,
              updated_at: true,
            },
          })
        );

        return updatedSchool;
      } catch (error) {
        console.error('Error updating school:', error);
        
        // Check if it's a not found error
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'School not found',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update school',
        });
      }
    }),

  // Update player information
  updatePlayer: adminProcedure
    .input(updatePlayerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, main_game_id, ...updateData } = input;

        // If main_game_id is provided, validate that the game exists
        if (main_game_id) {
          const game = await withRetry(() =>
            ctx.db.game.findUnique({
              where: { id: main_game_id },
              select: { id: true },
            })
          );

          if (!game) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Game not found',
            });
          }
        }

        // Remove empty strings and convert to null for optional fields
        const cleanedData = { main_game_id, ...updateData };
        
        // Convert empty strings to null
        for (const [key, value] of Object.entries(cleanedData)) {
          if (value === "") {
            (cleanedData as Record<string, unknown>)[key] = null;
          }
        }

        const updatedPlayer = await withRetry(() =>
          ctx.db.player.update({
            where: { id },
            data: cleanedData,
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true,
              email: true,
              location: true,
              bio: true,
              gpa: true,
              class_year: true,
              graduation_date: true,
              intended_major: true,
              guardian_email: true,
              scholastic_contact: true,
              scholastic_contact_email: true,
              extra_curriculars: true,
              academic_bio: true,
              main_game_id: true,
              main_game: {
                select: {
                  id: true,
                  name: true,
                  short_name: true,
                  icon: true,
                  color: true,
                },
              },
              updated_at: true,
            },
          })
        );

        return updatedPlayer;
      } catch (error) {
        console.error('Error updating player:', error);
        
        // Check if it's a not found error
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Player not found',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update player',
        });
      }
    }),

  // Get all games for main game selection
  getGames: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const games = await withRetry(() =>
          ctx.db.game.findMany({
            select: {
              id: true,
              name: true,
              short_name: true,
              icon: true,
              color: true,
            },
            orderBy: { name: 'asc' },
          })
        );

        return games;
      } catch (error) {
        console.error('Error fetching games:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch games',
        });
      }
    }),
}); 
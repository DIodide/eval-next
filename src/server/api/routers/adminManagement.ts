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
}); 
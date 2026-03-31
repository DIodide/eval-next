import { sendCoachIntroEmail } from "@/lib/server/email-bridge";
import { withRetry } from "@/lib/server/db-utils";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const adminCoachesRouter = createTRPCRouter({
  // Paginated list of preprovisioned coaches with search/filters
  getProvisionedCoaches: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["SCRAPED", "INVITED"]).optional(),
        introEmailSent: z.boolean().optional(),
        school: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, status, introEmailSent, school, limit, offset } = input;

      const where: Prisma.CoachWhereInput = {
        clerk_id: null,
      };

      if (status) {
        where.status = status;
      }

      if (introEmailSent !== undefined) {
        where.intro_email_sent = introEmailSent;
      }

      if (school) {
        where.school = { contains: school, mode: "insensitive" };
      }

      if (search) {
        where.OR = [
          { first_name: { contains: search, mode: "insensitive" } },
          { last_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { school: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
        ];
      }

      const [coaches, total] = await Promise.all([
        withRetry(() =>
          ctx.db.coach.findMany({
            where,
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              school: true,
              school_id: true,
              status: true,
              source: true,
              title: true,
              forwarded_emails_count: true,
              intro_email_sent: true,
              created_at: true,
              updated_at: true,
              _count: {
                select: { Conversation: true },
              },
              school_ref: {
                select: { id: true, name: true },
              },
            },
            orderBy: { created_at: "desc" },
            skip: offset,
            take: limit,
          }),
        ),
        withRetry(() => ctx.db.coach.count({ where })),
      ]);

      return {
        coaches,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Aggregate stats for preprovisioned coaches
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalPreprovisioned,
      totalIntroEmailsSent,
      totalIntroEmailsPending,
      totalConversations,
    ] = await Promise.all([
      withRetry(() => ctx.db.coach.count({ where: { clerk_id: null } })),
      withRetry(() =>
        ctx.db.coach.count({
          where: { clerk_id: null, intro_email_sent: true },
        }),
      ),
      withRetry(() =>
        ctx.db.coach.count({
          where: { clerk_id: null, intro_email_sent: false },
        }),
      ),
      withRetry(() =>
        ctx.db.conversation.count({
          where: { coach: { clerk_id: null } },
        }),
      ),
    ]);

    return {
      totalPreprovisioned,
      totalIntroEmailsSent,
      totalIntroEmailsPending,
      totalConversations,
    };
  }),

  // Distinct school names for filter dropdown
  getSchoolsForFilter: adminProcedure.query(async ({ ctx }) => {
    const coaches = await withRetry(() =>
      ctx.db.coach.findMany({
        where: { clerk_id: null },
        distinct: ["school"],
        select: { school: true },
        orderBy: { school: "asc" },
      }),
    );
    return coaches.map((c) => c.school).filter(Boolean);
  }),

  // Count of coaches with pending intro emails (for dashboard badge)
  getPendingIntroCount: adminProcedure.query(async ({ ctx }) => {
    return withRetry(() =>
      ctx.db.coach.count({
        where: { clerk_id: null, intro_email_sent: false },
      }),
    );
  }),

  // Send intro email to a single coach
  sendIntroEmail: adminProcedure
    .input(z.object({ coachId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const coach = await withRetry(() =>
        ctx.db.coach.findFirst({
          where: { id: input.coachId, clerk_id: null },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            school: true,
            intro_email_sent: true,
          },
        }),
      );

      if (!coach) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Preprovisioned coach not found",
        });
      }

      if (coach.intro_email_sent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Intro email has already been sent to this coach",
        });
      }

      const coachName =
        coach.first_name && coach.last_name
          ? `${coach.first_name} ${coach.last_name}`
          : coach.first_name || "Coach";

      const sent = await sendCoachIntroEmail({
        coachEmail: coach.email,
        coachName,
        schoolName: coach.school,
      });

      if (!sent) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to send intro email. Check that email is configured.",
        });
      }

      await withRetry(() =>
        ctx.db.coach.update({
          where: { id: coach.id },
          data: { intro_email_sent: true, status: "INVITED" },
        }),
      );

      return { success: true, message: `Intro email sent to ${coach.email}` };
    }),

  // Bulk send intro emails to all coaches who haven't received one
  sendBulkIntroEmails: adminProcedure.mutation(async ({ ctx }) => {
    const coaches = await withRetry(() =>
      ctx.db.coach.findMany({
        where: { clerk_id: null, intro_email_sent: false },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          school: true,
        },
      }),
    );

    if (coaches.length === 0) {
      return { totalSent: 0, totalFailed: 0, message: "No coaches to email" };
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const coach of coaches) {
      const coachName =
        coach.first_name && coach.last_name
          ? `${coach.first_name} ${coach.last_name}`
          : coach.first_name || "Coach";

      const sent = await sendCoachIntroEmail({
        coachEmail: coach.email,
        coachName,
        schoolName: coach.school,
      });

      if (sent) {
        await withRetry(() =>
          ctx.db.coach.update({
            where: { id: coach.id },
            data: { intro_email_sent: true, status: "INVITED" },
          }),
        );
        totalSent++;
      } else {
        totalFailed++;
      }
    }

    return {
      totalSent,
      totalFailed,
      message: `Sent ${totalSent} emails, ${totalFailed} failed`,
    };
  }),

  // Edit coach details
  updateCoach: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        first_name: z.string().min(1).max(200).optional(),
        last_name: z.string().min(1).max(200).optional(),
        email: z.string().email().optional(),
        school: z.string().min(1).max(300).optional(),
        school_id: z.string().uuid().optional().nullable(),
        title: z.string().max(200).optional().nullable(),
        status: z.enum(["SCRAPED", "INVITED"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify coach is preprovisioned
      const existing = await withRetry(() =>
        ctx.db.coach.findFirst({
          where: { id, clerk_id: null },
          select: { id: true, email: true },
        }),
      );

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Preprovisioned coach not found",
        });
      }

      // If email is changing, check uniqueness
      if (updateData.email && updateData.email !== existing.email) {
        const emailExists = await withRetry(() =>
          ctx.db.coach.findUnique({
            where: { email: updateData.email },
            select: { id: true },
          }),
        );
        if (emailExists) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A coach with this email already exists",
          });
        }
      }

      // Clean empty strings to null for nullable fields
      const cleanedData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (value === "") {
          cleanedData[key] = null;
        } else if (value !== undefined) {
          cleanedData[key] = value;
        }
      }

      const updated = await withRetry(() =>
        ctx.db.coach.update({
          where: { id },
          data: cleanedData,
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            school: true,
            school_id: true,
            status: true,
            source: true,
            title: true,
            updated_at: true,
          },
        }),
      );

      return updated;
    }),

  // Delete a preprovisioned coach
  deleteCoach: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const coach = await withRetry(() =>
        ctx.db.coach.findFirst({
          where: { id: input.id, clerk_id: null },
          select: { id: true, email: true, first_name: true, last_name: true },
        }),
      );

      if (!coach) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Preprovisioned coach not found. Cannot delete claimed accounts.",
        });
      }

      await withRetry(() => ctx.db.coach.delete({ where: { id: input.id } }));

      return {
        success: true,
        message: `Deleted coach ${coach.first_name} ${coach.last_name} (${coach.email})`,
      };
    }),

  // Reset forwarded email count
  resetForwardedEmailCount: adminProcedure
    .input(z.object({ coachId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const coach = await withRetry(() =>
        ctx.db.coach.findFirst({
          where: { id: input.coachId, clerk_id: null },
          select: { id: true },
        }),
      );

      if (!coach) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Preprovisioned coach not found",
        });
      }

      await withRetry(() =>
        ctx.db.coach.update({
          where: { id: input.coachId },
          data: { forwarded_emails_count: 0 },
        }),
      );

      return { success: true, message: "Forwarded email count reset to 0" };
    }),

  // Manually create a preprovisioned coach
  createCoach: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        first_name: z.string().min(1).max(200),
        last_name: z.string().min(1).max(200),
        school: z.string().min(1).max(300),
        school_id: z.string().uuid().optional().nullable(),
        title: z.string().max(200).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check email uniqueness
      const existing = await withRetry(() =>
        ctx.db.coach.findUnique({
          where: { email: input.email },
          select: { id: true },
        }),
      );

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A coach with this email already exists",
        });
      }

      // Auto-resolve school_id from school name if not provided
      let schoolId = input.school_id ?? null;
      if (!schoolId && input.school) {
        const school = await withRetry(() =>
          ctx.db.school.findFirst({
            where: { name: { equals: input.school, mode: "insensitive" } },
            select: { id: true },
          }),
        );
        schoolId = school?.id ?? null;
      }

      const coach = await withRetry(() =>
        ctx.db.coach.create({
          data: {
            email: input.email,
            first_name: input.first_name,
            last_name: input.last_name,
            school: input.school,
            school_id: schoolId,
            title: input.title ?? null,
            clerk_id: null,
            status: "SCRAPED",
            source: "MANUAL",
          },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            school: true,
            status: true,
            source: true,
            title: true,
            created_at: true,
          },
        }),
      );

      return {
        success: true,
        message: `Created preprovisioned coach ${input.first_name} ${input.last_name}`,
        coach,
      };
    }),
});

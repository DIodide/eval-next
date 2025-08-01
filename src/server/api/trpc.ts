/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { createClerkContext } from "../context";
import { db } from "../db";

import { clerkClient } from "@clerk/nextjs/server";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // CLERK Auth Guide: https://clerk.com/docs/references/nextjs/trpc
  const clerkContext = await createClerkContext();
  return {
    db,
    ...clerkContext,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    //const waitMs = Math.floor(Math.random() * 400) + 100;
    // await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

// Check if the user is signed in and track timing
// Otherwise, throw an UNAUTHORIZED code
const isAuthed = t.middleware(async ({ next, ctx, path }) => {
  const start = Date.now();

  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to do this",
    });
  }

  const result = await next({
    ctx: {
      auth: ctx.auth,
    },
  });

  const end = Date.now();
  console.log(`[TRPC Auth] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected procedure
 *
 * This is a procedure that requires the user to be signed in.
 */
export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * Middleware to verify user is an onboarded coach
 * Note: This middleware assumes the user is already authenticated (should be used after isAuthed)
 */
const isOnboardedCoach = t.middleware(async ({ next, ctx }) => {
  // Get user from Clerk to check publicMetadata
  // console.debug("DEBUG -2: ctx", ctx);
  // console.debug("DEBUG -1: ctx.auth", ctx.auth);
  // console.debug("DEBUG 0: ctx.auth.sessionClaims", ctx.auth.sessionClaims);
  const publicMetadata = ctx.auth.sessionClaims?.publicMetadata as
    | Record<string, unknown>
    | undefined;
  // console.debug("DEBUG 1: publicMetadata", publicMetadata);
  // console.debug("DEBUG 2: ctx.auth.userId", ctx.auth.userId);
  // console.debug("DEBUG 3: (!publicMetadata?.onboarded || publicMetadata?.userType !== 'coach')...", (!publicMetadata?.onboarded || publicMetadata?.userType !== "coach"));

  if (!publicMetadata?.onboarded || publicMetadata?.userType !== "coach") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Access denied. Only onboarded coaches can access this resource.",
    });
  }

  // Verify coach exists in database
  const coach = await ctx.db.coach.findUnique({
    where: { clerk_id: ctx.auth.userId! }, // Safe to use ! because protectedProcedure ensures userId exists
    select: { id: true, school_id: true },
  });

  if (!coach) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Coach profile not found.",
    });
  }

  return next({
    ctx: {
      ...ctx, // Preserve existing context
      coachId: coach.id, // Add coach-specific context
      schoolId: coach.school_id, // Add school context for onboarded coaches
    },
  });
});

/**
 * Middleware to verify user is a coach (including school_id)
 * Note: This middleware assumes the user is already authenticated (should be used after isAuthed)
 */

const isCoach = t.middleware(async ({ next, ctx }) => {
  const coach = await ctx.db.coach.findUnique({
    where: { clerk_id: ctx.auth.userId! }, // Safe to use ! because protectedProcedure ensures userId exists
    select: { id: true, school_id: true },
  });

  if (!coach) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Coach profile not found. Only coaches can access this resource.",
    });
  }

  return next({
    ctx: {
      ...ctx, // Preserve existing context
      coachId: coach.id, // Add coach-specific context
      schoolId: coach.school_id, // Add school context for coaches
    },
  });
});

/**
 * Middleware to verify user is a player
 * Note: This middleware assumes the user is already authenticated (should be used after isAuthed)
 */
const isPlayer = t.middleware(async ({ next, ctx }) => {
  const player = await ctx.db.player.findUnique({
    where: { clerk_id: ctx.auth.userId! }, // Safe to use ! because protectedProcedure ensures userId exists
    select: { id: true },
  });

  if (!player) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Player profile not found. Only players can access this resource.",
    });
  }

  return next({
    ctx: {
      ...ctx, // Preserve existing context
      playerId: player.id, // Add player-specific context
    },
  });
});

/**
 * Middleware to verify user is an admin
 * Note: This middleware assumes the user is already authenticated (should be used after isAuthed)
 */
const isAdmin = t.middleware(async ({ next, ctx }) => {
  // Get user from Clerk to check publicMetadata
  const client = await clerkClient();
  const user = await client.users.getUser(ctx.auth.userId!);
  const privateMetadata = user.privateMetadata as
    | Record<string, unknown>
    | undefined;

  if (!privateMetadata?.role || privateMetadata.role !== "admin") {
    console.warn(
      `[SECURITY] Non-admin user ${ctx.auth.userId} attempted admin access`,
    );
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Admin access required. Only administrators can access this resource.",
    });
  }

  return next({
    ctx: {
      ...ctx, // Preserve existing context
      // Admin context can be enhanced here if needed
      adminEmail: user.emailAddresses[0]?.emailAddress,
      adminName: `${user.firstName} ${user.lastName}`,
    },
  });
});

/**
 * Onboarded coach procedure
 *
 * This is a procedure that requires the user to be signed in and be an onboarded coach.
 * It builds upon protectedProcedure, so authentication is handled automatically.
 */
export const onboardedCoachProcedure = protectedProcedure.use(isOnboardedCoach);

/**
 * Coach procedure
 *
 * This is a procedure that requires the user to be signed in and be a coach.
 * It builds upon protectedProcedure, so authentication is handled automatically.
 * Provides coachId and schoolId in the context.
 */
export const coachProcedure = protectedProcedure.use(isCoach);

/**
 * Player procedure
 *
 * This is a procedure that requires the user to be signed in and be a player.
 * It builds upon protectedProcedure, so authentication is handled automatically.
 * Provides playerId in the context.
 */
export const playerProcedure = protectedProcedure.use(isPlayer);

/**
 * Admin procedure
 *
 * This is a procedure that requires the user to be signed in and be an admin.
 * It builds upon protectedProcedure, so authentication is handled automatically.
 * Checks Clerk publicMetadata.role === "admin".
 */
export const adminProcedure = protectedProcedure.use(isAdmin);

/**
 * Middleware to verify user is an onboarded league administrator
 * Note: This middleware assumes the user is already authenticated (should be used after isAuthed)
 */
const isOnboardedLeagueAdmin = t.middleware(async ({ next, ctx }) => {
  // Get user from Clerk to check publicMetadata
  const publicMetadata = ctx.auth.sessionClaims?.publicMetadata as
    | Record<string, unknown>
    | undefined;

  if (!publicMetadata?.onboarded || publicMetadata?.userType !== "league") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Access denied. Only onboarded league administrators can access this resource.",
    });
  }

  // Verify league administrator exists in database
  const leagueAdmin = await ctx.db.leagueAdministrator.findUnique({
    where: { clerk_id: ctx.auth.userId! }, // Safe to use ! because protectedProcedure ensures userId exists
    select: { id: true, league_id: true },
  });

  if (!leagueAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "League administrator profile not found.",
    });
  }

  return next({
    ctx: {
      ...ctx, // Preserve existing context
      leagueAdminId: leagueAdmin.id, // Add league admin-specific context
      leagueId: leagueAdmin.league_id, // Add league context for onboarded admins
    },
  });
});

/**
 * Middleware to verify user is a league administrator (including non-onboarded)
 * Note: This middleware assumes the user is already authenticated (should be used after isAuthed)
 */
const isLeagueAdmin = t.middleware(async ({ next, ctx }) => {
  const leagueAdmin = await ctx.db.leagueAdministrator.findUnique({
    where: { clerk_id: ctx.auth.userId! }, // Safe to use ! because protectedProcedure ensures userId exists
    select: { id: true, league_id: true },
  });

  if (!leagueAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "League administrator profile not found. Only league administrators can access this resource.",
    });
  }

  return next({
    ctx: {
      ...ctx, // Preserve existing context
      leagueAdminId: leagueAdmin.id, // Add league admin-specific context
      leagueId: leagueAdmin.league_id, // Add league context for league admins
    },
  });
});

/**
 * Onboarded league administrator procedure
 *
 * This is a procedure that requires the user to be signed in and be an onboarded league administrator.
 * It builds upon protectedProcedure, so authentication is handled automatically.
 */
export const onboardedLeagueAdminProcedure = protectedProcedure.use(
  isOnboardedLeagueAdmin,
);

/**
 * League administrator procedure
 *
 * This is a procedure that requires the user to be signed in and be a league administrator.
 * It builds upon protectedProcedure, so authentication is handled automatically.
 * Provides leagueAdminId and leagueId in the context.
 */
export const leagueAdminProcedure = protectedProcedure.use(isLeagueAdmin);

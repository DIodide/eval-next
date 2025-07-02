import { playerProfileRouter } from "@/server/api/routers/playerProfile";
import { coachProfileRouter } from "@/server/api/routers/coachProfile";
import { schoolProfileRouter } from "@/server/api/routers/schoolProfile";
import { tryoutsRouter } from "@/server/api/routers/tryouts";
import { combinesRouter } from "@/server/api/routers/combines";
import { messagesRouter } from "@/server/api/routers/messages";
import { leaguesRouter } from "@/server/api/routers/leagues";
import { leagueAdminProfileRouter } from "@/server/api/routers/leagueAdminProfile";
import { leagueAssociationRequestsRouter } from "@/server/api/routers/leagueAssociationRequests";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { playerSearchRouter } from "@/server/api/routers/playerSearch";
import { schoolAssociationRequestsRouter } from "@/server/api/routers/schoolAssociationRequests";
import { valorantStatsRouter } from "@/server/api/routers/valorantStats";
import { adminDirectoryRouter } from "@/server/api/routers/adminDirectory";
import { adminManagementRouter } from "@/server/api/routers/adminManagement";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  playerProfile: playerProfileRouter,
  coachProfile: coachProfileRouter,
  schoolProfile: schoolProfileRouter,
  tryouts: tryoutsRouter,
  combines: combinesRouter,
  messages: messagesRouter,
  playerSearch: playerSearchRouter,
  leagues: leaguesRouter,
  leagueAdminProfile: leagueAdminProfileRouter,
  leagueAssociationRequests: leagueAssociationRequestsRouter,
  schoolAssociationRequests: schoolAssociationRequestsRouter,
  valorantStats: valorantStatsRouter,
  adminDirectory: adminDirectoryRouter,
  adminManagement: adminManagementRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 * const res = await trpc.greeting.hello();
 *       ^? string
 */
export const createCaller = createCallerFactory(appRouter);

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
import { leagueSchoolCreationRequestsRouter } from "@/server/api/routers/leagueSchoolCreationRequests";
import { valorantStatsRouter } from "@/server/api/routers/valorantStats";
import { rocketLeagueStatsRouter } from "@/server/api/routers/rocketLeagueStats";
import { smashStatsRouter } from "@/server/api/routers/smashStats";
import { adminDirectoryRouter } from "@/server/api/routers/adminDirectory";
import { adminManagementRouter } from "@/server/api/routers/adminManagement";
import { publicSearchRouter } from "@/server/api/routers/publicSearch";
import { gseRouter } from "@/server/api/routers/gse";
import { paymentsRouter } from "@/server/api/routers/payments";

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
  publicSearch: publicSearchRouter,
  leagues: leaguesRouter,
  leagueAdminProfile: leagueAdminProfileRouter,
  leagueAssociationRequests: leagueAssociationRequestsRouter,
  schoolAssociationRequests: schoolAssociationRequestsRouter,
  leagueSchoolCreationRequests: leagueSchoolCreationRequestsRouter,
  valorantStats: valorantStatsRouter,
  rocketLeagueStats: rocketLeagueStatsRouter,
  smashStats: smashStatsRouter,
  adminDirectory: adminDirectoryRouter,
  adminManagement: adminManagementRouter,
  gse: gseRouter,
  payments: paymentsRouter,
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

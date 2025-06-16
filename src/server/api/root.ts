import { playerProfileRouter } from "@/server/api/routers/playerProfile";
import { coachProfileRouter } from "@/server/api/routers/coachProfile";
import { tryoutsRouter } from "@/server/api/routers/tryouts";
import { combinesRouter } from "@/server/api/routers/combines";
import { messagesRouter } from "@/server/api/routers/messages";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { playerSearchRouter } from "@/server/api/routers/playerSearch";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  playerProfile: playerProfileRouter,
  coachProfile: coachProfileRouter,
  tryouts: tryoutsRouter,
  combines: combinesRouter,
  messages: messagesRouter,
  playerSearch: playerSearchRouter,
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

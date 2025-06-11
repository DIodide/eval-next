import { greetingRouter } from "@/server/api/routers/greeting";
import { playerProfileRouter } from "@/server/api/routers/playerProfile";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
  playerProfile: playerProfileRouter,
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

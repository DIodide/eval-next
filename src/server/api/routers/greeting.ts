import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const greetingRouter = createTRPCRouter({
  hello: publicProcedure.query(() => "hello tRPC v11!"),
}); 
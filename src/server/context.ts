// Following https://clerk.com/docs/references/nextjs/trpc

import { auth } from "@clerk/nextjs/server";

export const createClerkContext = async () => {
  return { auth: await auth() };
};

// Create the tRPC context
export type Context = Awaited<ReturnType<typeof createClerkContext>>;

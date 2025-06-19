import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

// Cache configuration
const CACHE_DURATION = 300; // 5 minutes in seconds
const CACHE_STALE_DURATION = 600; // 10 minutes in seconds


/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};


const cachedRoutes = [
  'public',
]

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
    responseMeta(opts) {
      const { type, paths } = opts
      
      // Cache public queries for 5 minutes
      const publicPaths = paths?.filter(path => cachedRoutes.includes(path.toLowerCase()))
      
      if (type === 'query' && publicPaths?.length) {
        return {
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_STALE_DURATION}`
          }
        }
      }
      
      // Don't cache mutations or private queries
      return {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    },
  });

export { handler as GET, handler as POST };

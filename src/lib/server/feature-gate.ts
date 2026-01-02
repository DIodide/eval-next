import { TRPCError } from "@trpc/server";
import { hasFeatureAccess, type FeatureKey } from "./entitlements";

/**
 * tRPC middleware to gate procedures behind feature access
 * Usage:
 *
 * export const premiumProcedure = protectedProcedure
 *   .use(requireFeature(FEATURE_KEYS.PREMIUM_SEARCH));
 */
export function requireFeature(featureKey: FeatureKey) {
  return async ({ next, ctx }: { next: any; ctx: any }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const hasAccess = await hasFeatureAccess(ctx.auth.userId, featureKey);

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This feature requires access to: ${featureKey}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        hasFeatureAccess: true,
      },
    });
  };
}

import { UpgradePrompt } from "@/components/ui/upgrade-prompt";
import { FEATURE_KEYS, hasFeatureAccess } from "@/lib/server/plan-access";
import { auth } from "@clerk/nextjs/server";

export default async function BootcampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const hasAccess = await hasFeatureAccess(
    userId,
    FEATURE_KEYS.BOOTCAMP_ACCESS,
  );

  return (
    <div className="flex flex-col">
      {!hasAccess && (
        <div className="p-4 pb-0">
          <UpgradePrompt
            variant="banner"
            title="Bootcamp Access Required"
            description="Upgrade to EVAL+ to track progress and complete steps."
            ctaText="Unlock Bootcamp"
          />
        </div>
      )}
      {children}
    </div>
  );
}

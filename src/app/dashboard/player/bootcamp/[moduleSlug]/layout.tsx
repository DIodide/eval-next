import { UpgradePrompt } from "@/components/ui/upgrade-prompt";
import { FEATURE_KEYS, hasFeatureAccess } from "@/lib/server/plan-access";
import { auth } from "@clerk/nextjs/server";

export default async function BootcampModuleLayout({
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

  if (!hasAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <UpgradePrompt
          variant="full"
          title="Bootcamp Access Required"
          description="The EVAL Recruiting Bootcamp is available to EVAL+ subscribers. Upgrade to unlock all modules and track your progress."
          ctaText="Unlock Bootcamp"
        />
      </div>
    );
  }

  return <>{children}</>;
}

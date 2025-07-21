import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { staticPageMetadata } from "@/lib/server/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = staticPageMetadata.dashboard;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated (this is also handled by middleware, but good to be explicit)
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}

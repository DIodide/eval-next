import { staticPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = staticPageMetadata.leaguesDashboard;

// Client component import
import { LeaguesDashboardClientLayout } from "./client-layout";

export default function LeaguesDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LeaguesDashboardClientLayout>
      {children}
    </LeaguesDashboardClientLayout>
  );
} 
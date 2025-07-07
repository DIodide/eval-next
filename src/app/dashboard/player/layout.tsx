import { staticPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import PlayerDashboardClientLayout from "./client-layout";

export const metadata: Metadata = staticPageMetadata.playerDashboard;

export default function PlayerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerDashboardClientLayout>
      {children}
    </PlayerDashboardClientLayout>
  );
} 
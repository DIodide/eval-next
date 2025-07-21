import { staticPageMetadata } from "@/lib/server/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = staticPageMetadata.coachesDashboard;

// Client component import
import { CoachesDashboardClientLayout } from "./client-layout";

export default function CoachesDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CoachesDashboardClientLayout>{children}</CoachesDashboardClientLayout>
  );
}

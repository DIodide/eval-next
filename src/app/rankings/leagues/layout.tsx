import { staticPageMetadata } from "@/lib/server/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = staticPageMetadata.rankingsLeagues;

export default function RankingsLeaguesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

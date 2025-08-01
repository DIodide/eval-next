import { staticPageMetadata } from "@/lib/server/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = staticPageMetadata.rankingsCombines;

export default function RankingsCombinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { staticPageMetadata } from "@/lib/server/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = staticPageMetadata.news;

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { staticPageMetadata } from "@/lib/server/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = staticPageMetadata.recruiting;

export default function RecruitingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

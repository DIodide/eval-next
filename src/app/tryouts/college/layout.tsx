import { staticPageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = staticPageMetadata.tryoutsCollege

export default function TryoutsCollegeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
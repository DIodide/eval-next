import { staticPageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = staticPageMetadata.tryoutsCombines

export default function TryoutsCombinesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
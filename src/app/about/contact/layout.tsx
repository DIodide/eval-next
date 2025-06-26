import { staticPageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = staticPageMetadata.aboutContact

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
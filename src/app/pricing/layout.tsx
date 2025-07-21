import { staticPageMetadata } from "@/lib/server/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = staticPageMetadata.pricing;

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

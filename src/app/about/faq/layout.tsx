import { staticPageMetadata } from "@/lib/server/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = staticPageMetadata.aboutFaq;

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}

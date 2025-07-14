"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on any dashboard routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  
  if (isDashboardRoute) {
    return null;
  }
  
  return <Footer />;
} 
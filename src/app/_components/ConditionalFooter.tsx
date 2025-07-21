"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't show footer on dashboard or admin routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const shouldHideFooter = isDashboardRoute || isAdminRoute;

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}

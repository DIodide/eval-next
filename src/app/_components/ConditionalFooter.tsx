"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't show footer on dashboard, admin, or bootcamp routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isBootcampRoute = pathname.startsWith("/bootcamp");
  const shouldHideFooter = isDashboardRoute || isAdminRoute || isBootcampRoute;

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}

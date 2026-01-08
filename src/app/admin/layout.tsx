import { isCurrentUserAdmin } from "@/lib/server/admin-utils";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminClientLayout } from "./_components/AdminClientLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <AdminClientLayout>{children}</AdminClientLayout>;
}

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isCurrentUserAdmin } from "@/lib/server/admin-utils";
import { AdminNavigation } from "./_components/AdminNavigation";

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

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-900">
      <AdminNavigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

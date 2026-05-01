import { redirect } from "next/navigation";
import { db } from "@/server/db";

export default async function BootcampPage() {
  // Resolve the first published lesson of the first published module so the
  // public Step 1 stays addressable even if slugs change.
  const lesson = await db.lesson.findFirst({
    where: {
      order_index: 0,
      is_published: true,
      module: {
        order_index: 0,
        is_published: true,
        bootcamp: { slug: "recruit-bootcamp", is_published: true },
      },
    },
    select: { slug: true, module: { select: { slug: true } } },
  });

  if (!lesson) {
    redirect("/dashboard/player/bootcamp");
  }

  redirect(`/bootcamp/${lesson.module.slug}/${lesson.slug}`);
}

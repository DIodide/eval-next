import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EVAL Recruit Bootcamp | College Esports Recruiting Program",
  description:
    "Learn how to access college esports scholarship opportunities in 6 steps.",
};

export default function BootcampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim School Profile - EVAL Gaming",
  description:
    "Claim your school's esports profile on EVAL Gaming. Sign up as a coach to manage tryouts, recruit players, and build your competitive gaming program.",
  keywords: [
    "claim school",
    "esports coach",
    "college esports",
    "school profile",
    "coach registration",
    "EVAL Gaming",
  ],
  openGraph: {
    title: "Claim School Profile - EVAL Gaming",
    description:
      "Claim your school's esports profile on EVAL Gaming. Sign up as a coach to manage tryouts, recruit players, and build your competitive gaming program.",
    type: "website",
  },
};

export default function CoachOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

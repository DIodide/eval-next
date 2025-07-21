import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as a School - Build Your Esports Program & Recruit Talent",
  description:
    "Build your esports program and recruit talent. Create your school account on EVAL Gaming to establish collegiate esports programs, recruit players, and manage teams.",
  keywords: [
    "school signup",
    "college esports registration",
    "esports program",
    "collegiate gaming",
    "student recruitment",
    "school esports",
    "university gaming",
    "academic esports",
    "EVAL",
    "EVAL Gaming",
  ],
  openGraph: {
    title: "Join as a School - Build Your Esports Program & Recruit Talent",
    description:
      "Build your esports program and recruit talent. Create your school account on EVAL Gaming to establish collegiate esports programs, recruit players, and manage teams.",
    images: [
      {
        url: "https://evalgaming.com/api/og/sign-up-schools-og",
        width: 1200,
        height: 630,
        alt: "Join EVAL Gaming as a School",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join as a School - Build Your Esports Program & Recruit Talent",
    description:
      "Build your esports program and recruit talent. Create your school account on EVAL Gaming to establish collegiate esports programs, recruit players, and manage teams.",
    images: ["https://evalgaming.com/api/og/sign-up-schools-og"],
  },
};

export default function SchoolSignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

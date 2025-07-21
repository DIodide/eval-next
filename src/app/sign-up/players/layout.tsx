import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as a Player - Build Your Profile & Get Recruited",
  description:
    "Build your profile and get recruited. Create your player account on EVAL Gaming to showcase your skills, connect with coaches, and join competitive esports programs.",
  keywords: [
    "player signup",
    "esports player registration",
    "gaming profile",
    "player recruitment",
    "competitive gaming",
    "esports careers",
    "game stats",
    "player analytics",
    "EVAL",
    "EVAL Gaming",
  ],
  openGraph: {
    title: "Join as a Player - Build Your Profile & Get Recruited",
    description:
      "Build your profile and get recruited. Create your player account on EVAL Gaming to showcase your skills, connect with coaches, and join competitive esports programs.",
    images: [
      {
        url: "https://evalgaming.com/api/og/sign-up-players-og",
        width: 1200,
        height: 630,
        alt: "Join EVAL Gaming as a Player",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join as a Player - Build Your Profile & Get Recruited",
    description:
      "Build your profile and get recruited. Create your player account on EVAL Gaming to showcase your skills, connect with coaches, and join competitive esports programs.",
    images: ["https://evalgaming.com/api/og/sign-up-players-og"],
  },
};

export default function PlayerSignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

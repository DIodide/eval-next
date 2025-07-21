import type { Metadata } from "next";
import { api } from "@/trpc/server";

interface PlayerLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: PlayerLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const player = await api.playerProfile.getPublicProfile({
      username: resolvedParams.username,
    });

    if (!player) {
      return {
        title: "Player Not Found | EVAL",
        description: "The requested player profile could not be found.",
        robots: "noindex, nofollow",
      };
    }

    const displayName =
      player.first_name && player.last_name
        ? `${player.first_name} ${player.last_name}`
        : player.username;

    const title = `${displayName} - Player Profile | EVAL`;

    const descriptionParts = [`${displayName} is an esports player on EVAL`];
    if (player.main_game?.name)
      descriptionParts.push(`specializing in ${player.main_game.name}`);
    if (player.school ?? player.school_ref?.name)
      descriptionParts.push(`from ${player.school ?? player.school_ref?.name}`);
    if (player.class_year)
      descriptionParts.push(`graduating ${player.class_year}`);
    descriptionParts.push(
      "View their gaming achievements, stats, and recruitment information.",
    );

    const description = descriptionParts.join(" ");

    const keywordsList = [
      "esports player",
      "gaming profile",
      "college esports",
      "player recruitment",
      player.username,
      player.main_game?.name,
      player.school ?? player.school_ref?.name,
      "esports scholarships",
    ].filter((keyword): keyword is string => Boolean(keyword));

    return {
      title,
      description,
      keywords: keywordsList,
      openGraph: {
        title,
        description,
        type: "profile",
        url: `https://evalgaming.com/profiles/player/${player.username}`,
        images: [
          {
            url: `https://evalgaming.com/api/og/player-og/${player.username}`,
            width: 1200,
            height: 630,
            alt: `${displayName} - EVAL Player Profile`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`https://evalgaming.com/api/og/player-og/${player.username}`],
      },
    };
  } catch (error) {
    console.error("Error generating player metadata:", error);
    return {
      title: "Player Profile | EVAL",
      description:
        "View player profile on EVAL - the college esports recruiting platform.",
    };
  }
}

export default function PlayerLayout({ children }: PlayerLayoutProps) {
  return children;
}

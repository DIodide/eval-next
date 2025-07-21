import type { Metadata } from "next";
import { api } from "@/trpc/server";

interface SchoolLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: SchoolLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const school = await api.schoolProfile.getById({ id: resolvedParams.id });

    if (!school) {
      return {
        title: "School Not Found | EVAL",
        description: "The requested school profile could not be found.",
        robots: "noindex, nofollow",
      };
    }

    const title = `${school.name} - College Esports Program | EVAL`;

    const description = school.bio
      ? `${school.bio.substring(0, 150)}...`
      : `Discover ${school.name}'s esports program located in ${school.location}, ${school.state}. Connect with coaches, explore tryouts, and join competitive collegiate gaming teams.`;

    const keywordsList = [
      "college esports",
      "esports program",
      "collegiate gaming",
      "esports recruiting",
      school.name,
      school.location,
      school.state,
      school.type,
      "esports tryouts",
      "college gaming teams",
    ].filter((keyword): keyword is string => Boolean(keyword));

    return {
      title,
      description,
      keywords: keywordsList,
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://evalgaming.com/profiles/school/${school.id}`,
        images: [
          {
            url: `https://evalgaming.com/api/og/school-og/${school.id}`,
            width: 1200,
            height: 630,
            alt: `${school.name} - EVAL School Profile`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`https://evalgaming.com/api/og/school-og/${school.id}`],
      },
    };
  } catch (error) {
    console.error("Error generating school metadata:", error);
    return {
      title: "School Profile | EVAL",
      description:
        "View school profile on EVAL - the college esports recruiting platform.",
    };
  }
}

export default function SchoolLayout({ children }: SchoolLayoutProps) {
  return children;
}

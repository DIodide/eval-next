import type { Metadata } from 'next';
import { api } from '@/trpc/server';

interface LeagueLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LeagueLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  
  try {
    const league = await api.leagueAdminProfile.getLeagueById({ id: resolvedParams.id });
    
    if (!league) {
      return {
        title: 'League Not Found | EVAL',
        description: 'The requested league profile could not be found.',
        robots: 'noindex, nofollow',
      };
    }

    const title = `${league.name} - ${league.tier.replace('_', ' ')} League | EVAL`;
    
    const description = league.description 
      ? `${league.description.substring(0, 150)}...`
      : `${league.name} is a ${league.tier.toLowerCase().replace('_', ' ')} tier esports league in ${league.region}${league.state ? `, ${league.state}` : ''}. Join competitive gaming teams and participate in organized tournaments.`;
    
    const keywordsList = [
      'esports league',
      'competitive gaming',
      'esports tournament',
      'esports teams',
      league.name,
      league.short_name,
      league.region,
      league.state,
      league.tier,
      'college esports',
      'esports recruiting'
    ].filter((keyword): keyword is string => Boolean(keyword));

    return {
      title,
      description,
      keywords: keywordsList,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://evalgaming.com/profiles/leagues/${league.id}`,
        images: [
          {
            url: `https://evalgaming.com/api/og/league-og/${league.id}`,
            width: 1200,
            height: 630,
            alt: `${league.name} - EVAL League Profile`,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`https://evalgaming.com/api/og/league-og/${league.id}`],
      },
    };
  } catch (error) {
    console.error('Error generating league metadata:', error);
    return {
      title: 'League Profile | EVAL',
      description: 'View league profile on EVAL - the esports recruiting and tournament platform.',
    };
  }
}

export default function LeagueLayout({ children }: LeagueLayoutProps) {
  return children;
} 
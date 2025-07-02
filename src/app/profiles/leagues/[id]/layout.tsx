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
  
  // For now, return basic metadata. We can enhance this later when the API is stable
  return {
    title: 'League Profile | EVAL',
    description: 'View league profile on EVAL - the esports recruiting and tournament platform.',
    openGraph: {
      title: 'League Profile | EVAL',
      description: 'View league profile on EVAL - the esports recruiting and tournament platform.',
      type: 'website',
      url: `https://evalgaming.com/profiles/leagues/${resolvedParams.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'League Profile | EVAL',
      description: 'View league profile on EVAL - the esports recruiting and tournament platform.',
    },
  };
}

export default function LeagueLayout({ children }: LeagueLayoutProps) {
  return children;
} 
import type { Metadata } from 'next';

const SITE_NAME = 'EVAL';
const SITE_URL = 'https://evalgaming.com';
const DEFAULT_DESCRIPTION = 'The premier platform connecting student gamers with college esports programs and scholarships.';

interface BaseMetadataOptions {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}

interface PlayerMetadataOptions {
  username: string;
  firstName?: string;
  lastName?: string;
  mainGame?: string;
  school?: string;
  classYear?: string;
}

interface SchoolMetadataOptions {
  schoolName: string;
  schoolType: string;
  location: string;
  state: string;
  bio?: string;
}

interface EventMetadataOptions {
  title: string;
  description?: string;
  school?: string;
  game?: string;
  date?: string;
  type: 'tryout' | 'combine';
}

interface LeagueMetadataOptions {
  name: string;
  game?: string;
  region: string;
  tier: string;
  season: string;
}

export function generateMetadata(options: BaseMetadataOptions): Metadata {
  const title = options.title.includes(SITE_NAME) 
    ? options.title 
    : `${options.title} | ${SITE_NAME}`;
  
  const description = options.description ?? DEFAULT_DESCRIPTION;
  
  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      url: SITE_URL,
      type: 'website',
      images: options.image ? [
        {
          url: options.image,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: options.image ? [options.image] : undefined,
    },
    keywords: options.keywords,
    robots: options.noIndex ? 'noindex, nofollow' : 'index, follow',
  };

  return metadata;
}

export function generatePlayerMetadata(player: PlayerMetadataOptions): Metadata {
  const displayName = player.firstName && player.lastName 
    ? `${player.firstName} ${player.lastName}`
    : player.username;
  
  const title = `${displayName} - Player Profile`;
  
  const descriptionParts = [`${displayName} is an esports player on EVAL`];
  if (player.mainGame) descriptionParts.push(`specializing in ${player.mainGame}`);
  if (player.school) descriptionParts.push(`from ${player.school}`);
  if (player.classYear) descriptionParts.push(`graduating ${player.classYear}`);
  descriptionParts.push('View their gaming achievements, stats, and recruitment information.');
  
  const description = descriptionParts.join(' ');
  
  const keywords = [
    'esports player',
    'gaming profile',
    'college esports',
    'player recruitment',
    player.username,
    player.mainGame,
    player.school,
    'esports scholarships'
  ].filter(Boolean) as string[];

  return generateMetadata({
    title,
    description,
    keywords,
  });
}

export function generateSchoolMetadata(school: SchoolMetadataOptions): Metadata {
  const title = `${school.schoolName} - ${school.schoolType} Esports Program`;
  
  const description = school.bio 
    ? `${school.schoolName} esports program in ${school.location}, ${school.state}. ${school.bio.slice(0, 120)}...`
    : `Discover the ${school.schoolName} esports program in ${school.location}, ${school.state}. View their teams, tryouts, and recruitment opportunities for college esports.`;
  
  const keywords = [
    'college esports',
    'esports program',
    'college gaming',
    'esports scholarships',
    school.schoolName,
    school.location,
    school.state,
    school.schoolType.toLowerCase().replace('_', ' '),
    'esports recruitment',
    'gaming teams'
  ];

  return generateMetadata({
    title,
    description,
    keywords,
  });
}

export function generateEventMetadata(event: EventMetadataOptions): Metadata {
  const eventType = event.type === 'tryout' ? 'Tryout' : 'Combine';
  const title = `${event.title} - ${eventType}`;
  
  const descriptionParts = [`Join the ${event.title}`];
  if (event.school) descriptionParts.push(`hosted by ${event.school}`);
  if (event.game) descriptionParts.push(`for ${event.game}`);
  if (event.date) descriptionParts.push(`on ${event.date}`);
  descriptionParts.push(`Register now for this competitive esports ${event.type}.`);
  
  const description = event.description 
    ? `${event.description.slice(0, 120)}...`
    : descriptionParts.join(' ');
  
  const keywords = [
    `esports ${event.type}`,
    'college esports',
    'gaming competition',
    'esports registration',
    event.game,
    event.school,
    'competitive gaming',
    'esports recruitment'
  ].filter(Boolean) as string[];

  return generateMetadata({
    title,
    description,
    keywords,
  });
}

export function generateLeagueMetadata(league: LeagueMetadataOptions): Metadata {
  const title = `${league.name} - ${league.tier} League Rankings`;
  
  const description = `View the ${league.name} standings and rankings for ${league.season}. Track ${league.game ?? 'esports'} teams competing in the ${league.region} region at the ${league.tier.toLowerCase()} level.`;
  
  const keywords = [
    'esports league',
    'gaming rankings',
    'college esports',
    'esports standings',
    league.name,
    league.game,
    league.region,
    league.tier.toLowerCase(),
    'competitive gaming',
    'esports season'
  ].filter(Boolean) as string[];

  return generateMetadata({
    title,
    description,
    keywords,
  });
}

// Static page metadata generators
export const staticPageMetadata = {
  home: generateMetadata({
    title: 'EVAL - College Esports Recruiting Platform',
    description: 'The premier platform connecting student gamers with college esports programs and scholarships. Get ranked, get recruited, get scholarships.',
    keywords: ['college esports', 'esports scholarships', 'gaming recruitment', 'esports platform', 'student gamers', 'collegiate gaming'],
    image: 'https://evalgaming.com/api/home-og',
  }),

  recruiting: generateMetadata({
    title: 'Esports Recruiting - The Bridge Between Talent & Opportunity',
    description: 'The bridge between talent and opportunity. Connecting esports players with college programs through advanced analytics and recruitment tools. Access $50M+ in scholarships.',
    keywords: ['esports recruiting', 'college esports', 'esports scholarships', 'gaming recruitment', 'esports opportunities', 'talent bridge', 'college gaming'],
    image: 'https://evalgaming.com/api/recruiting-og',
  }),

  dashboard: generateMetadata({
    title: 'Dashboard - Your Esports Command Center',
    description: 'Your command center for esports success. Access analytics, insights, and control everything from your personalized dashboard.',
    keywords: ['esports dashboard', 'gaming analytics', 'performance tracking', 'esports insights', 'command center', 'esports management'],
    image: 'https://evalgaming.com/api/dashboard-og',
  }),

  pricing: generateMetadata({
    title: 'Pricing - EVAL Esports Platform',
    description: 'Choose the perfect plan for your esports journey. Affordable pricing for players and comprehensive solutions for coaches and schools.',
    keywords: ['esports platform pricing', 'college esports cost', 'gaming platform subscription', 'esports recruiting pricing'],
    image: 'https://evalgaming.com/api/pricing-og',
  }),


  aboutTeam: generateMetadata({
    title: 'Our Team - EVAL Leadership',
    description: 'Meet the passionate team behind EVAL, dedicated to transforming college esports and creating opportunities for student gamers.',
    keywords: ['EVAL team', 'esports leadership', 'gaming industry professionals', 'college esports experts'],
    image: 'https://evalgaming.com/api/team-og',
  }),

  aboutContact: generateMetadata({
    title: 'Contact Us - Get in Touch with EVAL',
    description: 'Contact the EVAL team for support, partnerships, or questions about our college esports recruiting platform.',
    keywords: ['contact EVAL', 'esports support', 'platform help', 'gaming platform contact'],
    image: 'https://evalgaming.com/api/contact-og',
  }),

  aboutFaq: generateMetadata({
    title: 'FAQ - Frequently Asked Questions',
    description: 'Find answers to common questions about EVAL, college esports recruiting, scholarships, and our platform features.',
    keywords: ['EVAL FAQ', 'esports questions', 'college gaming help', 'platform support', 'esports recruiting FAQ'],
    image: 'https://evalgaming.com/api/faq-og',
  }),

  aboutPartners: generateMetadata({
    title: 'Our Partners - EVAL Collaborations',
    description: 'Discover our trusted partners and collaborations that help make college esports opportunities accessible to all student gamers.',
    keywords: ['EVAL partners', 'esports partnerships', 'college gaming collaborations', 'educational partnerships'],
    image: 'https://evalgaming.com/api/partners-og',
  }),

  tryoutsCollege: generateMetadata({
    title: 'College Esports Tryouts - Find Your Team',
    description: 'Browse college esports tryouts across all games and skill levels. Register for tryouts and join competitive collegiate gaming teams.',
    keywords: ['college esports tryouts', 'collegiate gaming', 'esports teams', 'gaming tryouts', 'college recruiting'],
  }),

  tryoutsCombines: generateMetadata({
    title: 'Esports Combines - Elite Competition',
    description: 'Compete in elite esports combines to showcase your skills, earn rankings, and attract college recruiters. Join the best competitive gaming events.',
    keywords: ['esports combines', 'gaming competition', 'esports events', 'competitive gaming', 'skill showcase'],
  }),

  rankings: generateMetadata({
    title: 'Esports Rankings - Top Players & Teams',
    description: 'View comprehensive esports rankings for players, teams, and schools. Track performance across games and compete for top positions.',
    keywords: ['esports rankings', 'gaming leaderboards', 'player rankings', 'team standings', 'college esports stats'],
  }),

  rankingsLeagues: generateMetadata({
    title: 'League Rankings - Competitive Standings',
    description: 'Follow league standings and rankings across all competitive esports leagues. Track team performance and playoff positions.',
    keywords: ['esports leagues', 'league standings', 'competitive rankings', 'team standings', 'esports seasons'],
  }),

  rankingsCombines: generateMetadata({
    title: 'Combine Rankings - Elite Player Performance',
    description: 'View combine performance rankings and results from elite esports competitions. See who performed best in competitive gaming events.',
    keywords: ['combine rankings', 'esports performance', 'gaming competition results', 'elite players', 'competitive stats'],
  }),

  privacyPolicy: generateMetadata({
    title: 'Privacy Policy - EVAL',
    description: 'Read our privacy policy to understand how EVAL protects and uses your personal information on our esports recruiting platform.',
    keywords: ['privacy policy', 'data protection', 'user privacy', 'platform terms'],
    noIndex: false,
  }),

  termsOfService: generateMetadata({
    title: 'Terms of Service - EVAL',
    description: 'Review the terms of service for using the EVAL esports recruiting platform and our services.',
    keywords: ['terms of service', 'platform terms', 'user agreement', 'service terms'],
    noIndex: false,
  }),

  cookiePolicy: generateMetadata({
    title: 'Cookie Policy - EVAL',
    description: 'Learn about how EVAL uses cookies to improve your experience on our esports recruiting platform.',
    keywords: ['cookie policy', 'website cookies', 'data tracking', 'user experience'],
    noIndex: false,
  }),
}; 
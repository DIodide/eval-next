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
    'esports scholarships',
    'EVAL',
    'EVAL Gaming'
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
    'gaming teams',
    'EVAL',
    'EVAL Gaming'
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
    'esports recruitment',
    'EVAL',
    'EVAL Gaming'
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
    'esports season',
    'EVAL',
    'EVAL Gaming'
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
    keywords: ['college esports', 'esports scholarships', 'gaming recruitment', 'esports platform', 'student gamers', 'collegiate gaming', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/home-og',
  }),

  recruiting: generateMetadata({
    title: 'Esports Recruiting - The Bridge Between Talent & Opportunity',
    description: 'The bridge between talent and opportunity. Connecting esports players with college programs through advanced analytics and recruitment tools. Access $50M+ in scholarships.',
    keywords: ['esports recruiting', 'college esports', 'esports scholarships', 'gaming recruitment', 'esports opportunities', 'talent bridge', 'college gaming', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/recruiting-og',
  }),

  dashboard: generateMetadata({
    title: 'Dashboard - Your Esports Command Center',
    description: 'Your command center for esports success. Access analytics, insights, and control everything from your personalized dashboard.',
    keywords: ['esports dashboard', 'gaming analytics', 'performance tracking', 'esports insights', 'command center', 'esports management', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/dashboard-og',
  }),

  playerDashboard: generateMetadata({
    title: 'Player Dashboard - Track Your Gaming Journey',
    description: 'Track your gaming journey and achievements. Monitor your performance, stats, and progress toward your esports goals.',
    keywords: ['player dashboard', 'gaming progress', 'esports tracking', 'gaming achievements', 'performance stats', 'gaming journey', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/player-dashboard-og',
  }),

  coachesDashboard: generateMetadata({
    title: 'Coaches Dashboard - Recruit Talent & Build Your Team',
    description: 'Recruit talent and build your team. Access powerful coaching tools to discover players, manage prospects, and coordinate tryouts.',
    keywords: ['coaches dashboard', 'esports recruiting', 'coaching tools', 'talent recruitment', 'team building', 'player discovery', 'esports coaching', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/coaches-dashboard-og',
  }),

  leaguesDashboard: generateMetadata({
    title: 'League Dashboard - Manage Teams & Competitive Seasons',
    description: 'Manage teams and competitive seasons. Access powerful league administration tools to organize tournaments, track rankings, and coordinate esports competitions.',
    keywords: ['league dashboard', 'esports league management', 'tournament organization', 'team management', 'competitive seasons', 'esports administration', 'league tools', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/leagues-dashboard-og',
  }),

  tryoutsCombines: generateMetadata({
    title: 'Tryout Combines - Showcase Your Skills in Competitive Events',
    description: 'Showcase your skills in competitive esports events. Join tryout combines to demonstrate your abilities and get noticed by coaches and scouts.',
    keywords: ['tryout combines', 'esports tryouts', 'competitive events', 'skill showcase', 'player evaluation', 'esports recruitment', 'gaming competitions', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/tryouts-combines-og',
  }),

  tryoutsCollege: generateMetadata({
    title: 'College Tryouts - Join Collegiate Esports Teams & Programs',
    description: 'Join collegiate esports teams and programs. Find opportunities to compete at the college level and pursue esports scholarships.',
    keywords: ['college tryouts', 'collegiate esports', 'esports scholarships', 'college gaming', 'university esports', 'student athletes', 'academic gaming', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/tryouts-college-og',
  }),

  rankingsCombines: generateMetadata({
    title: 'Combine Rankings - See Where You Rank Among the Competition',
    description: 'See where you rank among the competition. Track your performance in combines and compare your skills against other players.',
    keywords: ['combine rankings', 'player rankings', 'esports leaderboards', 'competitive standings', 'skill rankings', 'performance metrics', 'player comparison', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/rankings-combines-og',
  }),

  rankingsLeagues: generateMetadata({
    title: 'League Rankings - Track Team Standings & League Competition',
    description: 'Track team standings and league competition. Follow league rankings, tournament brackets, and competitive seasons across multiple games.',
    keywords: ['league rankings', 'team standings', 'tournament brackets', 'competitive leagues', 'esports tournaments', 'season standings', 'league competition', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/rankings-leagues-og',
  }),

  pricing: generateMetadata({
    title: 'Pricing - EVAL Esports Platform',
    description: 'Choose the perfect plan for your esports journey. Affordable pricing for players and comprehensive solutions for coaches and schools.',
    keywords: ['esports platform pricing', 'college esports cost', 'gaming platform subscription', 'esports recruiting pricing', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/pricing-og',
  }),


  aboutTeam: generateMetadata({
    title: 'Our Team - EVAL Leadership',
    description: 'Meet the passionate team behind EVAL, dedicated to transforming college esports and creating opportunities for student gamers.',
    keywords: ['EVAL team', 'esports leadership', 'gaming industry professionals', 'college esports experts', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/team-og',
  }),

  aboutContact: generateMetadata({
    title: 'Contact Us - Get in Touch with EVAL',
    description: 'Contact the EVAL team for support, partnerships, or questions about our college esports recruiting platform.',
    keywords: ['contact EVAL', 'esports support', 'platform help', 'gaming platform contact', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/contact-og',
  }),

  aboutFaq: generateMetadata({
    title: 'FAQ - Frequently Asked Questions',
    description: 'Find answers to common questions about EVAL, college esports recruiting, scholarships, and our platform features.',
    keywords: ['EVAL FAQ', 'esports questions', 'college gaming help', 'platform support', 'esports recruiting FAQ', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/faq-og',
  }),

  aboutPartners: generateMetadata({
    title: 'Our Partners - EVAL Collaborations',
    description: 'Discover our trusted partners and collaborations that help make college esports opportunities accessible to all student gamers.',
    keywords: ['EVAL partners', 'esports partnerships', 'college gaming collaborations', 'educational partnerships', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/partners-og',
  }),

  rankings: generateMetadata({
    title: 'Esports Rankings - Top Players & Teams',
    description: 'View comprehensive esports rankings for players, teams, and schools. Track performance across games and compete for top positions.',
    keywords: ['esports rankings', 'gaming leaderboards', 'player rankings', 'team standings', 'college esports stats', 'EVAL', 'EVAL Gaming'],
  }),

  privacyPolicy: generateMetadata({
    title: 'Privacy Policy - How We Protect & Handle Your Data',
    description: 'How we protect and handle your data. Read our privacy policy to understand how EVAL protects and uses your personal information on our esports recruiting platform.',
    keywords: ['privacy policy', 'data protection', 'user privacy', 'platform terms', 'data security', 'personal information', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/privacy-policy-og',
    noIndex: false,
  }),

  termsOfService: generateMetadata({
    title: 'Terms of Service - Platform Terms & User Agreements',
    description: 'Platform terms and user agreements. Review the terms of service for using the EVAL esports recruiting platform and our services.',
    keywords: ['terms of service', 'platform terms', 'user agreement', 'service terms', 'legal terms', 'user obligations', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/tos-og',
    noIndex: false,
  }),

  cookiePolicy: generateMetadata({
    title: 'Cookie Policy - How We Use Cookies to Enhance Your Experience',
    description: 'How we use cookies to enhance your experience. Learn about how EVAL uses cookies to improve your experience on our esports recruiting platform.',
    keywords: ['cookie policy', 'website cookies', 'data tracking', 'user experience', 'web tracking', 'browser cookies', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/cookie-policy-og',
    noIndex: false,
  }),

  news: generateMetadata({
    title: 'EVAL News - Latest Insights & Platform Updates',
    description: 'Stay updated with the latest insights, platform updates, and industry news from the EVAL team. Get the latest in college esports and gaming recruitment.',
    keywords: ['EVAL news', 'esports news', 'platform updates', 'college gaming news', 'esports insights', 'gaming industry news', 'EVAL', 'EVAL Gaming'],
    image: 'https://evalgaming.com/api/og/news-og',
  }),
}; 
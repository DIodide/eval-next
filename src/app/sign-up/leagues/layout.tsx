import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join as a League - Organize Tournaments & Manage Competitions',
  description: 'Organize tournaments and manage competitions. Create your league account on EVAL Gaming to host tournaments, manage teams, and run competitive esports events.',
  keywords: [
    'league signup',
    'esports league registration',
    'tournament organization',
    'league management',
    'competitive esports',
    'tournament hosting',
    'esports events',
    'league administration',
    'EVAL',
    'EVAL Gaming'
  ],
  openGraph: {
    title: 'Join as a League - Organize Tournaments & Manage Competitions',
    description: 'Organize tournaments and manage competitions. Create your league account on EVAL Gaming to host tournaments, manage teams, and run competitive esports events.',
    images: [{
      url: 'https://evalgaming.com/api/sign-up-leagues-og',
      width: 1200,
      height: 630,
      alt: 'Join EVAL Gaming as a League'
    }],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join as a League - Organize Tournaments & Manage Competitions',
    description: 'Organize tournaments and manage competitions. Create your league account on EVAL Gaming to host tournaments, manage teams, and run competitive esports events.',
    images: ['https://evalgaming.com/api/sign-up-leagues-og']
  }
}

export default function LeagueSignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
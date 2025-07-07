import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Access Your Esports Platform & Continue Your Journey',
  description: 'Access your esports platform and continue your journey. Sign in to your EVAL Gaming account to manage your profile, track stats, and connect with the esports community.',
  keywords: [
    'sign in',
    'login',
    'esports platform access',
    'player login',
    'account access',
    'gaming platform',
    'esports community',
    'user authentication',
    'EVAL',
    'EVAL Gaming'
  ],
  openGraph: {
    title: 'Sign In - Access Your Esports Platform & Continue Your Journey',
    description: 'Access your esports platform and continue your journey. Sign in to your EVAL Gaming account to manage your profile, track stats, and connect with the esports community.',
    images: [{
      url: 'https://evalgaming.com/api/sign-in-og',
      width: 1200,
      height: 630,
      alt: 'Sign In to EVAL Gaming'
    }],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In - Access Your Esports Platform & Continue Your Journey',
    description: 'Access your esports platform and continue your journey. Sign in to your EVAL Gaming account to manage your profile, track stats, and connect with the esports community.',
    images: ['https://evalgaming.com/api/sign-in-og']
  }
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
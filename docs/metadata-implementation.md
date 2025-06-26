# Metadata Implementation Guide

This guide explains how to implement comprehensive SEO metadata across the EVAL platform using our custom metadata system. Email ia8920 for more info

## Overview

Our metadata system provides:

- **Static metadata** for fixed pages (about, pricing, etc.)
- **Dynamic metadata** for database-driven pages (player profiles, school profiles, etc.)
- **Layout-level metadata** for sections (tryouts, rankings, etc.)
- **Automatic Open Graph and Twitter Card generation**
- **SEO-optimized titles and descriptions**
- **Structured data preparation**

## File Structure

```
src/
├── lib/
│   └── metadata.ts              # Core metadata utilities
├── app/
│   ├── layout.tsx              # Enhanced root layout
│   │   ├── about/
│   │   │   ├── layout.tsx          # About section metadata
│   │   │   └── team/page.tsx       # Static page with metadata
│   │   ├── tryouts/
│   │   │   └── layout.tsx          # Tryouts section metadata
│   │   ├── rankings/
│   │   │   └── layout.tsx          # Rankings section metadata
│   │   └── profiles/
│   │       ├── player/[username]/
│   │       │   └── metadata.ts     # Dynamic player metadata
│   │       └── school/[id]/
│   │           └── metadata.ts     # Dynamic school metadata
│   └── docs/
│       └── metadata-implementation.md
```

## 1. Static Page Metadata

For static pages, use the pre-defined metadata from `staticPageMetadata`:

```typescript
// src/app/about/team/page.tsx
import { staticPageMetadata } from "@/lib/metadata";

export const metadata = staticPageMetadata.aboutTeam;

export default function TeamPage() {
  // ... your component
}
```

### Available Static Metadata

- `staticPageMetadata.home` - Homepage
- `staticPageMetadata.recruiting` - Recruiting page
- `staticPageMetadata.pricing` - Pricing page
- `staticPageMetadata.about` - About section
- `staticPageMetadata.aboutTeam` - About team page
- `staticPageMetadata.aboutContact` - Contact page
- `staticPageMetadata.aboutFaq` - FAQ page
- `staticPageMetadata.aboutPartners` - Partners page
- `staticPageMetadata.tryoutsCollege` - College tryouts
- `staticPageMetadata.tryoutsCombines` - Combines
- `staticPageMetadata.rankings` - Rankings
- `staticPageMetadata.rankingsLeagues` - League rankings
- `staticPageMetadata.rankingsCombines` - Combine rankings
- `staticPageMetadata.privacyPolicy` - Privacy policy
- `staticPageMetadata.termsOfService` - Terms of service
- `staticPageMetadata.cookiePolicy` - Cookie policy

## 2. Dynamic Page Metadata

For pages with dynamic content, create a `generateMetadata` function:

### Player Profile Example

```typescript
// src/app/profiles/player/[username]/page.tsx
import type { Metadata } from "next";
import { generatePlayerMetadata } from "@/lib/metadata";
import { db } from "@/server/db";

interface PlayerPageProps {
  params: { username: string };
}

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  try {
    const player = await db.player.findUnique({
      where: { username: params.username },
      include: {
        main_game: true,
        school_ref: true,
      },
    });

    if (!player) {
      return {
        title: "Player Not Found | EVAL",
        description: "The requested player profile could not be found.",
        robots: "noindex, nofollow",
      };
    }

    return generatePlayerMetadata({
      username: player.username ?? "",
      firstName: player.first_name,
      lastName: player.last_name,
      mainGame: player.main_game?.name,
      school: player.school ?? player.school_ref?.name,
      classYear: player.class_year ?? undefined,
    });
  } catch (error) {
    console.error("Error generating player metadata:", error);
    return {
      title: "Player Profile | EVAL",
      description:
        "View player profile on EVAL - College Esports Recruiting Platform",
      robots: "noindex, nofollow",
    };
  }
}

export default function PlayerPage({ params }: PlayerPageProps) {
  // ... your component
}
```

### School Profile Example

```typescript
// src/app/profiles/school/[id]/page.tsx
import { generateSchoolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const school = await db.school.findUnique({
    where: { id: params.id },
  });

  if (!school) {
    return {
      title: "School Not Found | EVAL",
      description: "The requested school profile could not be found.",
      robots: "noindex, nofollow",
    };
  }

  return generateSchoolMetadata({
    schoolName: school.name,
    schoolType: school.type,
    location: school.location,
    state: school.state,
    bio: school.bio ?? undefined,
  });
}
```

## 3. Layout-Level Metadata

For sections with multiple pages, use layout files:

```typescript
// src/app/tryouts/layout.tsx
import { staticPageMetadata } from "@/lib/metadata"

export const metadata = staticPageMetadata.tryoutsCollege;

export default function TryoutsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

## 4. Client Components

Since many pages are client components (`"use client"`), they can't export metadata directly. Use one of these approaches:

### Option 1: Layout File (Recommended)

Create a layout file for the section that provides metadata for all child pages.

### Option 2: Server Component Wrapper

Wrap the client component in a server component that exports metadata:

```typescript
// page.tsx (server component)
import { staticPageMetadata } from "@/lib/metadata"
import ClientComponent from "./client-component"

export const metadata = staticPageMetadata.pricing;

export default function Page() {
  return <ClientComponent />
}
```

```typescript
// client-component.tsx
"use client";

export default function ClientComponent() {
  // ... your client component logic
}
```

## 5. Enhanced Root Layout

The root layout provides comprehensive default metadata:

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "EVAL - College Esports Recruiting Platform",
    template: "%s | EVAL", // Creates "Page Title | EVAL" format
  },
  description:
    "The premier platform connecting student gamers with college esports programs and scholarships.",
  keywords: ["college esports", "esports scholarships", "gaming recruitment"],
  metadataBase: new URL("https://evalgaming.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://evalgaming.com",
    siteName: "EVAL",
    images: [
      {
        url: "/eval/logos/eLOGO_white.png",
        width: 1200,
        height: 630,
        alt: "EVAL - College Esports Recruiting Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@evalgaming",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

## 6. Custom Metadata Functions

For specific use cases, use the metadata generator functions:

### Event Metadata (Tryouts/Combines)

```typescript
import { generateEventMetadata } from "@/lib/metadata";

const eventMetadata = generateEventMetadata({
  title: "Princeton VALORANT Tryout",
  description: "Join Princeton University for competitive VALORANT tryouts",
  school: "Princeton University",
  game: "VALORANT",
  date: "2024-12-15",
  type: "tryout",
});
```

### League Metadata

```typescript
import { generateLeagueMetadata } from "@/lib/metadata";

const leagueMetadata = generateLeagueMetadata({
  name: "East Coast Collegiate League",
  game: "VALORANT",
  region: "East Coast",
  tier: "COMPETITIVE",
  season: "Fall 2024",
});
```

### Custom Metadata

```typescript
import { generateMetadata } from "@/lib/metadata";

const customMetadata = generateMetadata({
  title: "Custom Page Title",
  description: "Custom page description for SEO",
  keywords: ["custom", "keywords", "for", "seo"],
  image: "/path/to/custom-image.jpg",
  noIndex: false, // Set to true for private pages
});
```

## 7. Best Practices

### Title Guidelines

- Keep titles under 60 characters
- Include target keywords naturally
- Use consistent branding (| EVAL)
- Make titles unique and descriptive

### Description Guidelines

- Keep descriptions between 150-160 characters
- Include target keywords
- Write compelling, actionable descriptions
- Avoid duplicate descriptions

### Keywords

- Use 5-10 relevant keywords
- Include variations and synonyms
- Focus on user intent
- Avoid keyword stuffing

### Images

- Use 1200x630px for Open Graph images
- Ensure images are relevant and high-quality
- Include proper alt text
- Host images on your domain

## 8. Testing

Test your metadata using:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- Google Search Console
- Browser dev tools (view page source)

## 9. SEO Impact

This metadata system provides:

- ✅ **Better search rankings** through optimized titles and descriptions
- ✅ **Improved social sharing** with Open Graph and Twitter Cards
- ✅ **Enhanced user experience** with clear, descriptive page titles
- ✅ **Consistent branding** across all pages
- ✅ **Dynamic content optimization** for user-generated content
- ✅ **Technical SEO compliance** with proper robots directives

## 10. Maintenance

- **Update static metadata** when page content changes significantly
- **Monitor dynamic metadata** for database-driven pages
- **Check for metadata conflicts** between layout and page level
- **Regularly audit** metadata for accuracy and relevance
- **Test social sharing** after major updates

---

This metadata system ensures every page on the EVAL platform is optimized for search engines and social media sharing, providing better visibility and user engagement.

# EVAL Gaming - College Esports Recruiting Platform

A comprehensive platform connecting student gamers with college esports programs, featuring performance analytics, recruiting tools, and competitive opportunities across multiple gaming titles.

## Overview

EVAL Gaming bridges the gap between talented student gamers and college esports programs through a sophisticated recruiting platform. Players can showcase their skills through combines and leagues while building comprehensive profiles that highlight both gaming performance and academic achievements. Coaches can discover talent, manage tryouts, and build championship teams.

## Key Features

### For Players

- **Comprehensive Profiles**: Build detailed profiles showcasing gaming skills, academic achievements, and performance metrics
- **Performance Analytics**: Track EVAL Composite Scores for combines and leagues with detailed statistics
- **Tryout Management**: Register for college tryouts and track application status
- **Combine Participation**: Compete in performance-based combines to demonstrate skills
- **Recruiting Tools**: Connect with college coaches and manage recruitment conversations
- **Multi-Game Support**: Profiles and competition across VALORANT, Overwatch 2, Rocket League, and Super Smash Bros Ultimate

### For Coaches

- **Player Discovery**: Advanced search and filtering to find talent based on performance, location, and academic criteria
- **Tryout Organization**: Create and manage recruitment events with registration tracking
- **Prospect Management**: Build and maintain lists of potential recruits
- **Performance Evaluation**: Access detailed player analytics and EVAL scores
- **Team Building**: Recruit players across multiple gaming titles and competitive levels
- **Communication Hub**: Direct messaging system for recruitment discussions

### Platform Features

- **Rankings System**: Comprehensive league rankings and performance tracking
- **Multi-Game Support**: Full support for major esports titles with game-specific features
- **School Integration**: Verified school associations and program management
- **Real-time Analytics**: Live performance tracking and scoring systems
- **Mobile Responsive**: Full functionality across all devices

## Supported Games

- **VALORANT**: Agent specialization, rank tracking, role-based recruiting
- **Overwatch 2**: Hero pools, competitive ratings, team composition analysis
- **Rocket League**: Position specialization, ranking systems, mechanical skill assessment
- **Super Smash Bros Ultimate**: Character expertise, tournament performance, competitive analysis

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router and server components
- **TypeScript** - Type-safe development with strict configuration
- **Tailwind CSS** - Utility-first styling with custom design system
- **Radix UI** - Accessible component primitives with shadcn/ui
- **Framer Motion** - Smooth animations and transitions
- **React Hook Form** - Form management with Zod validation

### Backend

- **tRPC** - End-to-end typesafe APIs with React Query integration
- **Prisma ORM** - Type-safe database operations with PostgreSQL
- **PostgreSQL** - Primary database with UUID support and advanced features
- **Supabase** - Database hosting and real-time subscriptions

### Authentication & User Management

- **Clerk** - Complete authentication solution with social providers
- **Role-based Access** - Player and coach account types with granular permissions
- **Webhook Integration** - Real-time user synchronization

### Development & Deployment

- **ESLint** - Code quality enforcement with TypeScript integration
- **Prettier** - Code formatting with Tailwind CSS plugin
- **Vercel Analytics** - Performance monitoring and user insights
- **Ngrok** - Local development tunneling for webhook testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Clerk account for authentication
- (Optional) Supabase account for hosting

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd eval-next
   ```

2. **Install dependencies**

   ```bash
   npm install --force
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Configure the following environment variables:

   - `DATABASE_URL` - PostgreSQL connection string
   - `DIRECT_URL` - Direct database connection for migrations
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
   - `CLERK_SECRET_KEY` - Clerk secret key
   - Additional Clerk webhook and URL configurations

4. **Database setup**

   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:migrate   # Run database migrations
   npm run db:seed      # Seed with initial data
   ```

5. **Start development server**

   ```bash
   npm run dev          # Start Next.js with ngrok tunnel
   # or
   npm run dev:next     # Start Next.js only
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Scripts

### Development

- `npm run dev` - Start development server with ngrok tunnel
- `npm run dev:next` - Start Next.js development server only
- `npm run dev:ngrok` - Start ngrok tunnel for webhook testing

### Database

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Deploy database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio for database management
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset:full` - Reset database and reseed

### Quality & Testing

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run typecheck` - Run TypeScript type checking
- `npm run format:check` - Check code formatting
- `npm run format:write` - Apply code formatting

### Build & Deploy

- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run preview` - Build and preview production locally

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard and management
│   ├── api/               # API routes and webhooks
│   ├── dashboard/         # User dashboards (player/coach)
│   ├── profiles/          # Public profile pages
│   ├── rankings/          # League rankings and statistics
│   ├── tryouts/           # Tryout browsing and registration
│   └── _components/       # Shared page components
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── server/                # Backend logic
│   ├── api/               # tRPC routers and procedures
│   └── db.ts              # Database connection
├── styles/                # Global styles and Tailwind config
└── trpc/                  # tRPC client configuration

prisma/
├── schema.prisma          # Database schema
├── migrations/            # Database migration files
└── seed.ts               # Database seeding script

public/                    # Static assets
├── eval/                  # Platform branding and logos
└── [game-folders]/       # Game-specific assets
```

## Database Schema

The platform uses a comprehensive PostgreSQL schema with the following core models:

- **Users**: Player and Coach accounts with Clerk integration
- **Schools**: Educational institutions with verification
- **Games**: Supported esports titles with metadata
- **Profiles**: Game-specific player profiles and statistics
- **Events**: Tryouts and combines with registration management
- **Leagues**: Competitive leagues with rankings
- **Performance**: Detailed analytics and EVAL scoring
- **Communication**: Messaging system for recruitment

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the code style guidelines
4. Run tests and ensure build passes: `npm run build`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Alternative Platforms

- **Netlify**: Full Next.js support with edge functions
- **Railway**: Easy PostgreSQL and application hosting
- **AWS Amplify**: Enterprise-grade hosting with CDN

## License

This project is proprietary software. All rights reserved.

## Support

For questions, issues, or feature requests, please contact the development team or open an issue in the repository.

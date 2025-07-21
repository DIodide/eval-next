import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/server/db-utils";

// Input validation schema for public search
const publicSearchSchema = z.object({
  query: z.string().min(1).max(100), // Search query
  limit: z.number().min(1).max(20).default(10), // Limit results for autocomplete
});

// Result type definitions
const SearchResultType = z.enum(["PLAYER", "COACH", "SCHOOL", "LEAGUE"]);

export const publicSearchRouter = createTRPCRouter({
  // Public search endpoint for navbar autocomplete
  search: publicProcedure
    .input(publicSearchSchema)
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;
      
      try {
        // Search players by username, first_name, or last_name
        const playersPromise = withRetry(() =>
          ctx.db.player.findMany({
            where: {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { first_name: { contains: query, mode: 'insensitive' } },
                { last_name: { contains: query, mode: 'insensitive' } },
                {
                  AND: [
                    { first_name: { contains: query.split(' ')[0] ?? '', mode: 'insensitive' } },
                    { last_name: { contains: query.split(' ')[1] ?? '', mode: 'insensitive' } },
                  ]
                },
              ],
            },
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              image_url: true,
              school: true,
              main_game: {
                select: {
                  name: true,
                  short_name: true,
                  icon: true,
                  color: true,
                },
              },
            },
            take: Math.ceil(limit * 0.5), // Allocate ~50% to players
          })
        );

        // Search coaches by username, first_name, or last_name  
        const coachesPromise = withRetry(() =>
          ctx.db.coach.findMany({
            where: {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { first_name: { contains: query, mode: 'insensitive' } },
                { last_name: { contains: query, mode: 'insensitive' } },
                {
                  AND: [
                    { first_name: { contains: query.split(' ')[0] ?? '', mode: 'insensitive' } },
                    { last_name: { contains: query.split(' ')[1] ?? '', mode: 'insensitive' } },
                  ]
                },
              ],
            },
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              image_url: true,
              school: true,
              school_ref: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  logo_url: true,
                },
              },
            },
            take: Math.ceil(limit * 0.2), // Allocate ~20% to coaches
          })
        );

        // Search schools by name
        const schoolsPromise = withRetry(() =>
          ctx.db.school.findMany({
            where: {
              name: { contains: query, mode: 'insensitive' },
            },
            select: {
              id: true,
              name: true,
              type: true,
              location: true,
              state: true,
              logo_url: true,
            },
            take: Math.ceil(limit * 0.15), // Allocate ~15% to schools
          })
        );

        // Search leagues by name and short_name
        const leaguesPromise = withRetry(() =>
          ctx.db.league.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { short_name: { contains: query, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              name: true,
              short_name: true,
              description: true,
              logo_url: true,
              region: true,
              state: true,
              tier: true,
              season: true,
              status: true,
            },
            take: Math.ceil(limit * 0.15), // Allocate ~15% to leagues
          })
        );

        // Execute all searches in parallel
        const [players, coaches, schools, leagues] = await Promise.all([
          playersPromise,
          coachesPromise,
          schoolsPromise,
          leaguesPromise,
        ]);

        // Format results for autocomplete
        const results = [
          // Player results
          ...players.map(player => ({
            id: player.id,
            type: "PLAYER" as const,
            title: player.username ?? `${player.first_name} ${player.last_name}`,
            subtitle: player.school ?? "Independent Player",
            image_url: player.image_url,
            game: player.main_game ? {
              name: player.main_game.name,
              short_name: player.main_game.short_name,
              icon: player.main_game.icon,
              color: player.main_game.color,
            } : null,
            link: `/profiles/player/${player.username}`,
          })),
          
          // Coach results (link to their school)
          ...coaches.map(coach => ({
            id: coach.id,
            type: "COACH" as const,
            title: `${coach.first_name} ${coach.last_name}`,
            subtitle: `Coach at ${coach.school}`,
            image_url: coach.image_url,
            school: coach.school_ref ? {
              id: coach.school_ref.id,
              name: coach.school_ref.name,
              type: coach.school_ref.type,
              logo_url: coach.school_ref.logo_url,
            } : null,
            link: coach.school_ref ? `/profiles/school/${coach.school_ref.id}` : null,
          })),
          
          // School results
          ...schools.map(school => ({
            id: school.id,
            type: "SCHOOL" as const,
            title: school.name,
            subtitle: `${school.type.replace('_', ' ')} • ${school.location}, ${school.state}`,
            image_url: school.logo_url,
            link: `/profiles/school/${school.id}`,
          })),
          
          // League results
          ...leagues.map(league => ({
            id: league.id,
            type: "LEAGUE" as const,
            title: league.name,
            subtitle: `${league.tier.replace('_', ' ')} League • ${league.region}${league.state ? `, ${league.state}` : ''} • ${league.season}`,
            image_url: league.logo_url,
            link: `/profiles/leagues/${league.id}`,
          })),
        ];

        // Sort results by relevance (exact matches first, then by title)
        results.sort((a, b) => {
          const aExact = a.title.toLowerCase() === query.toLowerCase();
          const bExact = b.title.toLowerCase() === query.toLowerCase();
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          const aStarts = a.title.toLowerCase().startsWith(query.toLowerCase());
          const bStarts = b.title.toLowerCase().startsWith(query.toLowerCase());
          
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          return a.title.localeCompare(b.title);
        });

        return {
          results: results.slice(0, limit),
          total: results.length,
        };
      } catch (error) {
        console.error('Public search error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to perform search',
        });
      }
    }),
}); 
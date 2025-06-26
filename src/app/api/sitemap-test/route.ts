import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    // Test database connectivity and count records
    const [playerCount, schoolCount, leagueCount, tryoutCount, combineCount] = await Promise.all([
      db.player.count({
        where: {
          username: {
            not: null,
          },
        },
      }),
      db.school.count(),
      db.league.count({
        where: {
          status: {
            in: ['ACTIVE'],
          },
        },
      }),
      db.tryout.count({
        where: {
          status: {
            in: ['PUBLISHED'],
          },
        },
      }),
      db.combine.count({
        where: {
          status: {
            in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS'],
          },
        },
      }),
    ]);

    const stats = {
      database_connected: true,
      sitemap_url: '/sitemap.xml',
      dynamic_content_counts: {
        players_with_usernames: playerCount,
        schools: schoolCount,
        active_leagues: leagueCount,
        published_tryouts: tryoutCount,
        published_combines: combineCount,
      },
      estimated_total_urls: 15 + playerCount + schoolCount + leagueCount + tryoutCount + combineCount, // 15 static pages
      cache_info: {
        sitemap_cache_duration: '1 hour',
        error_fallback_cache: '5 minutes',
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      database_connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback_sitemap: 'Basic static sitemap will be served on error',
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    // Fetch all dynamic data in parallel for better performance
    const [players, schools, leagues, tryouts, combines] = await Promise.all([
      // Get all players with usernames for player profiles
      db.player.findMany({
        where: {
          username: {
            not: null,
          },
        },
        select: {
          username: true,
          updated_at: true,
        },
      }),
      
      // Get all schools for school profiles
      db.school.findMany({
        select: {
          id: true,
          updated_at: true,
        },
      }),
      
      // Get all active leagues for league rankings
      db.league.findMany({
        where: {
          status: {
            in: ['ACTIVE'],
          },
        },
        select: {
          id: true,
          updated_at: true,
        },
      }),
      
      // Get published tryouts
      db.tryout.findMany({
        where: {
          status: {
            in: ['PUBLISHED'],
          },
        },
        select: {
          id: true,
          updated_at: true,
        },
      }),
      
      // Get active combines
      db.combine.findMany({
        where: {
          status: {
            in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS'],
          },
        },
        select: {
          id: true,
          updated_at: true,
        },
      }),
    ]);

    // Generate the sitemap XML
    const sitemap = generateSitemapXML({
      players,
      schools,
      leagues,
      tryouts,
      combines,
    });

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap on error
    const basicSitemap = generateBasicSitemap();
    return new NextResponse(basicSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300', // Shorter cache on error
      },
    });
  }
}

interface SitemapData {
  players: { username: string | null; updated_at: Date }[];
  schools: { id: string; updated_at: Date }[];
  leagues: { id: string; updated_at: Date }[];
  tryouts: { id: string; updated_at: Date }[];
  combines: { id: string; updated_at: Date }[];
}

function generateSitemapXML(data: SitemapData): string {
  const baseUrl = 'https://evalgaming.com';
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const staticPages = [
    // Homepage
    { url: '/', priority: '1.0', changefreq: 'daily', lastmod: currentDate },
    
    // Main sections
    { url: '/recruiting/', priority: '0.9', changefreq: 'weekly', lastmod: currentDate },
    { url: '/tryouts/college/', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    { url: '/tryouts/combines/', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    { url: '/rankings/', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
    { url: '/rankings/leagues/', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    { url: '/rankings/combines/', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    
    // About section
    { url: '/about/', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    { url: '/about/team/', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    { url: '/about/contact/', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    { url: '/about/faq/', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    { url: '/about/partners/', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    
    // Commercial pages
    { url: '/pricing/', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    
    // Legal pages
    { url: '/privacy-policy/', priority: '0.3', changefreq: 'yearly', lastmod: currentDate },
    { url: '/tos/', priority: '0.3', changefreq: 'yearly', lastmod: currentDate },
    { url: '/cookie-policy/', priority: '0.3', changefreq: 'yearly', lastmod: currentDate },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static pages
  staticPages.forEach(page => {
    xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // Add dynamic player profiles
  data.players.forEach(player => {
    if (player.username) {
      const lastmod = player.updated_at.toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${baseUrl}/profiles/player/${encodeURIComponent(player.username)}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
  });

  // Add dynamic school profiles
  data.schools.forEach(school => {
    const lastmod = school.updated_at.toISOString().split('T')[0];
    xml += `
  <url>
    <loc>${baseUrl}/profiles/school/${school.id}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Add dynamic league pages
  data.leagues.forEach(league => {
    const lastmod = league.updated_at.toISOString().split('T')[0];
    xml += `
  <url>
    <loc>${baseUrl}/rankings/leagues/${league.id}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  // Add specific tryout pages
  data.tryouts.forEach(tryout => {
    const lastmod = tryout.updated_at.toISOString().split('T')[0];
    xml += `
  <url>
    <loc>${baseUrl}/tryouts/college/${tryout.id}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  // Add specific combine pages
  data.combines.forEach(combine => {
    const lastmod = combine.updated_at.toISOString().split('T')[0];
    xml += `
  <url>
    <loc>${baseUrl}/tryouts/combines/${combine.id}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  return xml;
}

function generateBasicSitemap(): string {
  const baseUrl = 'https://evalgaming.com';
  const currentDate = new Date().toISOString().split('T')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/recruiting/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/tryouts/college/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/tryouts/combines/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/rankings/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/rankings/leagues/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/rankings/combines/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about/team/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/about/contact/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/about/faq/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/about/partners/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/tos/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/cookie-policy/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;
} 
import { NextResponse } from 'next/server';
import { getAllPosts, getAllTags } from '@/lib/server/blog';

// Cache the API response for 1 hour
export const revalidate = 3600;

export async function GET() {
  try {
    const posts = getAllPosts();
    const tags = getAllTags();
    
    const response = NextResponse.json({ posts, tags });
    
    // Add cache headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`
    );
    
    return response;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
} 
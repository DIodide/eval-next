import 'server-only';
// src/lib/blog.ts
// This file contains the blog utility functions for the API.
// It is used to handle blog posts and metadata.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  coverImage?: string;
  tags: string[];
  readingTime: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
  published: boolean;
  showTableOfContents?: boolean;
}

export interface BlogMetadata {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  coverImage?: string;
  tags: string[];
  readingTime: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
  published: boolean;
  showTableOfContents?: boolean;
}

interface PostFrontmatter {
  title?: string;
  excerpt?: string;
  date?: string;
  author?: string;
  coverImage?: string;
  tags?: string[];
  published?: boolean;
  showTableOfContents?: boolean;
}

const postsDirectory = path.join(process.cwd(), 'content/blog');

// Cache for blog posts
let cachedPosts: BlogPost[] | null = null;
let cachedPostsMap: Map<string, BlogPost> | null = null;
let lastCacheTime: number | null = null;

// Cache duration in milliseconds (1 second in development, 1 hour in production)
const CACHE_DURATION = process.env.NODE_ENV === 'development' ? 1000 : 60 * 60 * 1000;

// Function to check if cache is still valid
function isCacheValid(): boolean {
  if (!lastCacheTime) return false;
  return Date.now() - lastCacheTime < CACHE_DURATION;
}

// Function to parse a single blog post file
function parsePostFile(filePath: string, slug: string): BlogPost | null {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const frontmatter = data as PostFrontmatter;
    const readingTimeStats = readingTime(content);

    return {
      slug,
      title: frontmatter.title ?? 'Untitled',
      excerpt: frontmatter.excerpt ?? '',
      content,
      date: frontmatter.date ?? new Date().toISOString(),
      author: frontmatter.author ?? 'EVAL Team',
      coverImage: frontmatter.coverImage ?? undefined,
      tags: frontmatter.tags ?? [],
      readingTime: readingTimeStats,
      published: frontmatter.published !== false,
      showTableOfContents: frontmatter.showTableOfContents ?? true, // Default to true
    };
  } catch (error) {
    console.error(`Error parsing blog post ${slug}:`, error);
    return null;
  }
}

// Function to load all posts and cache them
function loadAndCachePosts(): void {
  if (!fs.existsSync(postsDirectory)) {
    cachedPosts = [];
    cachedPostsMap = new Map();
    lastCacheTime = Date.now();
    return;
  }

  try {
    const fileNames = fs.readdirSync(postsDirectory);
    const posts: BlogPost[] = [];
    const postsMap = new Map<string, BlogPost>();

    fileNames
      .filter(fileName => fileName.endsWith('.mdx'))
      .forEach(fileName => {
        const slug = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const post = parsePostFile(fullPath, slug);
        
        if (post) {
          posts.push(post);
          postsMap.set(slug, post);
        }
      });

    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    cachedPosts = posts;
    cachedPostsMap = postsMap;
    lastCacheTime = Date.now();
  } catch (error) {
    console.error('Error loading blog posts:', error);
    cachedPosts = [];
    cachedPostsMap = new Map();
    lastCacheTime = Date.now();
  }
}

// Function to ensure posts are loaded and cached
function ensurePostsLoaded(): void {
  if (!isCacheValid() || !cachedPosts || !cachedPostsMap) {
    loadAndCachePosts();
  }
}

export function getAllPosts(): BlogMetadata[] {
  ensurePostsLoaded();
  
  return cachedPosts!
    .filter(post => post.published)
    .map(({ content, ...post }) => post); // Remove content from metadata
}

export function getPostBySlug(slug: string): BlogPost | null {
  ensurePostsLoaded();
  
  const post = cachedPostsMap!.get(slug);
  return post?.published ? post : null;
}

export function getPostSlugs(): string[] {
  ensurePostsLoaded();
  
  return cachedPosts!
    .filter(post => post.published)
    .map(post => post.slug);
}

export function getAllTags(): string[] {
  ensurePostsLoaded();
  
  const allTags = cachedPosts!
    .filter(post => post.published)
    .flatMap(post => post.tags);
  
  return [...new Set(allTags)].sort();
}

// Function to invalidate cache (useful for development or when posts are updated)
// export function invalidateBlogCache(): void {
//   cachedPosts = null;
//   cachedPostsMap = null;
//   lastCacheTime = null;
// }

// Function to get blog statistics
export function getBlogStats() {
  ensurePostsLoaded();
  
  const publishedPosts = cachedPosts!.filter(post => post.published);
  const totalWords = publishedPosts.reduce((sum, post) => sum + post.readingTime.words, 0);
  const totalReadingTime = publishedPosts.reduce((sum, post) => sum + post.readingTime.minutes, 0);
  
  return {
    totalPosts: publishedPosts.length,
    totalWords,
    totalReadingTime,
    tags: getAllTags(),
    authors: [...new Set(publishedPosts.map(post => post.author))],
  };
}

export function getPostsByTag(tag: string): BlogMetadata[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => 
    post.tags.some((postTag) => postTag.toLowerCase() === tag.toLowerCase())
  );
}

export function searchPosts(query: string): BlogMetadata[] {
  const allPosts = getAllPosts();
  const lowerQuery = query.toLowerCase();
  
  return allPosts.filter((post) => 
    post.title.toLowerCase().includes(lowerQuery) ||
    post.excerpt.toLowerCase().includes(lowerQuery) ||
    post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
} 
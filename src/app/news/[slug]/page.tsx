import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getPostSlugs } from "@/lib/blog";
import { ShareButton } from "./_components/ShareButton";
import { EnhancedTableOfContents } from "@/components/ui/enhanced-table-of-contents";
import BlogPostContent from "./_components/BlogPostContent";
import GameConnectionsPanel from "./_components/GameConnectionsPanel";
import BlogGameAnalyticsPanel from "./_components/BlogGameAnalyticsPanel";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  showTableOfContents?: boolean;
  audience?: string;
  content: string;
  slug: string;
  readingTime: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
}

// Helper function to create URL-friendly slugs
const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to safely convert React node to string
const nodeToString = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return node.toString();
  if (Array.isArray(node)) return node.map(nodeToString).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = node.props as { children?: React.ReactNode };
    return nodeToString(props.children);
  }
  return '';
};

// MDX Components with EVAL styling and proper IDs
const mdxComponents = {
  h1: ({ children }: { children: React.ReactNode }) => {
    const id = createSlug(nodeToString(children) ?? '');
    return (
      <h1 id={id} className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-6 leading-tight scroll-mt-24">
        {children}
      </h1>
    );
  },
  h2: ({ children }: { children: React.ReactNode }) => {
    const id = createSlug(nodeToString(children) ?? '');
    return (
      <h2 id={id} className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-4 mt-8 leading-tight scroll-mt-24">
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children: React.ReactNode }) => {
    const id = createSlug(nodeToString(children) ?? '');
    return (
      <h3 id={id} className="text-xl md:text-2xl font-orbitron font-bold text-white mb-3 mt-6 leading-tight scroll-mt-24">
        {children}
      </h3>
    );
  },
  h4: ({ children }: { children: React.ReactNode }) => {
    const id = createSlug(nodeToString(children) ?? '');
    return (
      <h4 id={id} className="text-lg md:text-xl font-orbitron font-bold text-white mb-2 mt-4 leading-tight scroll-mt-24">
        {children}
      </h4>
    );
  },
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-gray-300 font-rajdhani text-lg leading-relaxed mb-4">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="text-gray-300 font-rajdhani text-lg leading-relaxed mb-4 list-disc list-inside space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="text-gray-300 font-rajdhani text-lg leading-relaxed mb-4 list-decimal list-inside space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-gray-300 font-rajdhani text-lg leading-relaxed">
      {children}
    </li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-cyan-500 bg-gray-800/50 pl-6 py-4 my-6 text-gray-300 font-rajdhani text-lg italic">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="bg-gray-800 text-cyan-400 px-2 py-1 rounded font-mono text-sm">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-gray-800 text-cyan-400 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm">
      {children}
    </pre>
  ),
  a: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-cyan-400 hover:text-cyan-300 underline transition-colors cursor-pointer"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  img: ({ src, alt }: { src: string; alt?: string }) => (
    <div className="my-8">
      <Image
        src={src}
        alt={alt ?? ""}
        width={800}
        height={400}
        className="rounded-lg shadow-lg w-full h-auto"
      />
    </div>
  ),
  hr: () => (
    <hr className="border-gray-700 my-8" />
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse border border-gray-700">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-gray-700 bg-gray-800 text-white font-orbitron font-bold p-3 text-left">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-gray-700 text-gray-300 font-rajdhani p-3">
      {children}
    </td>
  ),
  // Custom components for MDX
  GameConnectionsPanel,
  GameAnalyticsPanel: BlogGameAnalyticsPanel,
};

// Extract headings from MDX content for table of contents
function extractHeadings(content: string) {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      const level = match[1].length;
      const text = match[2];
      const id = createSlug(text);
      
      headings.push({
        level,
        text,
        id,
      });
    }
  }

  return headings;
}

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Enable static generation with ISR (Incremental Static Regeneration)
export const revalidate = 3600; // 1 hour

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const headings = extractHeadings(post.content);

  // Render MDX content on server
  const renderedContent = (
    <MDXRemote 
      source={post.content}
      components={mdxComponents}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative h-96 md:h-[500px]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/40" />
          </div>
        )}
        
        {/* Content Overlay */}
        <div className={`${post.coverImage ? 'absolute inset-0 flex items-end' : 'relative bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-orange-500/10 border-b border-white/10'}`}>
          <div className="w-full">
            <div className="container mx-auto px-4 py-8 md:py-12">
              {/* Back Button */}
              <Link href="/news" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-rajdhani">Back to News</span>
              </Link>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-rajdhani">{formatDate(post.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-rajdhani">{post.readingTime.text}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="font-rajdhani">{post.author}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-orbitron font-black text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-cyan-400/60 text-cyan-300 bg-cyan-400/10 backdrop-blur-sm"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Share Button */}
              <ShareButton
                title={post.title}
                excerpt={post.excerpt}
                url={`${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://evalgaming.com'}/news/${post.slug}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Article Content with Sidebar */}
      <div className="w-full">
        <div className="w-full">
          <div className={`grid grid-cols-1 ${post.showTableOfContents && headings.length > 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-0`}>
            {/* Sidebar - Table of Contents */}
            {post.showTableOfContents && headings.length > 0 && (
              <div className="lg:col-span-1 order-2 lg:order-1 bg-gray-900/30 border-r border-gray-700/50">
                <div className="lg:sticky lg:top-[68px]">
                  <EnhancedTableOfContents 
                    items={headings.map(h => ({ 
                      id: h.id, 
                      text: h.text, 
                      level: h.level 
                    }))}
                    variant="sidebar"
                    title="Table of Contents"
                    sticky={true}
                  />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={`${post.showTableOfContents && headings.length > 0 ? 'lg:col-span-3' : 'lg:col-span-1'} order-1 lg:order-2`}>
                          <BlogPostContent post={post} renderedContent={renderedContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
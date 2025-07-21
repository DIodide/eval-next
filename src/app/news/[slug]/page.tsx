import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getPostSlugs } from "@/lib/server/blog";
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
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Helper function to safely convert React node to string
const nodeToString = (node: React.ReactNode): string => {
  if (typeof node === "string") return node;
  if (typeof node === "number") return node.toString();
  if (Array.isArray(node)) return node.map(nodeToString).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: React.ReactNode };
    return nodeToString(props.children);
  }
  return "";
};

// MDX Components with EVAL styling and proper IDs
const mdxComponents = {
  h1: ({ children }: { children: React.ReactNode }) => {
    const id = createSlug(nodeToString(children) ?? "");
    return (
      <h1
        id={id}
        className="font-orbitron mb-6 scroll-mt-24 text-3xl leading-tight font-bold text-white md:text-4xl"
      >
        {children}
      </h1>
    );
  },
  h2: ({ children }: { children: React.ReactNode }) => {
    const id = createSlug(nodeToString(children) ?? "");
    return (
      <h2
        id={id}
        className="font-orbitron mt-8 mb-4 scroll-mt-24 text-2xl leading-tight font-bold text-white md:text-3xl"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children: React.ReactNode }) => {
    const id = createSlug(nodeToString(children) ?? "");
    return (
      <h3
        id={id}
        className="font-orbitron mt-6 mb-3 scroll-mt-24 text-xl leading-tight font-bold text-white md:text-2xl"
      >
        {children}
      </h3>
    );
  },
  h4: ({ children }: { children: React.ReactNode }) => {
    const id = createSlug(nodeToString(children) ?? "");
    return (
      <h4
        id={id}
        className="font-orbitron mt-4 mb-2 scroll-mt-24 text-lg leading-tight font-bold text-white md:text-xl"
      >
        {children}
      </h4>
    );
  },
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="font-rajdhani mb-4 text-lg leading-relaxed text-gray-300">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="font-rajdhani mb-4 list-inside list-disc space-y-2 text-lg leading-relaxed text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="font-rajdhani mb-4 list-inside list-decimal space-y-2 text-lg leading-relaxed text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="font-rajdhani text-lg leading-relaxed text-gray-300">
      {children}
    </li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="font-rajdhani my-6 border-l-4 border-cyan-500 bg-gray-800/50 py-4 pl-6 text-lg text-gray-300 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="rounded bg-gray-800 px-2 py-1 font-mono text-sm text-cyan-400">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-800 p-4 font-mono text-sm text-cyan-400">
      {children}
    </pre>
  ),
  a: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="cursor-pointer text-cyan-400 underline transition-colors hover:text-cyan-300"
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
        className="h-auto w-full rounded-lg shadow-lg"
      />
    </div>
  ),
  hr: () => <hr className="my-8 border-gray-700" />,
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse border border-gray-700">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="font-orbitron border border-gray-700 bg-gray-800 p-3 text-left font-bold text-white">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="font-rajdhani border border-gray-700 p-3 text-gray-300">
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const headings = extractHeadings(post.content);

  // Render MDX content on server
  const renderedContent = (
    <MDXRemote source={post.content} components={mdxComponents} />
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
        <div
          className={`${post.coverImage ? "absolute inset-0 flex items-end" : "relative border-b border-white/10 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-orange-500/10"}`}
        >
          <div className="w-full">
            <div className="container mx-auto px-4 py-8 md:py-12">
              {/* Back Button */}
              <Link
                href="/news"
                className="mb-6 inline-flex cursor-pointer items-center gap-2 text-cyan-400 transition-colors hover:text-cyan-300"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-rajdhani">Back to News</span>
              </Link>

              {/* Article Meta */}
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="font-rajdhani">{formatDate(post.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-rajdhani">{post.readingTime.text}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="font-rajdhani">{post.author}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-orbitron mb-6 text-4xl leading-tight font-black text-white md:text-6xl">
                {post.title}
              </h1>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-cyan-400/60 bg-cyan-400/10 text-cyan-300 backdrop-blur-sm"
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Share Button */}
              <ShareButton
                title={post.title}
                excerpt={post.excerpt}
                url={`${process.env.NEXT_PUBLIC_BASE_URL ?? "https://evalgaming.com"}/news/${post.slug}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Article Content with Sidebar */}
      <div className="w-full">
        <div className="w-full">
          <div
            className={`grid grid-cols-1 ${post.showTableOfContents && headings.length > 0 ? "lg:grid-cols-4" : "lg:grid-cols-1"} gap-0`}
          >
            {/* Sidebar - Table of Contents */}
            {post.showTableOfContents && headings.length > 0 && (
              <div className="order-2 border-r border-gray-700/50 bg-gray-900/30 lg:order-1 lg:col-span-1">
                <div className="lg:sticky lg:top-[68px]">
                  <EnhancedTableOfContents
                    items={headings.map((h) => ({
                      id: h.id,
                      text: h.text,
                      level: h.level,
                    }))}
                    variant="sidebar"
                    title="Table of Contents"
                    sticky={true}
                  />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div
              className={`${post.showTableOfContents && headings.length > 0 ? "lg:col-span-3" : "lg:col-span-1"} order-1 lg:order-2`}
            >
              <BlogPostContent post={post} renderedContent={renderedContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

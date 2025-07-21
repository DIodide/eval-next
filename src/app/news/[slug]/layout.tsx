import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/server/blog";
import type { Metadata } from "next";

interface BlogPostLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | EVAL",
      description: "The requested blog post could not be found.",
    };
  }

  const ogImageUrl = `https://evalgaming.com/api/og/news-slug-og?slug=${encodeURIComponent(slug)}`;

  return {
    title: `${post.title} | EVAL News`,
    description: post.excerpt,
    keywords: [
      ...post.tags,
      "EVAL news",
      "esports news",
      "college esports",
      "gaming industry",
      "EVAL",
      "EVAL Gaming",
      post.author,
    ],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
    },
  };
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

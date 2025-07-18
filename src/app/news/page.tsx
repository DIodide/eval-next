import { Suspense } from "react";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { BlogListingClient } from "./_components/BlogListingClient";
import Image from "next/image";

// Enable static generation with ISR (Incremental Static Regeneration)
export const revalidate = 3600; // 1 hour

export default async function NewsPage() {
  // Fetch data at build time (with ISR)
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-orange-500/10 border-b border-white/10"
        style={{
          backgroundImage: 'url("/eval/news-bobbleheads.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <h1 className=" text-4xl md:text-6xl font-orbitron font-black text-white mb-6 leading-tight">
              EVAL NEWS
            </h1>
            <p className="text-xl text-gray-300 font-rajdhani max-w-3xl mx-auto leading-relaxed">
              Stay updated with the latest insights, platform updates, and industry news from the EVAL team.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 py-12">
        <Suspense fallback={
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading articles...</p>
          </div>
        }>
          <BlogListingClient initialPosts={posts} initialTags={tags} />
        </Suspense>
      </div>
    </div>
  );
} 
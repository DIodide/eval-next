import { Suspense } from "react";
import { getAllPosts, getAllTags } from "@/lib/server/blog";
import { BlogListingClient } from "./_components/BlogListingClient";

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
        className="relative border-b border-white/10 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-orange-500/10"
        style={{
          backgroundImage: 'url("/eval/news 4.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <h1
              className="font-orbitron mb-6 text-4xl leading-tight font-black text-white md:text-6xl"
              style={{
                textShadow: `
                2px 2px 0 #000,
                -2px -2px 0 #000,
                2px -2px 0 #000,
                -2px 2px 0 #000,
                0 0 10px rgba(0,0,0,0.8),
                0 0 20px rgba(0,0,0,0.8)
              `,
              }}
            >
              EVAL NEWS
            </h1>
            <p
              className="font-orbitron mx-auto max-w-3xl text-3xl text-gray-100"
              style={{
                textShadow: `
                1px 1px 0 #000,
                -1px -1px 0 #000,
                1px -1px 0 #000,
                -1px 1px 0 #000,
                0 0 10px rgba(0,0,0,0.8)
              `,
              }}
            >
              Stay updated with the latest insights, platform updates, and
              industry news from the EVAL team.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 py-12">
        <Suspense
          fallback={
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
              <p className="mt-4 text-gray-300">Loading articles...</p>
            </div>
          }
        >
          <BlogListingClient initialPosts={posts} initialTags={tags} />
        </Suspense>
      </div>
    </div>
  );
}

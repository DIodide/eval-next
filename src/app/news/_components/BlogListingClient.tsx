"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, Tag, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { type BlogMetadata } from "@/lib/server/blog";

interface BlogListingClientProps {
  initialPosts: BlogMetadata[];
  initialTags: string[];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.3,
    },
  },
};

export function BlogListingClient({
  initialPosts,
  initialTags,
}: BlogListingClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  // Filter posts based on search and tag
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesTag = selectedTag === "" || post.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [initialPosts, searchQuery, selectedTag]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? "" : tag);
  };

  return (
    <>
      {/* Search and Filter Section */}
      <motion.div
        className="mb-8 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Search Bar */}
        <div className="relative mx-auto max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-gray-700 bg-gray-800/50 pl-10 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
          />
        </div>

        {/* Tags Filter */}
        {initialTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedTag === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag("")}
              className={
                selectedTag === ""
                  ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700"
                  : "border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
              }
            >
              All Posts
            </Button>
            {initialTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagClick(tag)}
                className={
                  selectedTag === tag
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700"
                    : "border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
                }
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Posts Grid */}
      <motion.div
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredPosts.length === 0 ? (
          <motion.div
            className="col-span-full py-12 text-center"
            variants={itemVariants}
          >
            <div className="font-rajdhani text-lg text-gray-400">
              {searchQuery || selectedTag
                ? "No posts found matching your criteria."
                : "No blog posts available yet."}
            </div>
            <p className="font-rajdhani mt-2 text-gray-500">
              Check back soon for exciting updates from the EVAL team!
            </p>
          </motion.div>
        ) : (
          filteredPosts.map((post) => (
            <motion.div
              key={post.slug}
              variants={itemVariants}
              whileHover="hover"
              initial="rest"
            >
              <Link href={`/news/${post.slug}`} className="cursor-pointer">
                <motion.div variants={cardHoverVariants}>
                  <Card className="group h-full cursor-pointer border-gray-700/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 transition-all duration-300 hover:border-cyan-500/50">
                    {/* Cover Image */}
                    {post.coverImage && (
                      <div className="relative bottom-6 h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-101"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="font-rajdhani">
                              {formatDate(post.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="font-rajdhani">
                              {post.readingTime.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      <CardTitle className="font-orbitron line-clamp-2 text-lg text-white transition-colors group-hover:text-cyan-400">
                        {post.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="font-rajdhani line-clamp-3 text-gray-300">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="border-gray-600 text-xs text-gray-400 transition-colors hover:border-cyan-400 hover:text-cyan-400"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="border-gray-600 text-xs text-gray-400"
                            >
                              +{post.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Author and Read More */}
                      <div className="flex items-center justify-between border-t border-gray-700/50 pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <User className="h-3 w-3" />
                          <span className="font-rajdhani">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-cyan-400 transition-colors group-hover:text-cyan-300">
                          <span className="font-rajdhani">Read More</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </>
  );
}

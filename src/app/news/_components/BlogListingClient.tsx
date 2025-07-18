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
import { type BlogMetadata } from "@/lib/blog";

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
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -5,
    transition: {
      duration: 0.3
    }
  }
};

export function BlogListingClient({ initialPosts, initialTags }: BlogListingClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  // Filter posts based on search and tag
  const filteredPosts = useMemo(() => {
    return initialPosts.filter(post => {
      const matchesSearch = searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = selectedTag === "" || post.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
  }, [initialPosts, searchQuery, selectedTag]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
          />
        </div>

        {/* Tags Filter */}
        {initialTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedTag === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag("")}
              className={selectedTag === "" 
                ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
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
                className={selectedTag === tag 
                  ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                  : "border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
                }
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Posts Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredPosts.length === 0 ? (
          <motion.div
            className="col-span-full text-center py-12"
            variants={itemVariants}
          >
            <div className="text-gray-400 text-lg font-rajdhani">
              {searchQuery || selectedTag ? "No posts found matching your criteria." : "No blog posts available yet."}
            </div>
            <p className="text-gray-500 mt-2 font-rajdhani">
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
                  <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 h-full cursor-pointer group">
                    {/* Cover Image */}
                    {post.coverImage && (
                      <div className="bottom-6 relative h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-101 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="font-rajdhani">{formatDate(post.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-rajdhani">{post.readingTime.text}</span>
                          </div>
                        </div>
                      </div>
                      
                      <CardTitle className="text-white font-orbitron text-lg group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 font-rajdhani line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-gray-600 text-gray-400"
                            >
                              +{post.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Author and Read More */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <User className="w-3 h-3" />
                          <span className="font-rajdhani">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors">
                          <span className="font-rajdhani">Read More</span>
                          <ChevronRight className="w-3 h-3" />
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
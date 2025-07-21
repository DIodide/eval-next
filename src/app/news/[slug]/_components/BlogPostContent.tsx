"use client";

import { useUser } from "@clerk/nextjs";
import { AlertTriangle } from "lucide-react";

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

interface BlogPostContentProps {
  post: BlogPost;
  renderedContent: React.ReactNode;
}

// Get audience display name
const getAudienceDisplayName = (audience: string) => {
  switch (audience) {
    case "player":
      return "players";
    case "school":
      return "schools/coaches";
    case "league":
      return "leagues";
    default:
      return audience;
  }
};

export default function BlogPostContent({
  post,
  renderedContent,
}: BlogPostContentProps) {
  const { user } = useUser();

  // Check if user matches the target audience
  const userType = user?.unsafeMetadata?.userType;
  const targetAudience = post.audience ?? "player";
  const userMatchesAudience = !targetAudience || userType === targetAudience;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800/90 to-gray-900/90">
      <div className="p-8 md:p-12">
        {/* Audience Warning */}
        {!userMatchesAudience && (
          <div className="mb-8 rounded-lg border border-yellow-700/30 bg-yellow-900/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
              <div>
                <h4 className="font-orbitron mb-1 text-sm font-semibold text-yellow-300">
                  Article Targeted for {getAudienceDisplayName(targetAudience)}
                </h4>
                <p className="font-rajdhani text-sm text-yellow-200">
                  This article is specifically designed for{" "}
                  {getAudienceDisplayName(targetAudience)}. Some interactive
                  elements may not work as expected for your account type.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-invert max-w-none">
          {renderedContent}
        </article>
      </div>
    </div>
  );
}

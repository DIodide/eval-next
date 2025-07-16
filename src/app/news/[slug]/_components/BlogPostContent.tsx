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
    case 'player':
      return 'players';
    case 'school':
      return 'schools/coaches';
    case 'league':
      return 'leagues';
    default:
      return audience;
  }
};

export default function BlogPostContent({ post, renderedContent }: BlogPostContentProps) {
  const { user } = useUser();
  
  // Check if user matches the target audience
  const userType = user?.unsafeMetadata?.userType;
  const targetAudience = post.audience ?? 'player';
  const userMatchesAudience = !targetAudience || userType === targetAudience;

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 min-h-screen">
      <div className="p-8 md:p-12">
        {/* Audience Warning */}
        {!userMatchesAudience && (
          <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-yellow-300 font-orbitron font-semibold text-sm mb-1">
                  Article Targeted for {getAudienceDisplayName(targetAudience)}
                </h4>
                <p className="text-yellow-200 text-sm font-rajdhani">
                  This article is specifically designed for {getAudienceDisplayName(targetAudience)}. 
                  Some interactive elements may not work as expected for your account type.
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
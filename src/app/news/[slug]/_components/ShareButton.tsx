"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  excerpt: string;
  url: string;
}

export function ShareButton({ title, excerpt, url }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: excerpt,
          url: url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        // You could show a toast notification here
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className="border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
    >
      <Share2 className="mr-2 h-4 w-4" />
      Share Article
    </Button>
  );
}

"use client";

import { useUser } from "@clerk/nextjs";
import { GameAnalyticsPanel } from "@/components/core/GameAnalyticsPanel";

// Wrapper component for GameAnalyticsPanel in blog posts
export default function BlogGameAnalyticsPanel() {
  const { user } = useUser();
  
  // Check if user is a player
  const userType = user?.unsafeMetadata?.userType;
  const isPlayer = userType === "player";
  
  // For players, show their own analytics
  if (isPlayer) {
    return (
      <GameAnalyticsPanel 
        viewMode="self"
        showHeader={true}
        showConnectionPrompts={true}
        defaultGame="valorant"
        openLinksInNewTab={true}
      />
    );
  }
  
  // For non-players, show a demo/placeholder with no connection prompts
  // Pass a dummy playerId to prevent unnecessary API calls
  return (
    <GameAnalyticsPanel 
      playerId="demo-user"
      viewMode="other"
      showHeader={true}
      showConnectionPrompts={false}
      defaultGame="valorant"
      openLinksInNewTab={true}
    />
  );
} 
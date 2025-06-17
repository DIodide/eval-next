'use client';

import { useRouteBackground } from '@/hooks/use-route-background';

export default function BackgroundManager() {
  useRouteBackground();
  
  // This component doesn't render anything, it just manages the background
  return null;
} 
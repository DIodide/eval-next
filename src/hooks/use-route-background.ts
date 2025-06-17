'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useRouteBackground() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    
    // Remove all background classes
    body.classList.remove('global-background', 'tryouts-combine-background');
    
    // Apply appropriate background based on route
    if (pathname.startsWith('/tryouts') || pathname.startsWith('/rankings')) {
      body.classList.add('tryouts-combine-background');
    } else {
      body.classList.add('global-background');
    }
    
    // Cleanup function to remove classes when component unmounts
    return () => {
      body.classList.remove('global-background', 'tryouts-combine-background');
    };
  }, [pathname]);
} 
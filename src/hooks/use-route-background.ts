'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useRouteBackground() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    const isMobile = window.innerWidth <= 768;
    
    // Remove all background classes
    body.classList.remove(
      'global-background', 'tryouts-combine-background', 'home-background',
      'global-background-mobile', 'tryouts-combine-background-mobile', 'home-background-mobile'
    );
    
    // Apply appropriate background based on route and device
    if (pathname === "/") {
      body.classList.add(isMobile ? 'home-background-mobile' : 'home-background');
    }
    else if (pathname.startsWith('/tryouts') || pathname.startsWith('/rankings')) {
      body.classList.add(isMobile ? 'tryouts-combine-background-mobile' : 'tryouts-combine-background');
    } else {
      body.classList.add(isMobile ? 'global-background-mobile' : 'global-background');
    }
    
    // Cleanup function to remove classes when component unmounts
    return () => {
      body.classList.remove(
        'global-background', 'tryouts-combine-background', 'home-background',
        'global-background-mobile', 'tryouts-combine-background-mobile', 'home-background-mobile'
      );
    };
  }, [pathname]);
} 
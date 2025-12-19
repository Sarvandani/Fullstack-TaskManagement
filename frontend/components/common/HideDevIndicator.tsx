'use client';

import { useEffect } from 'react';

export default function HideDevIndicator() {
  useEffect(() => {
    const moveIndicator = () => {
      // Move all iframes (Next.js dev indicator) to middle-bottom
      document.querySelectorAll('iframe').forEach(iframe => {
        iframe.style.position = 'fixed';
        iframe.style.bottom = '0';
        iframe.style.left = '50%';
        iframe.style.transform = 'translateX(-50%)';
        iframe.style.right = 'auto';
      });

      // Move any fixed bottom-left elements to middle-bottom
      document.querySelectorAll('*').forEach(el => {
        const htmlEl = el as HTMLElement;
        const style = window.getComputedStyle(htmlEl);
        const rect = htmlEl.getBoundingClientRect();
        
        // Check if element is at bottom-left corner
        if (
          (style.position === 'fixed' || style.position === 'absolute') &&
          rect.bottom < 100 && // Near bottom
          rect.left < 100 && // Near left
          (htmlEl.tagName === 'IFRAME' || 
           htmlEl.querySelector('iframe') || 
           htmlEl.textContent?.trim().toLowerCase() === 'n' ||
           htmlEl.getAttribute('title')?.toLowerCase().includes('next'))
        ) {
          htmlEl.style.position = 'fixed';
          htmlEl.style.bottom = '0';
          htmlEl.style.left = '50%';
          htmlEl.style.transform = 'translateX(-50%)';
          htmlEl.style.right = 'auto';
        }
      });
    };

    // Run immediately and multiple times
    moveIndicator();
    setTimeout(moveIndicator, 100);
    setTimeout(moveIndicator, 500);
    setTimeout(moveIndicator, 1000);

    // Use MutationObserver to catch dynamically added elements
    const observer = new MutationObserver(() => {
      moveIndicator();
    });

    // Start observing
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    // Also use interval as backup
    const interval = setInterval(moveIndicator, 200);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}


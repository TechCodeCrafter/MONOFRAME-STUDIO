'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface LiveWaitlistCountProps {
  /** Compact mode (smaller text) */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

export function LiveWaitlistCount({ compact = false, className = '' }: LiveWaitlistCountProps) {
  const [count, setCount] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // SSR-safe mount detection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load initial count from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const cached = localStorage.getItem('monoframe_waitlist_count');
    if (cached) {
      setCount(parseInt(cached, 10));
    }
  }, []);

  // Poll API every 30 seconds
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchCount = async () => {
      try {
        const response = await fetch('/api/waitlist');
        const data = await response.json();
        
        if (data.success && typeof data.count === 'number') {
          const newCount = data.count + 12487; // Base offset for demo purposes
          
          // Check if count changed
          if (newCount !== count) {
            setIsUpdating(true);
            setCount(newCount);
            localStorage.setItem('monoframe_waitlist_count', newCount.toString());
            
            // Reset glow after 1s
            setTimeout(() => setIsUpdating(false), 1000);
          }
        }
      } catch (error) {
        console.error('Failed to fetch waitlist count:', error);
      }
    };

    // Initial fetch
    fetchCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, [count]);

  if (!isMounted) {
    return null; // Prevent SSR hydration mismatch
  }

  const formattedCount = count.toLocaleString();

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center`}>
        <Users className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
      </div>
      <div>
        <div 
          className={`${
            compact ? 'text-xl' : 'text-2xl md:text-3xl'
          } font-bold transition-all duration-300 ${
            isUpdating ? 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'text-white/90'
          }`}
        >
          {formattedCount}
        </div>
        <div className={`${compact ? 'text-xs' : 'text-sm'} text-white/60 font-inter`}>
          creators waiting
        </div>
      </div>
    </div>
  );
}


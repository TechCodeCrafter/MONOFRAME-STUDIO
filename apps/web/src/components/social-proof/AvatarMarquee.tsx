'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const avatarPaths = Array.from({ length: 12 }, (_, i) => `/avatars/avatar-${i + 1}.png`);

export function AvatarMarquee() {
  const [speed, setSpeed] = useState(15); // seconds per loop
  const [isMounted, setIsMounted] = useState(false);

  // SSR-safe mount detection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen for new signups to speed up animation
  useEffect(() => {
    if (!isMounted) return;

    const handleNewSignup = () => {
      setSpeed(6); // Speed up to 6s
      setTimeout(() => setSpeed(15), 2000); // Reset after 2s
    };

    // Listen for custom event (can be dispatched from WaitlistSignup)
    window.addEventListener('waitlist-signup', handleNewSignup);

    return () => window.removeEventListener('waitlist-signup', handleNewSignup);
  }, [isMounted]);

  if (!isMounted) {
    return null; // Prevent SSR hydration mismatch
  }

  // Duplicate avatars for seamless loop
  const allAvatars = [...avatarPaths, ...avatarPaths];

  return (
    <div className="relative overflow-hidden py-6">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      {/* Scrolling container */}
      <div 
        className="flex gap-4"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          width: 'max-content',
        }}
      >
        {allAvatars.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 border border-white/20 overflow-hidden relative group hover:scale-110 hover:border-white/40 transition-all duration-200"
          >
            <Image
              src={src}
              alt={`Creator ${(i % 12) + 1}`}
              width={48}
              height={48}
              className="object-cover"
              onError={(e) => {
                // Fallback to colored circle with initials
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Fallback initials */}
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white/70">
              U{(i % 12) + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}


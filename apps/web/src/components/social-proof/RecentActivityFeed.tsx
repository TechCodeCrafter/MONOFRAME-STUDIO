'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

const activities = [
  { name: 'Alex', location: 'Toronto', action: 'joined the waitlist', icon: '📧' },
  { name: 'Sarah', location: 'Los Angeles', action: 'is editing a video', icon: '✂️' },
  { name: 'Mark', location: 'London', action: 'exported an AI cut', icon: '⬇️' },
  { name: 'Emma', location: 'Sydney', action: 'joined the waitlist', icon: '📧' },
  { name: 'David', location: 'New York', action: 'is editing a video', icon: '✂️' },
  { name: 'Lisa', location: 'Tokyo', action: 'exported an AI cut', icon: '⬇️' },
  { name: 'James', location: 'Berlin', action: 'joined the waitlist', icon: '📧' },
  { name: 'Sofia', location: 'Paris', action: 'is editing a video', icon: '✂️' },
  { name: 'Ryan', location: 'Miami', action: 'exported an AI cut', icon: '⬇️' },
  { name: 'Nina', location: 'Singapore', action: 'joined the waitlist', icon: '📧' },
];

export function RecentActivityFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // SSR-safe mount detection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rotate events every 6 seconds
  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // After fade out, change content
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 300);
    }, 6000);

    return () => clearInterval(interval);
  }, [isMounted]);

  if (!isMounted) {
    return null; // Prevent SSR hydration mismatch
  }

  const current = activities[currentIndex];

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
        </div>
        <h3 className="text-sm font-semibold text-white/80">Live Activity</h3>
      </div>

      <div 
        className={`transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Emoji Icon */}
          <div className="text-2xl">{current.icon}</div>
          
          {/* Activity Text */}
          <div className="flex-1">
            <p className="text-white/90 font-inter text-sm leading-relaxed">
              <span className="font-semibold text-white">{current.name}</span>
              {' '}from{' '}
              <span className="text-white/70">{current.location}</span>
              {' '}{current.action}
            </p>
            <p className="text-xs text-white/40 mt-1">Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}


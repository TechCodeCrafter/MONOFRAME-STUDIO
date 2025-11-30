'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Settings } from 'lucide-react';

/**
 * Global AppHeader - appears on all pages
 * Premium cinematic styling inspired by Linear, DaVinci Resolve, Blackmagic Cloud
 */
export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
        {/* Left: Logo + Product Name */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-icon.svg"
              alt="MonoFrame"
              width={28}
              height={28}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
          <span className="ml-3 text-white/70 tracking-wider font-semibold text-sm">
            MONOFRAME
          </span>
        </div>

        {/* Center: Current Route Title */}
        <div className="flex-1 flex justify-center">
          <span className="text-white/50 text-sm font-medium tracking-wide">
            {pathname}
          </span>
        </div>

        {/* Right: New Project + Avatar + Settings */}
        <div className="flex items-center gap-4">
          {/* New Project Button */}
          <Link
            href="/upload"
            className="
              px-4 py-2 bg-white text-black rounded-lg font-medium text-sm
              hover:shadow-[0_0_16px_rgba(255,255,255,0.3)]
              transition-all duration-300
            "
          >
            New Project
          </Link>

          {/* Circular Avatar Placeholder */}
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-white/60 text-xs font-semibold">U</span>
          </div>

          {/* Settings Icon */}
          <button className="text-white/60 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

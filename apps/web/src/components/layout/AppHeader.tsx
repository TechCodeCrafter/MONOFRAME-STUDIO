'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Global AppHeader - appears on all pages
 * Provides consistent navigation across the entire app
 */
export default function AppHeader() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard');
    }
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-mono-black/95 backdrop-blur-sm border-b border-mono-silver/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
        >
          <svg
            className="w-8 h-8 stroke-mono-white"
            viewBox="0 0 64 64"
            fill="none"
            strokeWidth="1.5"
          >
            <rect x="8" y="8" width="48" height="48" />
            <line x1="32" y1="8" x2="32" y2="56" />
            <line x1="8" y1="32" x2="56" y2="32" />
          </svg>
          <span className="font-montserrat font-bold text-xl text-mono-white">MONOFRAME</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          <Link
            href="/dashboard"
            className={`
              px-4 py-2 rounded font-inter text-sm transition-all
              ${
                isActive('/dashboard')
                  ? 'bg-mono-white/10 text-mono-white'
                  : 'text-mono-silver hover:text-mono-white hover:bg-mono-white/5'
              }
            `}
          >
            Dashboard
          </Link>
          <Link
            href="/upload"
            className={`
              px-4 py-2 rounded font-inter text-sm transition-all
              ${
                isActive('/upload')
                  ? 'bg-mono-white/10 text-mono-white'
                  : 'text-mono-silver hover:text-mono-white hover:bg-mono-white/5'
              }
            `}
          >
            Upload
          </Link>
          <Link
            href="/dashboard/new"
            className="
              ml-2 px-4 py-2 rounded font-montserrat font-semibold text-sm
              bg-mono-white text-mono-black
              hover:bg-mono-silver transition-colors
            "
          >
            New Project
          </Link>
        </nav>
      </div>
    </header>
  );
}

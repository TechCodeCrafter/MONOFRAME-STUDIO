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
    <header className="sticky top-0 z-50 h-16 backdrop-blur-xl bg-[#0a0a0a]/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto h-full px-8 flex items-center">
        {/* Navigation */}
        <nav className="flex items-center justify-end space-x-1 w-full">
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
              hover:bg-mono-silver hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]
              transition-all
            "
          >
            New Project
          </Link>
        </nav>
      </div>
    </header>
  );
}

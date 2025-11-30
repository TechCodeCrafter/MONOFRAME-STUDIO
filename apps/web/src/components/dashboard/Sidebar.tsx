'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Overview Section
  const overviewItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: 'New Project',
      href: '/upload',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      name: 'Demo Editor',
      href: '/demo',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
  ];

  // Tools Section (all disabled)
  const toolsItems = [
    {
      name: 'AI Templates',
      href: '#',
      disabled: true,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      name: 'Transitions',
      href: '#',
      disabled: true,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      name: 'Color Grades',
      href: '#',
      disabled: true,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 0 20" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-mono-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-[#0a0a0a] border-r border-white/10
          transition-transform duration-300 z-50
          w-56 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="py-6 px-6 border-b border-white/10">
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/logo-icon.svg"
                alt="MonoFrame"
                width={28}
                height={28}
                className="opacity-80 group-hover:opacity-100 transition-opacity duration-150"
              />
              <span className="font-montserrat font-bold text-xl text-white tracking-wide">MONOFRAME</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            {/* OVERVIEW Section */}
            <div className="mb-6">
              <div className="px-3 mb-2">
                <span className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                  OVERVIEW
                </span>
              </div>
              <div className="space-y-1">
                {overviewItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        relative flex items-center space-x-3 px-3 h-10 rounded-lg
                        font-inter text-sm transition-all duration-200
                        ${
                          active
                            ? 'text-white font-semibold bg-white/5'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {active && (
                        <div className="absolute left-0 h-full w-[3px] bg-white rounded-r"></div>
                      )}
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* TOOLS Section */}
            <div className="mb-6">
              <div className="px-3 mb-2">
                <span className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                  TOOLS
                </span>
              </div>
              <div className="space-y-1">
                {toolsItems.map((item) => (
                  <div
                    key={item.name}
                    className={`
                      relative flex items-center space-x-3 px-3 h-10 rounded-lg
                      font-inter text-sm
                      text-white/40 cursor-not-allowed
                    `}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-white/10">
            <button
              className="flex items-center space-x-3 px-3 h-10 rounded-lg w-full
                text-white/60 hover:text-white hover:bg-white/5
                font-inter text-sm transition-all duration-200"
            >
              <svg
                className="w-5 h-5 stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

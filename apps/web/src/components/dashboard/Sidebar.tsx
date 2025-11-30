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

  const menuItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: 'Projects',
      href: '/dashboard/projects',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      name: 'New Upload',
      href: '/upload',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
        </svg>
      ),
    },
  ];

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
          fixed top-0 left-0 h-full bg-mono-black border-r border-mono-silver/15
          transition-transform duration-300 z-50
          w-56 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="py-6 px-8 border-b border-mono-silver/15">
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/logo-icon.svg"
                alt="MonoFrame"
                width={28}
                height={28}
                className="opacity-80 group-hover:opacity-100 transition-opacity duration-150"
              />
              <span className="font-montserrat font-bold text-xl text-mono-white">MONOFRAME</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded
                    font-inter text-sm transition-all duration-150
                    ${
                      isActive
                        ? 'bg-[#ffffff14] text-mono-white border-l-2 border-white'
                        : 'text-mono-silver hover:text-mono-white hover:bg-[#ffffff08] hover:shadow-[0_0_8px_rgba(255,255,255,0.1)]'
                    }
                  `}
                >
                  <span className="stroke-current">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-mono-silver/15">
            <button
              className="flex items-center space-x-3 px-4 py-3 rounded w-full
                text-mono-silver hover:text-mono-white hover:bg-[#ffffff08] 
                hover:shadow-[0_0_8px_rgba(255,255,255,0.1)]
                font-inter text-sm transition-all duration-150"
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

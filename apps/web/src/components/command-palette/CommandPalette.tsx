'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandPalette } from './CommandPaletteProvider';
import { getProjects, type Project } from '@/lib/projectStore';

type CommandItem =
  | {
      type: 'project';
      id: string;
      title: string;
      status: string;
      createdAt: string;
    }
  | {
      type: 'action';
      id: string;
      label: string;
      description: string;
    };

export default function CommandPalette() {
  const router = useRouter();
  const { isOpen, close, query, setQuery } = useCommandPalette();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load projects when palette opens
  useEffect(() => {
    if (isOpen) {
      const loadedProjects = getProjects();
      setProjects(loadedProjects);
      setActiveIndex(0);
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Combine actions + projects into items
  const allItems: CommandItem[] = useMemo(() => {
    // Build actions
    const actions: CommandItem[] = [
      {
        type: 'action',
        id: 'new-project',
        label: 'New Project',
        description: 'Create a new AI-edited workspace',
      },
      {
        type: 'action',
        id: 'dashboard',
        label: 'Go to Dashboard',
        description: 'View all your projects',
      },
      {
        type: 'action',
        id: 'upload',
        label: 'Upload Video',
        description: 'Upload a new video for AI processing',
      },
    ];

    const projectItems: CommandItem[] = projects.map((p) => ({
      type: 'project' as const,
      id: p.id,
      title: p.title,
      status: p.status,
      createdAt: p.createdAt,
    }));

    return [...actions, ...projectItems];
  }, [projects]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return allItems;
    }

    const lowerQuery = query.toLowerCase();

    return allItems.filter((item) => {
      if (item.type === 'project') {
        return (
          item.title.toLowerCase().includes(lowerQuery) ||
          item.status.toLowerCase().includes(lowerQuery)
        );
      }

      if (item.type === 'action') {
        return (
          item.label.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery)
        );
      }

      return false;
    });
  }, [allItems, query]);

  // Reset active index when filtered items change
  useEffect(() => {
    setActiveIndex(filteredItems.length > 0 ? 0 : -1);
  }, [filteredItems.length]);

  // Handle selection
  const handleSelect = (item: CommandItem) => {
    if (item.type === 'project') {
      router.push(`/dashboard/${item.id}`);
      close();
    } else if (item.type === 'action') {
      if (item.id === 'new-project') {
        router.push('/dashboard/new');
      } else if (item.id === 'dashboard') {
        router.push('/dashboard');
      } else if (item.id === 'upload') {
        router.push('/upload');
      }
      close();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredItems.length) {
        handleSelect(filteredItems[activeIndex]);
      }
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Separate items by type for section rendering
  const actionItems = filteredItems.filter((item) => item.type === 'action');
  const projectItems = filteredItems.filter((item) => item.type === 'project');

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 backdrop-blur-sm pt-[15vh] px-4 animate-fade-in"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-mono-black border border-mono-silver/20 shadow-2xl overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search projects or actions…"
          aria-label="Search projects or actions"
          className="w-full bg-transparent px-6 py-4 text-base text-mono-white placeholder:text-mono-silver/60 
            focus:outline-none border-b border-mono-silver/15 font-inter"
        />

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filteredItems.length === 0 ? (
            // Empty state
            <div className="px-6 py-8 text-center">
              <p className="font-inter text-sm text-mono-silver/60">
                No matches. Try a different keyword.
              </p>
            </div>
          ) : (
            <>
              {/* Actions Section */}
              {actionItems.length > 0 && (
                <div className="mb-2">
                  <div className="px-6 py-2">
                    <p className="font-montserrat text-xs font-semibold text-mono-silver/50 uppercase tracking-wider">
                      Actions
                    </p>
                  </div>
                  {actionItems.map((item) => {
                    const globalIndex = filteredItems.indexOf(item);
                    const isActive = globalIndex === activeIndex;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`
                          w-full flex items-center justify-between px-6 py-3 text-sm cursor-pointer 
                          transition-colors font-inter
                          ${
                            isActive
                              ? 'bg-mono-slate text-mono-white'
                              : 'text-mono-silver hover:bg-mono-slate/60'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <svg
                            className="w-4 h-4 stroke-current"
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                          </svg>
                          <div className="text-left">
                            <p className="font-semibold">{item.label}</p>
                            <p className="text-xs text-mono-silver/70">{item.description}</p>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 stroke-mono-silver"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="2"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Projects Section */}
              {projectItems.length > 0 && (
                <div>
                  <div className="px-6 py-2">
                    <p className="font-montserrat text-xs font-semibold text-mono-silver/50 uppercase tracking-wider">
                      Projects
                    </p>
                  </div>
                  {projectItems.map((item) => {
                    if (item.type !== 'project') return null;

                    const globalIndex = filteredItems.indexOf(item);
                    const isActive = globalIndex === activeIndex;

                    const statusColors = {
                      processed: 'text-mono-white bg-mono-white/10',
                      processing: 'text-mono-silver bg-mono-silver/10',
                      uploaded: 'text-mono-silver/70 bg-mono-silver/5',
                    };

                    const statusColor =
                      statusColors[item.status as keyof typeof statusColors] ||
                      'text-mono-silver bg-mono-silver/5';

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`
                          w-full flex items-center justify-between px-6 py-3 text-sm cursor-pointer 
                          transition-colors font-inter
                          ${
                            isActive
                              ? 'bg-mono-slate text-mono-white'
                              : 'text-mono-silver hover:bg-mono-slate/60'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <svg
                            className="w-4 h-4 stroke-current flex-shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth="2"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 8l6 4-6 4z" fill="currentColor" stroke="none" />
                          </svg>
                          <div className="text-left">
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-xs text-mono-silver/70">
                              {new Date(item.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-montserrat font-semibold ${statusColor}`}
                        >
                          {item.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Hint */}
        <div className="border-t border-mono-silver/15 px-6 py-3 bg-mono-slate/20">
          <div className="flex items-center justify-between text-xs text-mono-silver/60 font-inter">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 rounded bg-mono-silver/10 border border-mono-silver/20">
                  ↑↓
                </kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 rounded bg-mono-silver/10 border border-mono-silver/20">
                  ↵
                </kbd>
                <span>Select</span>
              </span>
            </div>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-mono-silver/10 border border-mono-silver/20">
                Esc
              </kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

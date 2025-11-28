'use client';

import { useState, useEffect } from 'react';
import ProjectCard from '@/components/dashboard/ProjectCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { getProjects, type Project } from '@/lib/projectStore';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only accessing localStorage after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load projects from localStorage
  useEffect(() => {
    if (!isMounted) return;

    const loadProjects = () => {
      const storedProjects = getProjects();
      setProjects(storedProjects);
    };

    loadProjects();

    // Refresh every second to catch processing updates
    const interval = setInterval(loadProjects, 1000);
    return () => clearInterval(interval);
  }, [isMounted]);

  // Map project status to display status
  const getDisplayStatus = (status: Project['status']): 'Processed' | 'Processing' | 'Uploaded' => {
    if (status === 'processed') return 'Processed';
    if (status === 'processing') return 'Processing';
    return 'Uploaded';
  };

  // Format date
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Show loading skeleton during SSR and initial mount to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen relative">
        {/* Faint Left-to-Right Gradient Across Dashboard */}
        <div className="fixed inset-0 pointer-events-none bg-gradient-to-r from-mono-white/[0.01] via-transparent to-mono-white/[0.01]" />

        {/* Main Content */}
        <main className="px-6 lg:px-8 py-6 relative z-10">
          {/* Page Header */}
          <div className="mb-6 pb-6 border-b border-white/5">
            <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-2" />
            <div className="h-5 w-96 bg-white/5 rounded animate-pulse mb-4" />
            <div className="h-4 w-80 bg-white/5 rounded animate-pulse" />
          </div>

          {/* Loading Skeleton for Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-mono-slate/30 rounded-xl border border-white/5 overflow-hidden">
                <div className="aspect-video bg-white/5 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Faint Left-to-Right Gradient Across Dashboard */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-r from-mono-white/[0.01] via-transparent to-mono-white/[0.01]" />

      {/* Main Content */}
      <main className="px-6 lg:px-8 py-6 relative z-10">
        {/* Page Header */}
        <div className="mb-6 pb-6 border-b border-white/5 animate-fadeIn">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            My Projects
          </h1>
          <p className="font-inter text-sm text-mono-silver mb-4">
            Your AI-edited videos and workspaces
          </p>

          {/* Command Palette Hint */}
          <p className="text-xs text-mono-silver/60 font-inter">
            Press{' '}
            <kbd className="rounded border border-mono-silver/40 bg-mono-slate/30 px-1.5 py-0.5 text-[10px] font-montserrat">
              ⌘K
            </kbd>{' '}
            or{' '}
            <kbd className="rounded border border-mono-silver/40 bg-mono-slate/30 px-1.5 py-0.5 text-[10px] font-montserrat">
              Ctrl+K
            </kbd>{' '}
            anywhere to open the Command Palette
          </p>
        </div>

        {/* Projects Content */}
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-12">
            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="animate-slideUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProjectCard
                    id={project.id}
                    title={project.title}
                    status={getDisplayStatus(project.status)}
                    date={formatDate(project.createdAt)}
                    thumbnailUrl={project.thumbnailUrl}
                  />
                </div>
              ))}
            </div>

            {/* Stats Footer */}
            <div className="mt-20 pt-8 border-t border-white/5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-3xl mx-auto">
                <div className="space-y-3">
                  <p className="text-4xl font-semibold tracking-tight">
                    {projects.length}
                  </p>
                  <p className="text-sm font-medium text-white/70">Total Projects</p>
                </div>
                <div className="space-y-3">
                  <p className="text-4xl font-semibold tracking-tight">
                    {projects.filter((p) => p.status === 'processed').length}
                  </p>
                  <p className="text-sm font-medium text-white/70">Processed</p>
                </div>
                <div className="space-y-3">
                  <p className="text-4xl font-semibold tracking-tight">
                    {projects.filter((p) => p.status === 'processing').length}
                  </p>
                  <p className="text-sm font-medium text-white/70">In Progress</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

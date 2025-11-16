'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import ProjectCard from '@/components/dashboard/ProjectCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { getProjects, type Project } from '@/lib/projectStore';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load projects from localStorage
  useEffect(() => {
    const loadProjects = () => {
      const storedProjects = getProjects();
      setProjects(storedProjects);
    };

    loadProjects();

    // Refresh every second to catch processing updates
    const interval = setInterval(loadProjects, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNewProject = () => {
    router.push('/dashboard/new');
  };

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

  return (
    <div className="min-h-screen relative">
      {/* Faint Left-to-Right Gradient Across Dashboard */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-r from-mono-white/[0.01] via-transparent to-mono-white/[0.01]" />

      {/* Header */}
      <Header
        title="My Projects"
        subtitle="Your AI-edited videos and workspaces"
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNewProject={handleNewProject}
      />

      {/* Cinematic Top Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-mono-silver/20 to-transparent" />

      {/* Command Palette Hint */}
      <div className="px-6 lg:px-8 pt-4 pb-2">
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

      {/* Main Content */}
      <main className="px-6 lg:px-8 py-12 relative z-10">
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="animate-fade-up">
            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  status={getDisplayStatus(project.status)}
                  date={formatDate(project.createdAt)}
                  thumbnailUrl={project.thumbnailUrl}
                />
              ))}
            </div>

            {/* Stats Footer */}
            <div className="mt-16 pt-8 border-t border-mono-silver/15">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <p className="font-montserrat font-bold text-4xl text-mono-white">
                    {projects.length}
                  </p>
                  <p className="font-inter text-sm text-mono-silver">Total Projects</p>
                </div>
                <div className="space-y-2">
                  <p className="font-montserrat font-bold text-4xl text-mono-white">
                    {projects.filter((p) => p.status === 'processed').length}
                  </p>
                  <p className="font-inter text-sm text-mono-silver">Processed</p>
                </div>
                <div className="space-y-2">
                  <p className="font-montserrat font-bold text-4xl text-mono-white">
                    {projects.filter((p) => p.status === 'processing').length}
                  </p>
                  <p className="font-inter text-sm text-mono-silver">In Progress</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

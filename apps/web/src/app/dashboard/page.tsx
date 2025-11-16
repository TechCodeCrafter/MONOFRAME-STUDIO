'use client';

import { useState } from 'react';
import Header from '@/components/dashboard/Header';
import ProjectCard from '@/components/dashboard/ProjectCard';
import EmptyState from '@/components/dashboard/EmptyState';
import NewProjectModal from '@/components/dashboard/NewProjectModal';

// Mock data
const mockProjects = [
  {
    id: 1,
    title: 'Emotional Peaks',
    status: 'Processed' as const,
    date: 'Jan 12, 2025',
    thumbnailUrl: undefined,
  },
  {
    id: 2,
    title: 'Mountain Shoot',
    status: 'Processing' as const,
    date: 'Jan 18, 2025',
    thumbnailUrl: undefined,
  },
  {
    id: 3,
    title: 'Wedding Footage',
    status: 'Uploaded' as const,
    date: 'Jan 20, 2025',
    thumbnailUrl: undefined,
  },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState(mockProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNewProject = (data: { title: string; description: string }) => {
    const newProject = {
      id: projects.length + 1,
      title: data.title,
      status: 'Uploaded' as const,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      thumbnailUrl: undefined,
    };

    setProjects([newProject, ...projects]);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header
        title="My Projects"
        subtitle="Your AI-edited videos and workspaces"
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNewProject={() => setIsModalOpen(true)}
      />

      {/* Main Content */}
      <main className="px-6 lg:px-8 py-12">
        {projects.length === 0 ? (
          <EmptyState onUpload={() => setIsModalOpen(true)} />
        ) : (
          <div className="animate-fade-up">
            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} {...project} />
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
                    {projects.filter((p) => p.status === 'Processed').length}
                  </p>
                  <p className="font-inter text-sm text-mono-silver">Processed</p>
                </div>
                <div className="space-y-2">
                  <p className="font-montserrat font-bold text-4xl text-mono-white">
                    {projects.filter((p) => p.status === 'Processing').length}
                  </p>
                  <p className="font-inter text-sm text-mono-silver">In Progress</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewProject}
      />
    </div>
  );
}

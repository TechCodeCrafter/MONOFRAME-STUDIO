'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProjectById, deleteProject, type Project } from '@/lib/projectStore';
import { exportClipsAsZip } from '@/lib/exporter';
import { useExportOverlay } from '@/components/export';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { hideExportOverlay } = useExportOverlay();

  const [project, setProject] = useState<Project | null>(null);
  const [selectedClipIndex, setSelectedClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Load project
  useEffect(() => {
    const loadProject = () => {
      const proj = getProjectById(projectId);
      if (!proj) {
        router.push('/dashboard');
        return;
      }
      setProject(proj);
    };

    loadProject();

    // Poll for updates while processing
    if (project?.status === 'processing') {
      const interval = setInterval(loadProject, 1000);
      return () => clearInterval(interval);
    }
  }, [projectId, router, project?.status]);

  if (!project) {
    return (
      <div className="min-h-screen bg-mono-black flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 stroke-mono-white animate-pulse-slow mx-auto mb-4"
            viewBox="0 0 64 64"
            fill="none"
            strokeWidth="1.5"
          >
            <rect x="8" y="8" width="48" height="48" />
            <line x1="32" y1="8" x2="32" y2="56" />
            <line x1="8" y1="32" x2="56" y2="32" />
          </svg>
          <p className="font-inter text-mono-silver">Loading project...</p>
        </div>
      </div>
    );
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleClipSelect = (index: number) => {
    setSelectedClipIndex(index);
    if (videoRef.current && project?.clips?.[index]) {
      const clip = project.clips[index];
      videoRef.current.currentTime = clip.startTime;
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedClip = project?.clips?.[selectedClipIndex];

  const handleExportAll = async () => {
    if (!project || !project.clips || project.clips.length === 0) return;

    try {
      const clipsToExport = project.clips
        .filter((clip) => clip.videoUrl || project.videoUrl)
        .map((clip) => ({
          videoUrl: (clip.videoUrl || project.videoUrl)!,
          startTime: clip.startTime,
          endTime: clip.endTime,
          title: clip.title,
        }));

      if (clipsToExport.length === 0) {
        alert('No clips with valid video URLs found');
        return;
      }

      const sanitizedProjectTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const zipFilename = `${sanitizedProjectTitle}_clips.zip`;

      // Export overlay is handled by exporter.ts
      await exportClipsAsZip(clipsToExport, zipFilename);

      hideExportOverlay();
      alert('All clips exported successfully!');
    } catch (error) {
      console.error('Export all clips failed:', error);
      hideExportOverlay();
      alert('Export failed. Please try again.');
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
      router.push('/dashboard');
    }
  };

  // Processing state
  if (project.status === 'processing') {
    return (
      <div className="min-h-screen bg-mono-black flex items-center justify-center px-4">
        <div className="text-center max-w-lg animate-fade-up">
          <svg
            className="w-20 h-20 stroke-mono-white animate-pulse-slow mx-auto mb-8"
            viewBox="0 0 64 64"
            fill="none"
            strokeWidth="1.5"
          >
            <rect x="8" y="8" width="48" height="48" />
            <line x1="32" y1="8" x2="32" y2="56" />
            <line x1="8" y1="32" x2="56" y2="32" />
          </svg>

          <h1 className="font-montserrat font-bold text-4xl mb-4">Processing Your Video</h1>
          <p className="font-inter text-lg text-mono-silver mb-8">
            AI is analyzing emotional peaks and creating cinematic highlights...
          </p>

          <div className="space-y-3">
            <div className="text-left space-y-2">
              <p className="font-inter text-sm text-mono-silver flex items-center">
                <span className="inline-block w-2 h-2 bg-mono-white rounded-full animate-pulse mr-2" />
                Detecting scenes...
              </p>
              <p className="font-inter text-sm text-mono-silver flex items-center">
                <span className="inline-block w-2 h-2 bg-mono-white rounded-full animate-pulse mr-2" />
                Analyzing emotions...
              </p>
              <p className="font-inter text-sm text-mono-silver flex items-center">
                <span className="inline-block w-2 h-2 bg-mono-white rounded-full animate-pulse mr-2" />
                Scoring highlights...
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="mt-12 font-inter text-sm text-mono-silver hover:text-mono-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Project not processed yet (uploaded state)
  if (project.status === 'uploaded' || !project.clips || project.clips.length === 0) {
    return (
      <div className="min-h-screen bg-mono-black flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h1 className="font-montserrat font-bold text-4xl mb-4">Project Uploaded</h1>
          <p className="font-inter text-lg text-mono-silver mb-8">
            This project is waiting to be processed. Start processing to generate clips.
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Processed state with clips
  return (
    <div className="min-h-screen bg-mono-black">
      {/* Header */}
      <header className="border-b border-mono-silver/15 py-6 px-8 sticky top-0 z-30 bg-mono-black/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-mono-white/5 rounded transition-colors"
            >
              <svg
                className="w-6 h-6 stroke-mono-white"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div>
              <h1 className="font-montserrat font-bold text-2xl text-mono-white">
                {project.title}
              </h1>
              {project.description && (
                <p className="font-inter text-sm text-mono-silver mt-1">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAll}
              className="px-4 py-2 border border-mono-white/30 text-mono-white font-montserrat text-sm rounded hover:bg-mono-white/5 transition-colors flex items-center space-x-2"
            >
              <span>Export All Clips</span>
            </button>
            <button className="px-4 py-2 border border-mono-white/30 text-mono-white font-montserrat text-sm rounded hover:bg-mono-white/5 transition-colors">
              Regenerate
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-mono-white/30 text-mono-silver font-montserrat text-sm rounded hover:bg-mono-white/5 hover:text-mono-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-[350px_1fr] gap-6 p-8">
        {/* Left Sidebar - Clips List */}
        <aside className="space-y-4">
          <h2 className="font-montserrat font-semibold text-lg mb-4 flex items-center justify-between">
            <span>Generated Clips</span>
            <span className="text-sm text-mono-silver">{project.clips.length}</span>
          </h2>

          <div className="space-y-3">
            {project.clips.map((clip, index) => (
              <div
                key={clip.id}
                className={`
                  w-full p-4 border rounded-lg transition-all duration-300 cursor-pointer
                  ${selectedClipIndex === index
                    ? 'border-mono-white bg-mono-white/5 shadow-lg'
                    : 'border-mono-silver/30 hover:border-mono-white/50'
                  }
                `}
              >
                <button onClick={() => handleClipSelect(index)} className="w-full text-left mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-montserrat font-semibold text-base">{clip.title}</h3>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${selectedClipIndex === index ? 'bg-mono-white animate-pulse' : 'bg-mono-white'
                          }`}
                      />
                      <span className="font-inter text-sm">{clip.score}</span>
                    </div>
                  </div>
                  <p className="font-inter text-xs text-mono-silver mb-1">{clip.timestamp}</p>
                  <p className="font-inter text-xs text-mono-silver/70">{clip.duration}s</p>
                </button>
                <button
                  onClick={() => router.push(`/dashboard/${projectId}/editor/${clip.id}`)}
                  className="w-full bg-mono-white text-mono-black font-montserrat font-semibold text-xs px-3 py-2 rounded hover:bg-mono-silver transition-colors flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit Clip</span>
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content - Video Player */}
        <main className="space-y-6">
          {/* Video Player */}
          <div
            ref={videoContainerRef}
            className="aspect-video bg-mono-shadow border border-mono-silver/30 rounded-lg relative overflow-hidden group"
          >
            {/* Blurred Background */}
            <div className="absolute inset-0 overflow-hidden">
              <video
                className="w-full h-full object-cover scale-110 blur-2xl opacity-30"
                src={project.videoUrl}
                muted
                loop
                autoPlay
              />
            </div>

            {/* Main Video */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-contain z-10"
              src={project.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 z-20 flex items-center justify-center bg-mono-black/40 backdrop-blur-sm transition-opacity"
              >
                <div className="w-20 h-20 rounded-full bg-mono-white/10 border-2 border-mono-white flex items-center justify-center hover:bg-mono-white/20 transition-all">
                  <svg
                    className="w-8 h-8 stroke-mono-white ml-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                  >
                    <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
                  </svg>
                </div>
              </button>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-6 bg-gradient-to-t from-mono-black via-mono-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Progress Bar */}
              <div className="relative w-full h-1 bg-mono-silver/20 rounded-full cursor-pointer mb-4 group/scrubber">
                <div
                  className="absolute inset-y-0 left-0 bg-mono-white rounded-full"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-mono-white shadow-[0_0_8px_rgba(255,255,255,0.6)] opacity-0 group-hover/scrubber:opacity-100 transition-opacity"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlayPause}
                    className="w-10 h-10 rounded-full border border-mono-silver/30 flex items-center justify-center hover:bg-mono-white/10 transition-colors"
                  >
                    {isPlaying ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    )}
                  </button>

                  {/* Time Display */}
                  <span className="font-inter text-sm text-mono-silver">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Current Clip Title */}
                  {selectedClip && (
                    <span className="font-montserrat text-sm text-mono-silver">
                      {selectedClip.title}
                    </span>
                  )}

                  {/* Fullscreen Button */}
                  <button
                    onClick={handleFullscreen}
                    className="w-8 h-8 flex items-center justify-center hover:bg-mono-white/10 rounded transition-colors"
                    title="Watch Full Video (Fullscreen)"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Panel */}
          {selectedClip && (
            <div className="border border-mono-silver/30 rounded-lg p-8 bg-mono-slate/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-montserrat font-semibold text-xl">AI Analysis</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-mono-white rounded-full animate-pulse" />
                  <span className="font-inter text-xs text-mono-silver uppercase tracking-wider">
                    {selectedClip.title}
                  </span>
                </div>
              </div>

              {/* AI Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: 'Emotional Score', value: selectedClip.analysis.emotionalScore },
                  { label: 'Scene Tension', value: selectedClip.analysis.sceneTension },
                  { label: 'Audio Energy', value: selectedClip.analysis.audioEnergy },
                  { label: 'Motion Score', value: selectedClip.analysis.motionScore },
                  { label: 'Shot Stability', value: selectedClip.analysis.shotStability },
                  { label: 'Cinematic Rhythm', value: selectedClip.analysis.cinematicRhythm },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-2">
                    <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider">
                      {metric.label}
                    </p>
                    <div className="flex items-baseline space-x-2">
                      <p className="font-montserrat text-3xl font-bold">{metric.value}</p>
                      <span className="font-inter text-sm text-mono-silver">/100</span>
                    </div>
                    <div className="h-1 bg-mono-silver/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-mono-white transition-all duration-500"
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-mono-silver/20 my-8" />

              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider mb-2">
                    Duration
                  </p>
                  <p className="font-montserrat text-xl">{selectedClip.duration}s</p>
                </div>
                <div>
                  <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider mb-2">
                    Pacing
                  </p>
                  <p className="font-montserrat text-xl">{selectedClip.analysis.pacing}</p>
                </div>
                <div>
                  <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider mb-2">
                    Lighting
                  </p>
                  <p className="font-montserrat text-xl">{selectedClip.analysis.lighting}</p>
                </div>
                <div>
                  <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider mb-2">
                    Color Grade
                  </p>
                  <p className="font-montserrat text-xl">{selectedClip.analysis.colorGrade}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

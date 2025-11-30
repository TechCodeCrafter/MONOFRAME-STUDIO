'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProjectById, deleteProject, type Project } from '@/lib/projectStore';
import { exportClipsAsZip } from '@/lib/exporter';
import { useExportOverlay } from '@/components/export';
import { useFullscreen } from '@/hooks/useFullscreen';
import { EmotionGraph } from '@/components/emotion';

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
  const [isMounted, setIsMounted] = useState(false);
  const [activeClipByPlayhead, setActiveClipByPlayhead] = useState<number | null>(null);
  const [timelineHoverTime, setTimelineHoverTime] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const clipListRef = useRef<HTMLDivElement>(null);

  // Fullscreen hook
  const { isFullscreen, toggleFullscreen } = useFullscreen(videoContainerRef);

  // Prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleClipSelect = useCallback((index: number) => {
    setSelectedClipIndex(index);
    if (videoRef.current && project?.clips?.[index]) {
      const clip = project.clips[index];
      videoRef.current.currentTime = clip.startTime;
      videoRef.current.pause();
      setIsPlaying(false);

      // Smooth scroll to selected clip in sidebar
      const clipElement = document.querySelector(`[data-clip-index="${index}"]`);
      if (clipElement && clipListRef.current) {
        clipElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [project?.clips]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // Detect which clip contains the current playhead
      if (project?.clips) {
        const activeIndex = project.clips.findIndex(
          clip => time >= clip.startTime && time < clip.endTime
        );

        if (activeIndex !== -1 && activeIndex !== activeClipByPlayhead) {
          setActiveClipByPlayhead(activeIndex);

          // Auto-scroll to active clip in sidebar
          const clipElement = document.querySelector(`[data-clip-index="${activeIndex}"]`);
          if (clipElement && clipListRef.current) {
            clipElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else if (activeIndex === -1) {
          setActiveClipByPlayhead(null);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleFullscreen = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+F / Ctrl+F for fullscreen
      if ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        toggleFullscreen();
      }
      // Space for play/pause
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, toggleFullscreen]);

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

          <h1 className="text-2xl font-semibold tracking-tight mb-2">Processing Your Video</h1>
          <p className="font-inter text-lg text-mono-silver mt-8 mb-6">
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
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Project Uploaded</h1>
          <p className="font-inter text-lg text-mono-silver mt-8 mb-6">
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
              <h1 className="text-2xl font-semibold tracking-tight">
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
      <div className="grid lg:grid-cols-[350px_1fr] gap-6 p-6">
        {/* Left Sidebar - Clips List */}
        <aside className="space-y-4">
          <h2 className="text-lg font-medium text-white/70 mb-6 flex items-center justify-between">
            <span>Generated Clips</span>
            <span className="text-sm text-mono-silver">{project.clips.length}</span>
          </h2>

          <div ref={clipListRef} className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
            {project.clips.map((clip, index) => {
              const isSelected = selectedClipIndex === index;
              const isPlayheadActive = activeClipByPlayhead === index;

              return (
                <div
                  key={clip.id}
                  data-clip-index={index}
                  className={`
                  w-full p-4 border rounded-xl transition-all duration-300 cursor-pointer
                  ${isPlayheadActive
                      ? 'border-white/40 bg-white/10 shadow-[0_0_24px_rgba(255,255,255,0.2)] scale-[1.02]'
                      : isSelected
                        ? 'border-white/20 bg-mono-white/5 shadow-lg'
                        : 'border-mono-silver/30 hover:border-white/30 hover:bg-white/5 hover:scale-[1.01] hover:shadow-[0_0_16px_rgba(255,255,255,0.1)]'
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
              );
            })}
          </div>
        </aside>

        {/* Main Content - Video Player */}
        <main className="space-y-8">
          {/* Video Player */}
          <div
            ref={videoContainerRef}
            className="aspect-video bg-mono-shadow border border-mono-silver/30 rounded-xl relative overflow-hidden group"
            suppressHydrationWarning
          >
            {/* Blurred Background */}
            {isMounted && (
              <div className="absolute inset-0 overflow-hidden">
                <video
                  className="w-full h-full object-cover scale-110 blur-2xl opacity-30"
                  src={project.videoUrl}
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              </div>
            )}

            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 rounded-xl pointer-events-none z-[5]" />

            {/* Main Video */}
            {isMounted && (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain z-10 cursor-pointer animate-fadeIn"
                src={project.videoUrl}
                onClick={togglePlayPause}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            )}

            {/* Play/Pause Overlay */}
            {isMounted && !isPlaying && (
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 z-20 flex items-center justify-center bg-mono-black/40 backdrop-blur-sm transition-all duration-200 animate-fadeIn"
              >
                <div className="w-20 h-20 rounded-full bg-mono-white/10 border-2 border-mono-white ring-[3px] ring-white/40 hover:ring-white/70 hover:scale-110 flex items-center justify-center hover:bg-mono-white/20 transition-all duration-300 animate-scaleIn">
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
            {isMounted && (
              <div className="absolute bottom-0 inset-x-0 z-30 p-6 bg-gradient-to-t from-mono-black via-mono-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress Bar */}
                <div className="relative w-full h-1 bg-mono-silver/20 rounded-full cursor-pointer mb-4 group/scrubber">
                  <div
                    className="absolute inset-y-0 left-0 bg-mono-white rounded-full"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] opacity-0 group-hover/scrubber:opacity-100 transition-opacity"
                    style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlayPause}
                      className="w-10 h-10 rounded-full border border-mono-silver/30 flex items-center justify-center hover:bg-mono-white/10 hover:border-white/60 hover:scale-110 transition-all duration-200"
                    >
                      {isPlaying ? (
                        <svg className="w-4 h-4 transition-all duration-200" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 ml-0.5 transition-all duration-200" viewBox="0 0 24 24" fill="currentColor">
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
            )}

            {/* Fullscreen Overlay Controls */}
            {isMounted && isFullscreen && (
              <div className="absolute inset-0 z-40 flex flex-col justify-between bg-gradient-to-b from-mono-black/60 via-transparent to-mono-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {/* Top Bar */}
                <div className="p-6 pointer-events-auto">
                  <button
                    onClick={toggleFullscreen}
                    className="flex items-center space-x-2 text-mono-white hover:text-mono-silver transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                    <span className="font-inter text-sm">Exit Fullscreen (Esc)</span>
                  </button>
                </div>

                {/* Bottom Info */}
                <div className="p-6 pointer-events-auto">
                  <p className="font-montserrat text-lg text-mono-white">
                    {project.title} {selectedClip && `· ${selectedClip.title}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mini Emotion Curve */}
          {isMounted && selectedClip && !isFullscreen && (
            <div
              key={`emotion-${selectedClip.id}`}
              className="animate-fadeIn"
            >
              <EmotionGraph
                clip={selectedClip}
                startTime={selectedClip.startTime}
                endTime={selectedClip.endTime}
                duration={selectedClip.duration}
                regenerateKey={0}
              />
            </div>
          )}

          {/* Full-Width Timeline */}
          {isMounted && !isFullscreen && (
            <div className="border border-mono-silver/30 rounded-lg p-6 bg-mono-slate/30 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white/70">Video Timeline</h3>
                <span className="font-inter text-xs text-mono-silver">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Timeline Track with Waveform */}
              <div
                className="relative w-full h-20 bg-mono-black/50 border border-mono-silver/20 rounded overflow-hidden cursor-pointer group"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setTimelineHoverTime(pos * duration);
                }}
                onMouseLeave={() => setTimelineHoverTime(null)}
                onClick={(e) => {
                  if (videoRef.current) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    videoRef.current.currentTime = pos * duration;
                  }
                }}
              >
                {/* Waveform Background */}
                <div className="absolute inset-0 flex items-end justify-around px-1 pb-1 opacity-30">
                  {Array.from({ length: 100 }).map((_, i) => {
                    const height = Math.random() * 0.5 + 0.2;
                    return (
                      <div
                        key={i}
                        className="w-[1px] bg-white/40"
                        style={{ height: `${height * 100}%` }}
                      />
                    );
                  })}
                </div>
                {/* Clip Segments */}
                {project.clips.map((clip, index) => {
                  const isPlayheadInClip = activeClipByPlayhead === index;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClipSelect(index);
                      }}
                      className={`
                      absolute top-2 bottom-2 cursor-pointer transition-all duration-300 rounded
                      ${isPlayheadInClip
                          ? 'bg-white/30 border-2 border-white shadow-[0_0_16px_rgba(255,255,255,0.6)]'
                          : selectedClipIndex === index
                            ? 'bg-mono-white/20 border-2 border-white/50 shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                            : 'bg-mono-white/10 border border-white/20 hover:bg-mono-white/15 hover:border-white/40'
                        }
                    `}
                      style={{
                        left: `${duration > 0 ? (clip.startTime / duration) * 100 : 0}%`,
                        width: `${duration > 0 ? ((clip.endTime - clip.startTime) / duration) * 100 : 0}%`,
                      }}
                    >
                      {/* Clip Label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-inter text-[10px] text-mono-white font-semibold drop-shadow">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Current Time Indicator (Playhead) */}
                <div
                  className="absolute inset-y-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] pointer-events-none z-20"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                >
                  {/* Playhead Top Circle */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </div>

                {/* Hover Time Bubble */}
                {timelineHoverTime !== null && (
                  <div
                    className="absolute -top-10 -translate-x-1/2 bg-mono-black/90 border border-white/30 rounded px-2 py-1 pointer-events-none z-30 animate-fadeIn"
                    style={{ left: `${duration > 0 ? (timelineHoverTime / duration) * 100 : 0}%` }}
                  >
                    <span className="font-inter text-xs text-white font-medium">
                      {formatTime(timelineHoverTime)}
                    </span>
                    {/* Arrow */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-mono-black/90 border-r border-b border-white/30 rotate-45" />
                  </div>
                )}
              </div>

              {/* Timeline Labels */}
              <div className="flex justify-between mt-2">
                <span className="font-inter text-[10px] text-mono-silver/60">0:00</span>
                <span className="font-inter text-[10px] text-mono-silver/60">{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* AI Analysis Panel */}
          {selectedClip && (
            <div
              key={`analysis-${selectedClip.id}`}
              className="border border-mono-silver/30 rounded-lg p-8 bg-mono-slate/30 animate-fadeIn mt-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white/70">AI Analysis</h3>
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

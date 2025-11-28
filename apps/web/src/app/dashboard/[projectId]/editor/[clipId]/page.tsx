'use client';

import { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { getProjectById, updateProject, type Clip, type Project } from '@/lib/projectStore';
import { exportTrimmedClip, exportOriginalClip } from '@/lib/exporter';
import { useExportOverlay } from '@/components/export';
import { EmotionGraph } from '@/components/emotion';
import { MotionCurve } from '@/components/motion';
import { useFullscreen } from '@/hooks/useFullscreen';

// ============================================================================
// HELPER FUNCTIONS (outside component)
// ============================================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function useDebounce<T extends (...args: never[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================

const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-mono-black text-mono-white overflow-hidden">
      {/* Top Navigation Bar Skeleton */}
      <header className="h-14 border-b border-mono-silver/10 flex items-center justify-between px-6 bg-mono-shadow/50">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-4 bg-mono-silver/10 rounded animate-pulse" />
          <div className="w-32 h-8 bg-mono-silver/10 rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-4 bg-mono-silver/10 rounded animate-pulse" />
          <div className="w-16 h-4 bg-mono-silver/10 rounded animate-pulse" />
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Player */}
        <div className="flex-1 flex flex-col p-6 relative">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-5xl aspect-video bg-mono-shadow border border-mono-silver/10 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <aside className="w-[350px] flex-shrink-0 border-l border-mono-silver/10 bg-mono-shadow/50 p-6 space-y-6">
          <div className="w-32 h-6 bg-mono-silver/10 rounded animate-pulse" />
          <div className="space-y-3">
            <div className="w-full h-10 bg-mono-silver/10 rounded animate-pulse" />
            <div className="w-full h-20 bg-mono-silver/10 rounded animate-pulse" />
            <div className="w-full h-32 bg-mono-silver/10 rounded animate-pulse" />
          </div>
        </aside>
      </div>

      {/* Emotion Graph Skeleton */}
      <div className="w-full h-[120px] bg-mono-black/20 border-y border-mono-silver/10 animate-pulse" />

      {/* Timeline Skeleton */}
      <div className="h-32 border-t border-mono-silver/10 bg-mono-shadow/50 p-6">
        <div className="w-full h-16 bg-mono-silver/10 rounded animate-pulse" />
      </div>
    </div>
  );
});

const MemoizedEmotionGraph = memo(
  EmotionGraph,
  (prevProps, nextProps) =>
    prevProps.clip.id === nextProps.clip.id &&
    prevProps.startTime === nextProps.startTime &&
    prevProps.endTime === nextProps.endTime &&
    prevProps.regenerateKey === nextProps.regenerateKey
);

const MemoizedMotionCurve = memo(
  MotionCurve,
  (prevProps, nextProps) =>
    prevProps.clip.id === nextProps.clip.id &&
    prevProps.startTime === nextProps.startTime &&
    prevProps.endTime === nextProps.endTime &&
    prevProps.regenerateKey === nextProps.regenerateKey
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClipEditorPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const clipIdParam = params.clipId as string;

  const { hideExportOverlay } = useExportOverlay();

  const [project, setProject] = useState<Project | null>(null);
  const [clip, setClip] = useState<Clip | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [regenerateKey, setRegenerateKey] = useState(0);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // Fullscreen hook
  const {
    isFullscreen,
    isSupported: isFullscreenSupported,
    toggleFullscreen,
  } = useFullscreen(fullscreenContainerRef);

  // Trim controls
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Load project and clip (fires once on mount)
  useEffect(() => {
    console.log('🎬 Clip Editor: Route params:', { projectId, clipId: clipIdParam });

    const loadedProject = getProjectById(projectId);

    if (!loadedProject) {
      setInitializing(false);
      return;
    }

    if (!loadedProject.clips || loadedProject.clips.length === 0) {
      router.push(`/dashboard/${projectId}`);
      return;
    }

    console.log('✅ Project loaded:', loadedProject.title);

    const foundClip = loadedProject.clips.find(
      (c) => c.id.toString() === clipIdParam || c.id === parseInt(clipIdParam, 10)
    );

    if (!foundClip) {
      setInitializing(false);
      return;
    }

    console.log('✅ Clip loaded:', foundClip.title);

    setProject(loadedProject);
    setClip(foundClip);
    setTrimStart(foundClip.startTime);
    setTrimEnd(foundClip.endTime);
    setInitializing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save clip edits with debounce
  const saveClipEdits = useCallback(() => {
    if (!project || !clip) return;

    try {
      setIsSaving(true);

      const updatedClips = project.clips!.map((c) =>
        c.id === clip.id
          ? {
              ...c,
              startTime: trimStart,
              endTime: trimEnd,
              duration: trimEnd - trimStart,
              timestamp: `${formatTime(trimStart)} - ${formatTime(trimEnd)}`,
            }
          : c
      );

      updateProject(projectId, { clips: updatedClips });

      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Error saving clip:', error);
      setIsSaving(false);
    }
  }, [project, clip, trimStart, trimEnd, projectId]);

  const debouncedSave = useDebounce(saveClipEdits, 400);

  // Trigger save when trim values change
  useEffect(() => {
    if (clip && (trimStart !== clip.startTime || trimEnd !== clip.endTime)) {
      debouncedSave();
    }
  }, [trimStart, trimEnd, clip, debouncedSave]);

  // Video player controls (memoized)
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && clip) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (time < trimStart) {
        videoRef.current.currentTime = trimStart;
      } else if (time >= trimEnd) {
        videoRef.current.currentTime = trimStart;
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [clip, trimStart, trimEnd]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && clip) {
      const fullDuration = videoRef.current.duration;
      setVideoDuration(fullDuration);
      setDuration(trimEnd - trimStart);
      videoRef.current.currentTime = trimStart;
    }
  }, [clip, trimEnd, trimStart]);

  const handleSeek = useCallback(
    (newTime: number) => {
      if (videoRef.current) {
        const boundedTime = Math.max(trimStart, Math.min(newTime, trimEnd));
        videoRef.current.currentTime = boundedTime;
        setCurrentTime(boundedTime);
      }
    },
    [trimStart, trimEnd]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space = play/pause
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        togglePlayPause();
      }
      // Cmd+F or Ctrl+F = fullscreen toggle
      if ((e.key === 'f' || e.key === 'F') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleFullscreen();
      }
      // ? = show shortcuts
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      // ESC = close shortcuts (fullscreen exit is handled by browser natively)
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
      // Left arrow = seek -5s
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(currentTime - 5);
      }
      // Right arrow = seek +5s
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSeek(currentTime + 5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, showShortcuts, togglePlayPause, handleSeek, toggleFullscreen]);

  // Handlers (memoized)
  const handleClipChange = useCallback(
    (newClipId: number) => {
      router.push(`/dashboard/${projectId}/editor/${newClipId}`);
    },
    [projectId, router]
  );

  const showToastNotification = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const handleSaveClip = useCallback(() => {
    if (!project || !clip) return;

    try {
      setIsSaving(true);

      const updatedClips = project.clips!.map((c) =>
        c.id === clip.id
          ? {
              ...c,
              startTime: trimStart,
              endTime: trimEnd,
              duration: trimEnd - trimStart,
              timestamp: `${formatTime(trimStart)} - ${formatTime(trimEnd)}`,
              updatedAt: new Date().toISOString(),
            }
          : c
      );

      updateProject(projectId, { clips: updatedClips, updatedAt: new Date().toISOString() });

      setTimeout(() => {
        setIsSaving(false);
        showToastNotification('Clip saved successfully!');
      }, 500);
    } catch (error) {
      console.error('Error saving clip:', error);
      setIsSaving(false);
      showToastNotification('Failed to save clip');
    }
  }, [project, clip, trimStart, trimEnd, projectId, showToastNotification]);

  const handleExportTrimmed = useCallback(async () => {
    if (!clip || !project) return;

    const videoUrl = clip.videoUrl || project.videoUrl;
    if (!videoUrl) {
      showToastNotification('Video URL not available');
      return;
    }

    try {
      const sanitizedTitle = clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}_trimmed.mp4`;

      await exportTrimmedClip(videoUrl, trimStart, trimEnd, filename);

      hideExportOverlay();
      showToastNotification('Clip exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      hideExportOverlay();
      showToastNotification('Export failed. Please try again.');
    }
  }, [clip, project, trimStart, trimEnd, hideExportOverlay, showToastNotification]);

  const handleExportOriginal = useCallback(async () => {
    if (!clip || !project) return;

    const videoUrl = clip.videoUrl || project.videoUrl;
    if (!videoUrl) {
      showToastNotification('Video URL not available');
      return;
    }

    try {
      const sanitizedTitle = clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}_original.mp4`;

      await exportOriginalClip(videoUrl, filename);

      hideExportOverlay();
      showToastNotification('Original clip exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      hideExportOverlay();
      showToastNotification('Export failed. Please try again.');
    }
  }, [clip, project, hideExportOverlay, showToastNotification]);

  const handleRegenerateClip = useCallback(() => {
    if (!clip || !project) return;

    try {
      const randomOffset = () => (Math.random() - 0.5) * 4;

      const updatedClips = project.clips!.map((c) =>
        c.id === clip.id
          ? {
              ...c,
              startTime: Math.max(0, c.startTime + randomOffset()),
              endTime: Math.min(videoDuration || c.endTime, c.endTime + randomOffset()),
              score: Math.max(0, Math.min(100, c.score + Math.floor((Math.random() - 0.5) * 10))),
              analysis: {
                ...c.analysis,
                emotionalScore: Math.max(
                  0,
                  Math.min(100, c.analysis.emotionalScore + Math.floor((Math.random() - 0.5) * 10))
                ),
                sceneTension: Math.max(
                  0,
                  Math.min(100, c.analysis.sceneTension + Math.floor((Math.random() - 0.5) * 10))
                ),
                audioEnergy: Math.max(
                  0,
                  Math.min(100, c.analysis.audioEnergy + Math.floor((Math.random() - 0.5) * 10))
                ),
                motionScore: Math.max(
                  0,
                  Math.min(100, c.analysis.motionScore + Math.floor((Math.random() - 0.5) * 10))
                ),
              },
            }
          : c
      );

      const updatedClip = updatedClips.find((c) => c.id === clip.id)!;

      updateProject(projectId, { clips: updatedClips });

      setClip(updatedClip);
      setTrimStart(updatedClip.startTime);
      setTrimEnd(updatedClip.endTime);
      setRegenerateKey((prev) => prev + 1);

      showToastNotification('Clip regenerated with new AI analysis!');
    } catch (error) {
      console.error('Error regenerating clip:', error);
      showToastNotification('Failed to regenerate clip');
    }
  }, [clip, project, projectId, videoDuration, showToastNotification]);

  const handleDeleteClip = useCallback(() => {
    if (!project || !clip) return;

    if (confirm(`Are you sure you want to delete "${clip.title}"?`)) {
      try {
        const updatedClips = project.clips!.filter((c) => c.id !== clip.id);
        updateProject(projectId, { clips: updatedClips });
        router.push(`/dashboard/${projectId}`);
      } catch (error) {
        console.error('Error deleting clip:', error);
        showToastNotification('Failed to delete clip');
      }
    }
  }, [project, clip, projectId, router, showToastNotification]);

  const handleTrimSliderChange = useCallback(
    (type: 'start' | 'end', value: number) => {
      if (type === 'start') {
        setTrimStart((prev) => {
          const newStart = Math.max(0, Math.min(value, trimEnd - 0.5));
          return newStart;
        });
      } else {
        setTrimEnd((prev) => {
          const newEnd = Math.max(trimStart + 0.5, value);
          return newEnd;
        });
      }
    },
    [trimStart, trimEnd]
  );

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!clip) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = trimStart + percentage * (trimEnd - trimStart);
      handleSeek(newTime);
    },
    [clip, trimStart, trimEnd, handleSeek]
  );

  // Computed values (memoized)
  const progress = useMemo(() => {
    return duration > 0 ? ((currentTime - trimStart) / (trimEnd - trimStart)) * 100 : 0;
  }, [duration, currentTime, trimStart, trimEnd]);

  // Show loading skeleton while initializing
  if (initializing) {
    return <LoadingSkeleton />;
  }

  // Show error state if project/clip not found (after initialization)
  if (!project || !clip) {
    return (
      <div className="h-screen flex items-center justify-center bg-mono-black text-mono-white">
        <div className="text-center max-w-md animate-fade-up">
          <svg
            className="w-16 h-16 stroke-mono-white mx-auto mb-6"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Project Not Found</h1>
          <p className="font-inter text-lg text-mono-silver mt-8 mb-6">
            The project or clip you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-6 py-3 bg-mono-white text-mono-black font-montserrat font-semibold rounded hover:bg-mono-silver transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-mono-black text-mono-white overflow-hidden">
      {/* Top Navigation Bar - hidden in fullscreen */}
      {!isFullscreen && (
        <header className="h-14 border-b border-mono-silver/10 flex items-center justify-between px-6 bg-mono-shadow/50 backdrop-blur-sm transition-opacity duration-150">
          <div className="flex items-center space-x-6">
            <Link
              href={`/dashboard/${projectId}`}
              className="flex items-center space-x-2 text-mono-silver hover:text-mono-white transition-colors group"
            >
              <svg
                className="w-4 h-4 stroke-current group-hover:-translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="font-inter text-sm">Back to Project</span>
            </Link>

            <div className="flex items-center space-x-2">
              <span className="font-inter text-xs text-mono-silver/60">Clip:</span>
              <select
                value={clip.id}
                onChange={(e) => handleClipChange(parseInt(e.target.value, 10))}
                className="bg-mono-slate/50 border border-mono-silver/20 rounded px-3 py-1 text-sm font-montserrat
                focus:outline-none focus:border-mono-white transition-colors cursor-pointer"
              >
                {project.clips?.map((c, idx) => (
                  <option key={c.id} value={c.id}>
                    {idx + 1}. {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isSaving ? (
                <>
                  <div className="w-2 h-2 bg-mono-silver/50 rounded-full animate-pulse" />
                  <span className="font-inter text-xs text-mono-silver/70">Saving...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-mono-white/30 rounded-full" />
                  <span className="font-inter text-xs text-mono-silver/60">All changes saved</span>
                </>
              )}
            </div>

            <button
              onClick={() => setShowShortcuts(true)}
              className="font-inter text-xs text-mono-silver hover:text-mono-white transition-colors flex items-center space-x-1"
            >
              <span>Shortcuts</span>
              <kbd className="text-[10px] px-1 py-0.5 rounded bg-mono-slate/50 border border-mono-silver/20">
                ?
              </kbd>
            </button>
          </div>
        </header>
      )}

      {/* Main Editor Area */}
      <div
        ref={fullscreenContainerRef}
        className={`flex-1 flex overflow-hidden ${isFullscreen ? 'bg-mono-black' : ''}`}
      >
        {/* Left: Video Player */}
        <div
          className={`flex-1 flex flex-col p-6 relative transition-all duration-150 ${isFullscreen ? 'p-0' : ''}`}
        >
          <div
            className={`absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] transition-opacity duration-150 ${isFullscreen ? 'opacity-0' : ''}`}
          />

          <div className="flex-1 flex items-center justify-center relative z-10">
            <div
              className={`w-full bg-mono-shadow border border-mono-silver/10 rounded-lg overflow-hidden relative group transition-all duration-150 ${
                isFullscreen
                  ? 'max-w-none h-full border-0 rounded-none bg-mono-black'
                  : 'max-w-5xl aspect-video'
              }`}
            >
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={clip.videoUrl || project.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Hover Controls Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-mono-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="mb-4">
                  <div
                    className="relative h-1 bg-mono-silver/20 rounded-full cursor-pointer group/scrubber"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      const newTime = trimStart + pos * (trimEnd - trimStart);
                      handleSeek(newTime);
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-mono-white rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
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
                    <span className="font-inter text-sm text-mono-silver">
                      {formatTime(currentTime)} / {formatTime(trimEnd)}
                    </span>
                  </div>

                  {isFullscreenSupported && (
                    <button
                      onClick={toggleFullscreen}
                      className="w-8 h-8 flex items-center justify-center hover:bg-mono-white/10 rounded transition-colors"
                      title="Fullscreen (⌘+F)"
                    >
                      {isFullscreen ? (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Fullscreen Minimal Overlay */}
              {isFullscreen && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  {/* Top Bar - Back and Exit Buttons */}
                  <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-mono-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between">
                      {/* Back Button */}
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
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        <span className="font-inter text-sm">Exit Fullscreen</span>
                      </button>

                      {/* Exit Fullscreen Button */}
                      <button
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-full bg-mono-white/10 border border-mono-white/20 flex items-center justify-center hover:bg-mono-white/20 transition-all"
                        title="Exit Fullscreen (ESC)"
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
                      </button>
                    </div>
                  </div>

                  {/* Center Play/Pause Button */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                      <button
                        onClick={togglePlayPause}
                        className="w-24 h-24 rounded-full bg-mono-white/10 border-2 border-mono-white backdrop-blur-sm flex items-center justify-center hover:bg-mono-white/20 hover:scale-110 transition-all shadow-2xl"
                      >
                        <svg
                          className="w-12 h-12 stroke-mono-white ml-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="2"
                        >
                          <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Bottom Bar - Time Display */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-mono-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                    <div className="flex items-center justify-center">
                      <span className="font-inter text-lg text-mono-white">
                        {formatTime(currentTime)} / {formatTime(trimEnd)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - hidden in fullscreen */}
        {!isFullscreen && (
          <aside className="w-[350px] flex-shrink-0 border-l border-mono-silver/10 bg-mono-shadow/50 p-6 overflow-y-auto space-y-6 transition-opacity duration-150">
            <div>
              <h3 className="text-lg font-medium text-white/70 mb-6">Clip Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider mb-1 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={clip.title}
                    readOnly
                    className="w-full bg-mono-black/50 border border-mono-silver/20 rounded px-3 py-2 text-sm font-montserrat
                    focus:outline-none focus:border-mono-white transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider mb-1 block">
                      Duration
                    </label>
                    <p className="font-montserrat text-sm">{(trimEnd - trimStart).toFixed(1)}s</p>
                  </div>
                  <div>
                    <label className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider mb-1 block">
                      Score
                    </label>
                    <p className="font-montserrat text-sm">{clip.score}/100</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-mono-silver/10" />

            <div>
              <h3 className="text-lg font-medium text-white/70 mb-6">Trim Controls</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider mb-2 block">
                    Start Time: {formatTime(trimStart)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={videoDuration || clip.endTime}
                    step="0.1"
                    value={trimStart}
                    onChange={(e) => handleTrimSliderChange('start', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider mb-2 block">
                    End Time: {formatTime(trimEnd)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={videoDuration || clip.endTime}
                    step="0.1"
                    value={trimEnd}
                    onChange={(e) => handleTrimSliderChange('end', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-mono-silver/10" />

            <div>
              <h3 className="text-lg font-medium text-white/70 mb-6">AI Insights</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-mono-black/50 border border-mono-silver/20 rounded p-3">
                  <p className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider mb-1">
                    Emotion
                  </p>
                  <p className="font-montserrat text-xl">{clip.analysis.emotionalScore}</p>
                </div>
                <div className="bg-mono-black/50 border border-mono-silver/20 rounded p-3">
                  <p className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider mb-1">
                    Tension
                  </p>
                  <p className="font-montserrat text-xl">{clip.analysis.sceneTension}</p>
                </div>
                <div className="bg-mono-black/50 border border-mono-silver/20 rounded p-3">
                  <p className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider mb-1">
                    Energy
                  </p>
                  <p className="font-montserrat text-xl">{clip.analysis.audioEnergy}</p>
                </div>
                <div className="bg-mono-black/50 border border-mono-silver/20 rounded p-3">
                  <p className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider mb-1">
                    Motion
                  </p>
                  <p className="font-montserrat text-xl">{clip.analysis.motionScore}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-inter text-mono-silver/60">Pacing</span>
                  <span className="font-montserrat">{clip.analysis.pacing}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-inter text-mono-silver/60">Lighting</span>
                  <span className="font-montserrat">{clip.analysis.lighting}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-inter text-mono-silver/60">Color Grade</span>
                  <span className="font-montserrat">{clip.analysis.colorGrade}</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-mono-silver/10" />

            <div className="space-y-3">
              <button
                onClick={handleSaveClip}
                disabled={isSaving}
                className="w-full bg-mono-white text-mono-black font-montserrat font-semibold px-4 py-3 rounded hover:bg-mono-silver hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Clip'}
              </button>

              <button
                onClick={handleExportTrimmed}
                disabled={isSaving}
                className="w-full border border-mono-silver/30 text-mono-white font-montserrat font-semibold px-4 py-3 rounded hover:bg-mono-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export Trimmed Clip</span>
              </button>

              <button
                onClick={handleExportOriginal}
                disabled={isSaving}
                className="w-full border border-mono-silver/30 text-mono-white font-montserrat font-semibold px-4 py-3 rounded hover:bg-mono-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export Original Clip</span>
              </button>

              <button
                onClick={handleRegenerateClip}
                disabled={isSaving}
                className="w-full border border-mono-silver/30 text-mono-white font-montserrat font-semibold px-4 py-3 rounded hover:bg-mono-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Regenerate Clip
              </button>
              <button
                onClick={handleDeleteClip}
                disabled={isSaving}
                className="w-full border border-red-500/30 text-red-400 font-montserrat font-semibold px-4 py-3 rounded hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Clip
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Graphs and Timeline - hidden in fullscreen */}
      {!isFullscreen && (
        <>
          {/* Emotion Curve Graph */}
          <MemoizedEmotionGraph
            clip={clip}
            startTime={trimStart}
            endTime={trimEnd}
            duration={trimEnd - trimStart}
            regenerateKey={regenerateKey}
          />

          {/* Motion Activity Curve */}
          <MemoizedMotionCurve
            clip={clip}
            startTime={trimStart}
            endTime={trimEnd}
            duration={trimEnd - trimStart}
            regenerateKey={regenerateKey}
          />

          {/* Bottom: Timeline Editor */}
          <div className="h-32 border-t border-mono-silver/10 bg-mono-shadow/50 px-6 py-4 transition-opacity duration-150">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-montserrat font-semibold text-sm">Timeline</h4>
                <span className="font-inter text-xs text-mono-silver/60">
                  {formatTime(trimStart)} → {formatTime(trimEnd)} (
                  {(trimEnd - trimStart).toFixed(1)}s)
                </span>
              </div>

              <div
                className="flex-1 relative bg-mono-black/50 border border-mono-silver/20 rounded overflow-hidden cursor-pointer"
                onClick={handleTimelineClick}
              >
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-y-0 bg-mono-white/5 border-l-2 border-r-2 border-mono-white/40"
                    style={{
                      left: `${(trimStart / (videoDuration || clip.endTime)) * 100}%`,
                      right: `${100 - (trimEnd / (videoDuration || clip.endTime)) * 100}%`,
                    }}
                  >
                    <div
                      className="absolute inset-y-0 w-0.5 bg-mono-white shadow-[0_0_8px_rgba(255,255,255,0.6)] pointer-events-none"
                      style={{
                        left: `${((currentTime - trimStart) / (trimEnd - trimStart)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="absolute inset-0 flex items-end justify-between px-2 pb-2 pointer-events-none">
                  {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                    const time = trimStart + fraction * (trimEnd - trimStart);
                    return (
                      <div key={fraction} className="flex flex-col items-center">
                        <div className="w-px h-2 bg-mono-silver/40" />
                        <span className="font-inter text-[10px] text-mono-silver/60 mt-1">
                          {formatTime(time)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-mono-black border border-mono-silver/20 rounded-lg shadow-2xl w-full max-w-md p-6 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold tracking-tight">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-mono-silver hover:text-mono-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: 'Space', description: 'Play / Pause' },
                { key: '⌘+F', description: 'Toggle Fullscreen' },
                { key: '←', description: 'Seek -5s' },
                { key: '→', description: 'Seek +5s' },
                { key: '?', description: 'Show shortcuts' },
                { key: 'Esc', description: 'Close modal / Exit Fullscreen' },
              ].map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between">
                  <span className="font-inter text-sm text-mono-silver">
                    {shortcut.description}
                  </span>
                  <kbd className="px-2 py-1 text-xs font-montserrat bg-mono-slate/50 border border-mono-silver/20 rounded">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-up">
          <div className="bg-mono-white text-mono-black px-6 py-3 rounded-lg shadow-2xl font-montserrat font-semibold">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}

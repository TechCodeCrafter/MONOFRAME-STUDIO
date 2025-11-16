'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getProjectById, updateProject, type Clip, type Project } from '@/lib/projectStore';
import { exportTrimmedClip, exportOriginalClip } from '@/lib/exporter';
import { useExportOverlay } from '@/components/export';

// Debounce utility
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

export default function ClipEditorPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const clipId = parseInt(params.clipId as string, 10);

  const { hideExportOverlay } = useExportOverlay();

  const [project, setProject] = useState<Project | null>(null);
  const [clip, setClip] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Trim controls
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Load project and clip
  useEffect(() => {
    const loadedProject = getProjectById(projectId);
    if (!loadedProject || !loadedProject.clips) {
      router.push('/dashboard');
      return;
    }

    const foundClip = loadedProject.clips.find((c) => c.id === clipId);
    if (!foundClip) {
      router.push(`/dashboard/${projectId}`);
      return;
    }

    setProject(loadedProject);
    setClip(foundClip);
    setTrimStart(foundClip.startTime);
    setTrimEnd(foundClip.endTime);
    setLoading(false);
  }, [projectId, clipId, router]);

  // Auto-save clip edits with debounce
  const saveClipEdits = useCallback(() => {
    if (!project || !clip) return;

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
  }, [project, clip, trimStart, trimEnd, projectId]);

  const debouncedSave = useDebounce(saveClipEdits, 400);

  // Trigger save when trim values change
  useEffect(() => {
    if (clip && (trimStart !== clip.startTime || trimEnd !== clip.endTime)) {
      debouncedSave();
    }
  }, [trimStart, trimEnd, clip, debouncedSave]);

  // Video player controls
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

  const handleTimeUpdate = () => {
    if (videoRef.current && clip) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // Enforce trim bounds during playback
      if (time < trimStart) {
        videoRef.current.currentTime = trimStart;
      } else if (time >= trimEnd) {
        videoRef.current.currentTime = trimStart;
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && clip) {
      const fullDuration = videoRef.current.duration;
      setVideoDuration(fullDuration);
      setDuration(trimEnd - trimStart);
      videoRef.current.currentTime = trimStart;
    }
  };

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

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space = play/pause
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        togglePlayPause();
      }
      // ? = show shortcuts
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      // Escape = close shortcuts or go back
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
        }
      }
      // Left arrow = -5s
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(currentTime - 5);
      }
      // Right arrow = +5s
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSeek(currentTime + 5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, showShortcuts, togglePlayPause, handleSeek]);

  // Switch to another clip
  const handleClipChange = (newClipId: number) => {
    router.push(`/dashboard/${projectId}/editor/${newClipId}`);
  };

  // Show toast notification
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Save Clip manually
  const handleSaveClip = () => {
    if (!project || !clip) return;

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

    setTimeout(() => {
      setIsSaving(false);
      showToastNotification('Clip saved successfully!');
    }, 1000);
  };

  // Regenerate Clip with AI simulation
  const handleRegenerateClip = () => {
    if (!project || !clip) return;

    // Simulate AI regeneration
    const randomOffset = (Math.random() - 0.5) * 4; // ±2 seconds
    const newStart = Math.max(clip.startTime - 5, Math.max(0, clip.startTime + randomOffset));
    const newEnd = Math.min(clip.endTime + 5, Math.min(videoDuration, clip.endTime + randomOffset));
    const newScore = Math.max(
      70,
      Math.min(100, clip.score + Math.floor((Math.random() - 0.5) * 10))
    );

    const updatedClips = project.clips!.map((c) =>
      c.id === clip.id
        ? {
            ...c,
            startTime: newStart,
            endTime: newEnd,
            duration: newEnd - newStart,
            timestamp: `${formatTime(newStart)} - ${formatTime(newEnd)}`,
            score: newScore,
            analysis: {
              ...c.analysis,
              emotionalScore: Math.max(
                70,
                Math.min(100, c.analysis.emotionalScore + Math.floor((Math.random() - 0.5) * 10))
              ),
              sceneTension: Math.max(
                70,
                Math.min(100, c.analysis.sceneTension + Math.floor((Math.random() - 0.5) * 10))
              ),
              audioEnergy: Math.max(
                70,
                Math.min(100, c.analysis.audioEnergy + Math.floor((Math.random() - 0.5) * 10))
              ),
              motionScore: Math.max(
                70,
                Math.min(100, c.analysis.motionScore + Math.floor((Math.random() - 0.5) * 10))
              ),
            },
          }
        : c
    );

    updateProject(projectId, { clips: updatedClips });

    // Update local state
    setTrimStart(newStart);
    setTrimEnd(newEnd);

    // Reload clip data
    const updatedProject = getProjectById(projectId);
    const updatedClip = updatedProject?.clips?.find((c) => c.id === clipId);
    if (updatedClip) {
      setClip(updatedClip);
      setProject(updatedProject!);
    }

    showToastNotification('Clip regenerated with new AI analysis!');
  };

  // Delete Clip
  const handleDeleteClip = () => {
    if (!project || !clip) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${clip.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    const updatedClips = project.clips!.filter((c) => c.id !== clip.id);
    updateProject(projectId, { clips: updatedClips });

    showToastNotification('Clip deleted');

    // Redirect back to project
    setTimeout(() => {
      router.push(`/dashboard/${projectId}`);
    }, 1000);
  };

  // Handle trim start change with bounds checking
  const handleTrimStartChange = (value: number) => {
    const newStart = Math.max(0, Math.min(value, trimEnd - 0.5));
    setTrimStart(newStart);
    if (videoRef.current) {
      videoRef.current.currentTime = newStart;
    }
  };

  // Handle trim end change with bounds checking
  const handleTrimEndChange = (value: number) => {
    const newEnd = Math.max(trimStart + 0.5, Math.min(value, videoDuration));
    setTrimEnd(newEnd);
  };

  // Handle timeline click to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !clip) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = trimStart + pos * (trimEnd - trimStart);

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Export trimmed clip
  const handleExportTrimmed = async () => {
    if (!clip || !project) return;

    const videoUrl = clip.videoUrl || project.videoUrl;
    if (!videoUrl) {
      showToastNotification('Video URL not available');
      return;
    }

    try {
      const sanitizedTitle = clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}_trimmed.mp4`;

      // Export overlay is handled by exporter.ts
      await exportTrimmedClip(videoUrl, trimStart, trimEnd, filename);

      hideExportOverlay();
      showToastNotification('Clip exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      hideExportOverlay();
      showToastNotification('Export failed. Please try again.');
    }
  };

  // Export original clip
  const handleExportOriginal = async () => {
    if (!clip || !project) return;

    const videoUrl = clip.videoUrl || project.videoUrl;
    if (!videoUrl) {
      showToastNotification('Video URL not available');
      return;
    }

    try {
      const sanitizedTitle = clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}_original.mp4`;

      // Export overlay is handled by exporter.ts
      await exportOriginalClip(videoUrl, filename);

      hideExportOverlay();
      showToastNotification('Original clip exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      hideExportOverlay();
      showToastNotification('Export failed. Please try again.');
    }
  };

  if (loading || !project || !clip) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-mono-black">
        <svg
          className="w-16 h-16 stroke-mono-white animate-pulse-slow"
          viewBox="0 0 64 64"
          fill="none"
          strokeWidth="1.5"
        >
          <rect x="8" y="8" width="48" height="48" />
          <line x1="32" y1="8" x2="32" y2="56" />
          <line x1="8" y1="32" x2="56" y2="32" />
        </svg>
      </div>
    );
  }

  const progress = duration > 0 ? ((currentTime - trimStart) / (trimEnd - trimStart)) * 100 : 0;

  return (
    <div className="h-screen flex flex-col bg-mono-black text-mono-white overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-mono-silver/10 flex items-center justify-between px-6 bg-mono-shadow/50 backdrop-blur-sm">
        <div className="flex items-center space-x-6">
          {/* Back Button */}
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

          {/* Clip Selector */}
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
          {/* Save Indicator */}
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

          {/* Keyboard Shortcuts Button */}
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

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Player */}
        <div className="flex-1 flex flex-col p-6 relative">
          {/* Cinematic Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="w-full max-w-5xl aspect-video bg-mono-shadow border border-mono-silver/10 rounded-lg overflow-hidden relative group">
              {/* Video Element */}
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
                {/* Timeline Scrubber */}
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
                    {/* Progress */}
                    <div
                      className="absolute inset-y-0 left-0 bg-mono-white rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                    {/* Scrubber Handle */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-mono-white rounded-full shadow-lg opacity-0 group-hover/scrubber:opacity-100 transition-opacity"
                      style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlayPause}
                      className="w-10 h-10 rounded-full border border-mono-silver/30 flex items-center justify-center hover:bg-mono-white/10 transition-all"
                    >
                      {isPlaying ? (
                        <svg className="w-4 h-4 fill-mono-white" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 fill-mono-white ml-0.5" viewBox="0 0 24 24">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      )}
                    </button>

                    {/* Time Display */}
                    <span className="font-inter text-sm text-mono-white">
                      {formatTime(currentTime)} / {formatTime(trimEnd)}
                    </span>
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={() => videoRef.current?.requestFullscreen()}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-mono-white/10 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 stroke-mono-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                    >
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Play Overlay (when not playing) */}
              {!isPlaying && (
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-mono-black/30 backdrop-blur-sm group-hover:bg-mono-black/50 transition-all"
                >
                  <div className="w-20 h-20 rounded-full bg-mono-white/10 border-2 border-mono-white flex items-center justify-center hover:bg-mono-white/20 hover:scale-110 transition-all">
                    <svg className="w-8 h-8 fill-mono-white ml-1" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Editor Sidebar */}
        <aside className="w-[350px] border-l border-mono-silver/10 bg-mono-shadow/30 flex flex-col overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Clip Info */}
            <div>
              <h3 className="font-montserrat font-semibold text-lg mb-4">Clip Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider block mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={clip.title}
                    readOnly
                    className="w-full bg-mono-black/50 border border-mono-silver/20 rounded px-3 py-2 text-sm font-inter text-mono-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider block mb-1">
                      Duration
                    </label>
                    <div className="bg-mono-black/50 border border-mono-silver/20 rounded px-3 py-2 text-sm font-montserrat">
                      {(trimEnd - trimStart).toFixed(1)}s
                    </div>
                  </div>
                  <div>
                    <label className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider block mb-1">
                      Score
                    </label>
                    <div className="bg-mono-black/50 border border-mono-silver/20 rounded px-3 py-2 text-sm font-montserrat flex items-center">
                      <div className="w-2 h-2 bg-mono-white rounded-full mr-2" />
                      {clip.score}/100
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-mono-silver/10" />

            {/* Trimming Controls */}
            <div>
              <h3 className="font-montserrat font-semibold text-lg mb-4">Trim Clip</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider block mb-2">
                    Start Time: {formatTime(trimStart)}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={videoDuration || clip.endTime}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => handleTrimStartChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-mono-silver/20 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mono-white
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                  />
                </div>
                <div>
                  <label className="font-inter text-xs text-mono-silver/60 uppercase tracking-wider block mb-2">
                    End Time: {formatTime(trimEnd)}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={videoDuration || clip.endTime}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => handleTrimEndChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-mono-silver/20 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mono-white
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-mono-silver/10" />

            {/* Simple Waveform Visualization (Static) */}
            <div>
              <h3 className="font-montserrat font-semibold text-lg mb-4">Audio Waveform</h3>
              <div className="h-20 bg-mono-black/50 border border-mono-silver/20 rounded flex items-center justify-center gap-[2px] px-4">
                {[...Array(50)].map((_, i) => {
                  const height = Math.random() * 60 + 20;
                  return (
                    <div
                      key={i}
                      className="w-1 bg-mono-silver/40 rounded-full"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-mono-silver/10" />

            {/* AI Insights */}
            <div>
              <h3 className="font-montserrat font-semibold text-lg mb-4">AI Insights</h3>
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

            {/* Separator */}
            <div className="h-px bg-mono-silver/10" />

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSaveClip}
                disabled={isSaving}
                className="w-full bg-mono-white text-mono-black font-montserrat font-semibold px-4 py-3 rounded hover:bg-mono-silver hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Clip'}
              </button>

              {/* Export Trimmed Clip Button */}
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

              {/* Export Original Clip Button */}
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
          </div>
        </aside>
      </div>

      {/* Bottom: Timeline Editor */}
      <div className="h-32 border-t border-mono-silver/10 bg-mono-shadow/50 px-6 py-4">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-montserrat font-semibold text-sm">Timeline</h4>
            <span className="font-inter text-xs text-mono-silver/60">
              {formatTime(trimStart)} → {formatTime(trimEnd)} ({(trimEnd - trimStart).toFixed(1)}s)
            </span>
          </div>

          {/* Timeline Track */}
          <div
            className="flex-1 relative bg-mono-black/50 border border-mono-silver/20 rounded overflow-hidden cursor-pointer"
            onClick={handleTimelineClick}
          >
            {/* Full video duration background */}
            <div className="absolute inset-0">
              {/* Clip Boundaries (Trim Area) */}
              <div
                className="absolute inset-y-0 bg-mono-white/5 border-l-2 border-r-2 border-mono-white/40"
                style={{
                  left: `${(trimStart / (videoDuration || clip.endTime)) * 100}%`,
                  right: `${100 - (trimEnd / (videoDuration || clip.endTime)) * 100}%`,
                }}
              >
                {/* Current Time Indicator */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-mono-white shadow-[0_0_8px_rgba(255,255,255,0.6)] pointer-events-none"
                  style={{
                    left: `${((currentTime - trimStart) / (trimEnd - trimStart)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Time Markers */}
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
              <h3 className="font-montserrat font-bold text-xl">Keyboard Shortcuts</h3>
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
                { key: 'Space', action: 'Play / Pause' },
                { key: '← →', action: 'Seek -5s / +5s' },
                { key: '?', action: 'Toggle Shortcuts' },
                { key: 'Esc', action: 'Close Modal' },
                { key: 'F', action: 'Fullscreen (in player)' },
              ].map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between py-2 border-b border-mono-silver/10 last:border-0"
                >
                  <span className="font-inter text-sm text-mono-silver">{shortcut.action}</span>
                  <kbd className="font-montserrat text-xs px-2 py-1 rounded bg-mono-slate/50 border border-mono-silver/20">
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
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
          <div className="bg-mono-white text-mono-black px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-inter font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

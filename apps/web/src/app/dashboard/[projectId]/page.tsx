'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProjectById, deleteProject, type Project } from '@/lib/projectStore';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [selectedClipIndex, setSelectedClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Handle clip selection
  useEffect(() => {
    if (videoRef.current && project?.clips?.[selectedClipIndex]) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.load();
      videoRef.current.currentTime = project.clips[selectedClipIndex].startTime || 0;
    }
  }, [selectedClipIndex, project?.clips]);

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

  const handleTimeUpdate = () => {
    if (videoRef.current && project.clips) {
      setCurrentTime(videoRef.current.currentTime);

      const currentClip = project.clips[selectedClipIndex];
      if (currentClip.endTime && videoRef.current.currentTime >= currentClip.endTime) {
        videoRef.current.currentTime = currentClip.startTime || 0;
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && project.clips) {
      const currentClip = project.clips[selectedClipIndex];
      setDuration(currentClip.endTime - currentClip.startTime);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && project.clips) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const currentClip = project.clips[selectedClipIndex];
      const clipDuration = currentClip.endTime - currentClip.startTime;
      const newTime = currentClip.startTime + pos * clipDuration;
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
      router.push('/dashboard');
    }
  };

  const currentClip = project.clips?.[selectedClipIndex];
  const progress =
    duration > 0 && currentClip
      ? ((currentTime - currentClip.startTime) / (currentClip.endTime - currentClip.startTime)) *
        100
      : 0;

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
            <button className="px-4 py-2 border border-mono-white/30 text-mono-white font-montserrat text-sm rounded hover:bg-mono-white/5 transition-colors">
              Export
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
              <button
                key={clip.id}
                onClick={() => setSelectedClipIndex(index)}
                className={`
                  w-full text-left p-4 border rounded-lg transition-all duration-300
                  ${
                    selectedClipIndex === index
                      ? 'border-mono-white bg-mono-white/5 scale-[1.02]'
                      : 'border-mono-silver/30 hover:border-mono-white hover:bg-mono-white/5'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-montserrat font-semibold text-base">{clip.title}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-mono-white rounded-full" />
                    <span className="font-inter text-sm">{clip.score}</span>
                  </div>
                </div>
                <p className="font-inter text-xs text-mono-silver mb-1">{clip.timestamp}</p>
                <p className="font-inter text-xs text-mono-silver/70">{clip.duration}s</p>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content - Video Player + Analysis */}
        <main className="space-y-6">
          {/* Video Player */}
          <div className="aspect-video bg-mono-shadow border border-mono-silver/30 rounded-lg relative overflow-hidden group">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            >
              <source src={currentClip?.videoUrl} type="video/mp4" />
            </video>

            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-mono-black/50 backdrop-blur-sm transition-opacity"
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

            {/* Controls */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-mono-black via-mono-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div
                className="relative w-full h-2 bg-mono-silver/20 rounded-full cursor-pointer mb-4"
                onClick={handleSeek}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-mono-white rounded-full"
                  style={{ width: `${progress}%` }}
                />
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
                    {formatTime(currentTime)} / {formatTime(currentClip?.endTime || 0)}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-montserrat text-sm text-mono-silver">
                    {currentClip?.title}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Panel */}
          {currentClip && (
            <div className="border border-mono-silver/30 rounded-lg p-8 bg-mono-slate/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-montserrat font-semibold text-xl">AI Analysis</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-mono-white rounded-full animate-pulse" />
                  <span className="font-inter text-xs text-mono-silver uppercase tracking-wider">
                    AI Detected
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: 'Emotional Score', value: currentClip.analysis.emotionalScore },
                  { label: 'Scene Tension', value: currentClip.analysis.sceneTension },
                  { label: 'Audio Energy', value: currentClip.analysis.audioEnergy },
                  { label: 'Motion Score', value: currentClip.analysis.motionScore },
                  { label: 'Shot Stability', value: currentClip.analysis.shotStability },
                  { label: 'Cinematic Rhythm', value: currentClip.analysis.cinematicRhythm },
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
                      <div className="h-full bg-mono-white" style={{ width: `${metric.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-mono-silver/20 my-8" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider mb-2">
                    Duration
                  </p>
                  <p className="font-montserrat text-xl">{currentClip.duration}s</p>
                </div>
                <div>
                  <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider mb-2">
                    Pacing
                  </p>
                  <p className="font-montserrat text-xl">{currentClip.analysis.pacing}</p>
                </div>
                <div>
                  <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider mb-2">
                    Lighting
                  </p>
                  <p className="font-montserrat text-xl">{currentClip.analysis.lighting}</p>
                </div>
                <div>
                  <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider mb-2">
                    Color Grade
                  </p>
                  <p className="font-montserrat text-xl">{currentClip.analysis.colorGrade}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

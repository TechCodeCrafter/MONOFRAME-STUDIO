'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function PreviewPage() {
  const [selectedClip, setSelectedClip] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock generated clips with video URLs
  // TODO: Replace with actual processed clip URLs from backend
  const clips = [
    {
      id: 1,
      title: 'Emotional Peak #1',
      timestamp: '00:34 - 00:52',
      score: 94,
      description: 'High-energy moment with strong emotional resonance',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      startTime: 34,
      endTime: 52,
      duration: 18,
      analysis: {
        emotionalScore: 94,
        sceneTension: 87,
        audioEnergy: 92,
        motionScore: 88,
        shotStability: 91,
        cinematicRhythm: 89,
        pacing: 'Dynamic',
        lighting: 'Dramatic',
        colorGrade: 'Vibrant',
      },
    },
    {
      id: 2,
      title: 'Highlight Moment #2',
      timestamp: '01:12 - 01:28',
      score: 89,
      description: 'Dramatic pacing with cinematic timing',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      startTime: 72,
      endTime: 88,
      duration: 16,
      analysis: {
        emotionalScore: 89,
        sceneTension: 91,
        audioEnergy: 85,
        motionScore: 82,
        shotStability: 94,
        cinematicRhythm: 87,
        pacing: 'Intense',
        lighting: 'Moody',
        colorGrade: 'Desaturated',
      },
    },
    {
      id: 3,
      title: 'Peak Scene #3',
      timestamp: '02:45 - 03:03',
      score: 91,
      description: 'Engaging narrative arc with visual impact',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      startTime: 165,
      endTime: 183,
      duration: 18,
      analysis: {
        emotionalScore: 91,
        sceneTension: 78,
        audioEnergy: 88,
        motionScore: 95,
        shotStability: 86,
        cinematicRhythm: 92,
        pacing: 'Fast',
        lighting: 'Balanced',
        colorGrade: 'Cinematic',
      },
    },
  ];

  const currentClip = clips[selectedClip];

  // Handle clip selection
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.load();
      // Set start time for the clip
      videoRef.current.currentTime = currentClip.startTime || 0;
    }
  }, [selectedClip, currentClip.startTime]);

  // Toggle play/pause
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

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Loop clip if end time is reached
      if (currentClip.endTime && videoRef.current.currentTime >= currentClip.endTime) {
        videoRef.current.currentTime = currentClip.startTime || 0;
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Handle metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(currentClip.endTime - currentClip.startTime);
    }
  };

  // Handle timeline seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const clipDuration = currentClip.endTime - currentClip.startTime;
      const newTime = currentClip.startTime + pos * clipDuration;
      videoRef.current.currentTime = newTime;
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const progress = duration > 0 
    ? ((currentTime - currentClip.startTime) / (currentClip.endTime - currentClip.startTime)) * 100 
    : 0;

  // Export single clip
  const exportClip = async (clipIndex: number) => {
    const clip = clips[clipIndex];
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress (in production, this would be real ffmpeg processing)
    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Wait for "processing"
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create a dummy file for download (in production, this would be the actual trimmed clip)
    const filename = `${clip.title.replace(/\s+/g, '_')}_MonoFrame.mp4`;
    
    // For MVP: Download the source video or create a placeholder
    // In production: This would be the trimmed clip from backend/ffmpeg
    try {
      const response = await fetch(clip.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }

    setIsExporting(false);
    setExportProgress(0);
  };

  // Export all clips
  const exportAllClips = async () => {
    setIsExporting(true);
    setExportProgress(0);

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const progressPerClip = 100 / clips.length;
      
      // Update progress
      setExportProgress((i / clips.length) * 100);

      try {
        const response = await fetch(clip.videoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${clip.title.replace(/\s+/g, '_')}_MonoFrame.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Export error for clip ${i}:`, error);
      }

      setExportProgress(((i + 1) / clips.length) * 100);
    }

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
    setIsExporting(false);
    setExportProgress(0);
  };

  return (
    <main className="min-h-screen bg-mono-black text-mono-white flex flex-col animate-fade-in">
      {/* Cinematic Vignette */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_70%)]" />

      {/* Export Progress Modal */}
      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mono-black/90 backdrop-blur-sm animate-fade-in">
          <div className="text-center space-y-8 max-w-md mx-auto px-6">
            {/* Pulsing MonoFrame Logo */}
            <svg
              className="w-20 h-20 mx-auto stroke-mono-white animate-pulse-slow"
              viewBox="0 0 64 64"
              fill="none"
              strokeWidth="1.5"
            >
              <rect x="8" y="8" width="48" height="48" />
              <line x1="32" y1="8" x2="32" y2="56" />
              <line x1="8" y1="32" x2="56" y2="32" />
            </svg>

            <div>
              <h2 className="font-montserrat font-bold text-3xl mb-3">
                Exporting Your Clips
              </h2>
              <p className="font-inter text-lg text-mono-silver">
                Processing cinematic edits...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="w-full h-2 bg-mono-silver/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-mono-white transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="font-inter text-sm text-mono-silver">
                {Math.round(exportProgress)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Export Success Notification */}
      {showExportSuccess && (
        <div className="fixed top-8 right-8 z-50 animate-fade-in">
          <div className="bg-mono-white text-mono-black px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-4">
            <svg
              className="w-6 h-6 stroke-mono-black"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="8,12 11,15 16,10" />
            </svg>
            <div>
              <p className="font-montserrat font-semibold">Export Complete!</p>
              <p className="font-inter text-sm text-mono-black/70">
                Your clips are ready
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-mono-silver/20 py-8 px-8 relative z-10">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <svg
              className="w-10 h-10"
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="8" y="8" width="48" height="48" />
              <line x1="32" y1="8" x2="32" y2="56" />
              <line x1="8" y1="32" x2="56" y2="32" />
            </svg>
            <span className="font-montserrat font-bold text-2xl">MONOFRAME</span>
          </Link>
          <p className="font-montserrat text-sm text-mono-silver/60 tracking-widest uppercase">
            Step 3 of 3 — Preview & Export
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-12 relative z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Title Section */}
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="font-montserrat font-bold text-5xl md:text-7xl mb-6">
              Your Cinematic Edits
            </h1>
            <p className="font-inter text-xl md:text-2xl text-mono-silver/80">
              AI detected {clips.length} high-impact moments
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 animate-fade-up animation-delay-200">
            {/* Clips List */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="font-montserrat font-semibold text-xl mb-6 tracking-wide">
                GENERATED CLIPS
              </h2>
              {clips.map((clip, index) => (
                <div key={clip.id}>
                  <button
                    onClick={() => setSelectedClip(index)}
                    className={`
                      w-full text-left p-6 border rounded-lg transition-all duration-300
                      ${
                        selectedClip === index
                          ? 'border-mono-white bg-mono-white/5 scale-[1.02]'
                          : 'border-mono-silver/30 hover:border-mono-white hover:bg-mono-white/5'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-montserrat font-semibold text-lg">
                        {clip.title}
                      </h3>
                      <div className="flex items-center space-x-2 relative">
                        {/* Subtle heartbeat behind score */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 bg-mono-white/5 rounded-full animate-pulse-slow" />
                        </div>
                        <div className="w-2 h-2 bg-mono-white rounded-full relative z-10" />
                        <span className="font-inter text-sm text-mono-silver relative z-10">
                          {clip.score}
                        </span>
                      </div>
                    </div>
                    <p className="font-inter text-sm text-mono-silver mb-2">
                      {clip.timestamp}
                    </p>
                    <p className="font-inter text-xs text-mono-silver/70">
                      {clip.description}
                    </p>
                  </button>
                  {/* Subtle separator */}
                  {index < clips.length - 1 && (
                    <div className="h-px bg-mono-silver/10 my-3" />
                  )}
                </div>
              ))}
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Video Player */}
                <div className="aspect-video bg-mono-black border border-mono-silver/30 rounded-lg relative overflow-hidden group">
                  {/* HTML5 Video Element */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                  >
                    <source src={currentClip.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Fullscreen Toggle Button */}
                  <button
                    onClick={() => videoRef.current?.requestFullscreen()}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded hover:bg-mono-white/10 transition-all duration-300 opacity-70 hover:opacity-100 animate-fade-in z-20"
                    aria-label="Fullscreen"
                  >
                    <svg
                      className="w-5 h-5 stroke-mono-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>

                  {/* Play/Pause Overlay Button */}
                  {!isPlaying && (
                    <button
                      onClick={togglePlayPause}
                      className="absolute inset-0 flex items-center justify-center bg-mono-black/50 backdrop-blur-sm transition-opacity group-hover:bg-mono-black/60"
                    >
                      <div className="w-20 h-20 rounded-full bg-mono-white/10 border-2 border-mono-white flex items-center justify-center hover:bg-mono-white/20 transition-all duration-300">
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
                  <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-mono-black via-mono-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Timeline Scrubber */}
                    <div
                      className="relative w-full h-2 bg-mono-silver/20 rounded-full cursor-pointer mb-4 group/timeline"
                      onClick={handleSeek}
                    >
                      {/* Progress */}
                      <div
                        className="absolute inset-y-0 left-0 bg-mono-white rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                      {/* Hover indicator */}
                      <div className="absolute inset-y-0 left-0 right-0 opacity-0 group-hover/timeline:opacity-100 transition-opacity">
                        <div className="h-full bg-mono-white/20 rounded-full" />
                      </div>
                      {/* Scrubber handle */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-mono-white rounded-full shadow-lg opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                        style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                      />
                    </div>

                    {/* Control Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Play/Pause Button */}
                        <button
                          onClick={togglePlayPause}
                          className="w-10 h-10 rounded-full border border-mono-silver/30 flex items-center justify-center hover:bg-mono-white/10 transition-colors"
                        >
                          {isPlaying ? (
                            <svg
                              className="w-4 h-4 stroke-mono-white"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 stroke-mono-white ml-0.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              strokeWidth="2"
                            >
                              <polygon points="5,3 19,12 5,21" fill="currentColor" />
                            </svg>
                          )}
                        </button>

                        {/* Time Display */}
                        <span className="font-inter text-sm text-mono-silver">
                          {formatTime(currentTime)} / {formatTime(currentClip.endTime)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Clip Title */}
                        <span className="font-montserrat text-sm text-mono-silver">
                          {currentClip.title}
                        </span>
                        
                        {/* AI Score */}
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-mono-white rounded-full" />
                          <span className="font-inter text-sm text-mono-silver">
                            {currentClip.score}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail Timeline Strip */}
                    <div className="mt-4 flex gap-1 overflow-x-auto scrollbar-hide">
                      {clips.map((clip, index) => (
                        <button
                          key={clip.id}
                          onClick={() => setSelectedClip(index)}
                          className={`
                            flex-shrink-0 w-24 h-14 rounded border transition-all duration-300
                            ${
                              selectedClip === index
                                ? 'border-mono-white scale-105'
                                : 'border-mono-silver/30 hover:border-mono-silver'
                            }
                          `}
                        >
                          <div className="w-full h-full bg-mono-slate/50 flex items-center justify-center">
                            <span className="font-inter text-xs text-mono-silver">
                              Clip {index + 1}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Analysis Panel */}
                <div className="border border-mono-silver/30 rounded-lg p-8 bg-mono-slate/30">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-montserrat font-semibold text-xl">
                      AI Analysis
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-mono-white rounded-full animate-pulse" />
                      <span className="font-inter text-xs text-mono-silver uppercase tracking-wider">
                        AI Detected
                      </span>
                    </div>
                  </div>

                  {/* Score Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-2">
                      <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider">
                        Emotional Score
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <p className="font-montserrat text-3xl font-bold">
                          {currentClip.analysis.emotionalScore}
                        </p>
                        <span className="font-inter text-sm text-mono-silver">/100</span>
                      </div>
                      <div className="h-1 bg-mono-silver/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-mono-white"
                          style={{ width: `${currentClip.analysis.emotionalScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider">
                        Scene Tension
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <p className="font-montserrat text-3xl font-bold">
                          {currentClip.analysis.sceneTension}
                        </p>
                        <span className="font-inter text-sm text-mono-silver">/100</span>
                      </div>
                      <div className="h-1 bg-mono-silver/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-mono-white"
                          style={{ width: `${currentClip.analysis.sceneTension}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider">
                        Audio Energy
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <p className="font-montserrat text-3xl font-bold">
                          {currentClip.analysis.audioEnergy}
                        </p>
                        <span className="font-inter text-sm text-mono-silver">/100</span>
                      </div>
                      <div className="h-1 bg-mono-silver/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-mono-white"
                          style={{ width: `${currentClip.analysis.audioEnergy}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider">
                        Motion Score
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <p className="font-montserrat text-3xl font-bold">
                          {currentClip.analysis.motionScore}
                        </p>
                        <span className="font-inter text-sm text-mono-silver">/100</span>
                      </div>
                      <div className="h-1 bg-mono-silver/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-mono-white"
                          style={{ width: `${currentClip.analysis.motionScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider">
                        Shot Stability
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <p className="font-montserrat text-3xl font-bold">
                          {currentClip.analysis.shotStability}
                        </p>
                        <span className="font-inter text-sm text-mono-silver">/100</span>
                      </div>
                      <div className="h-1 bg-mono-silver/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-mono-white"
                          style={{ width: `${currentClip.analysis.shotStability}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-inter text-xs text-mono-silver/70 uppercase tracking-wider">
                        Cinematic Rhythm
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <p className="font-montserrat text-3xl font-bold">
                          {currentClip.analysis.cinematicRhythm}
                        </p>
                        <span className="font-inter text-sm text-mono-silver">/100</span>
                      </div>
                      <div className="h-1 bg-mono-silver/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-mono-white"
                          style={{ width: `${currentClip.analysis.cinematicRhythm}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-mono-silver/20 mb-8" />

                  {/* Descriptive Metrics */}
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

                {/* Export Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={exportAllClips}
                    disabled={isExporting}
                    className={`
                      flex-1 font-montserrat font-semibold px-8 py-4 rounded transition-all duration-300
                      ${
                        isExporting
                          ? 'bg-mono-slate text-mono-silver cursor-not-allowed'
                          : 'bg-mono-white text-mono-black hover:bg-mono-silver'
                      }
                    `}
                  >
                    {isExporting ? 'Exporting...' : 'Export All Clips'}
                  </button>
                  <button
                    onClick={() => exportClip(selectedClip)}
                    disabled={isExporting}
                    className={`
                      flex-1 font-montserrat font-semibold px-8 py-4 rounded transition-all duration-300
                      ${
                        isExporting
                          ? 'border-2 border-mono-silver/30 text-mono-silver/50 cursor-not-allowed'
                          : 'border-2 border-mono-white text-mono-white hover:bg-mono-white hover:text-mono-black'
                      }
                    `}
                  >
                    Export This Clip
                  </button>
                </div>

                {/* Additional Options */}
                <div className="text-center pt-12">
                  <Link
                    href="/upload"
                    className="font-inter text-sm text-mono-silver hover:text-mono-white transition-colors underline"
                  >
                    Upload another video
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


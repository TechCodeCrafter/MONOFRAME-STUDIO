'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

/**
 * EditorShowcase - Displays a mockup of the Clip Editor in action
 * Shows the Emotion Curve, Motion Curve, and Timeline with real video playback
 */
export default function EditorShowcase() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoLoaded = () => {
    setIsLoading(false);
  };
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-mono-black via-mono-slate/20 to-mono-black">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-mono-white/[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-montserrat text-sm text-mono-silver/60 tracking-widest uppercase mb-4">
            The Intelligent Editor
          </p>
          <h2 className="font-montserrat font-bold text-5xl md:text-6xl mb-6">See It In Action</h2>
          <p className="font-inter text-xl text-mono-silver max-w-3xl mx-auto">
            AI-powered curves analyze every frame for emotion, motion, and cinematic rhythm.
          </p>
        </motion.div>

        {/* Editor Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Main Container */}
          <div className="bg-mono-black border border-mono-silver/20 rounded-lg overflow-hidden shadow-2xl">
            {/* Video Player */}
            <div className="aspect-video bg-mono-black relative border-b border-mono-silver/10 group cursor-pointer">
              {/* Loading Shimmer */}
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-mono-black via-mono-slate/20 to-mono-black animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-mono-white/20 border-t-mono-white rounded-full animate-spin" />
                  </div>
                </div>
              )}

              {/* Actual Video Element */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={handleVideoLoaded}
                onClick={togglePlayPause}
              >
                <source src="/demo.mp4" type="video/mp4" />
                {/* Fallback for browsers that don't support video */}
                <div className="absolute inset-0 flex items-center justify-center bg-mono-shadow">
                  <p className="font-inter text-sm text-mono-silver/60">
                    Your browser doesn&apos;t support video playback
                  </p>
                </div>
              </video>

              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />

              {/* Play/Pause Button Overlay */}
              {!isPlaying && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-mono-black/30 backdrop-blur-sm transition-opacity">
                  <button
                    onClick={togglePlayPause}
                    className="w-20 h-20 rounded-full bg-mono-white/10 border-2 border-mono-white flex items-center justify-center hover:bg-mono-white/20 hover:scale-110 transition-all shadow-2xl"
                  >
                    <svg
                      className="w-10 h-10 stroke-mono-white ml-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                    >
                      <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Hover Play Button (when playing) */}
              {isPlaying && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={togglePlayPause}
                    className="w-16 h-16 rounded-full bg-mono-black/50 border-2 border-mono-white/60 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <svg
                      className="w-6 h-6 text-mono-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Bottom Gradient (for depth) */}
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-mono-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Emotion Curve */}
            <div className="relative h-32 bg-black/20 border-b border-mono-silver/10">
              <div className="absolute top-3 left-4 text-xs font-montserrat font-semibold text-mono-silver/60 uppercase tracking-wider z-10">
                Emotional Curve
              </div>
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="emotionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,1)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
                  </linearGradient>
                  <filter id="emotionGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M 0 80 Q 150 40, 300 50 T 600 60 Q 750 70, 900 40 T 1200 60"
                  fill="none"
                  stroke="url(#emotionGradient)"
                  strokeWidth="3"
                  filter="url(#emotionGlow)"
                />
              </svg>
            </div>

            {/* Motion Curve */}
            <div className="relative h-32 bg-black/20 border-b border-mono-silver/10">
              <div className="absolute top-3 left-4 text-xs font-montserrat font-semibold text-cyan-400/80 uppercase tracking-wider z-10">
                Motion Activity
              </div>
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="motionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(0,255,255,0.5)" />
                    <stop offset="50%" stopColor="rgba(0,255,255,1)" />
                    <stop offset="100%" stopColor="rgba(0,255,255,0.5)" />
                  </linearGradient>
                  <filter id="motionGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M 0 70 Q 100 30, 200 55 T 400 45 Q 550 80, 700 50 T 1000 55 Q 1100 40, 1200 65"
                  fill="none"
                  stroke="url(#motionGradient)"
                  strokeWidth="3"
                  filter="url(#motionGlow)"
                />
              </svg>
            </div>

            {/* Timeline */}
            <div className="h-24 bg-mono-shadow/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-montserrat font-semibold text-sm text-mono-white">
                  Timeline
                </span>
                <span className="font-inter text-xs text-mono-silver/60">00:32 → 01:15 (43s)</span>
              </div>
              <div className="relative h-8 bg-mono-black/50 border border-mono-silver/20 rounded overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2/3 h-full bg-mono-white/5 border-l-2 border-r-2 border-mono-white/40" />
                </div>
                <div className="absolute left-1/3 inset-y-0 w-0.5 bg-mono-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
            </div>
          </div>

          {/* Floating Labels */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute -top-6 -left-6 bg-mono-white text-mono-black px-4 py-2 rounded-full font-montserrat font-semibold text-sm shadow-xl"
          >
            AI-Powered
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="absolute -bottom-6 -right-6 bg-mono-slate/80 border border-mono-silver/30 text-mono-white px-4 py-2 rounded-full font-montserrat font-semibold text-sm shadow-xl backdrop-blur-sm"
          >
            Real-Time Analysis
          </motion.div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-3 mt-16"
        >
          {['Emotion Detection', 'Motion Tracking', 'Scene Analysis', 'Auto Trimming'].map(
            (feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                className="px-4 py-2 bg-mono-white/5 border border-mono-silver/20 rounded-full font-inter text-sm text-mono-silver hover:bg-mono-white/10 hover:border-mono-white/30 transition-all"
              >
                {feature}
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}

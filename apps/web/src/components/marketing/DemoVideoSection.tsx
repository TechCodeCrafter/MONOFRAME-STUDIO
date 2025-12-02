'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Pause, Volume2, Maximize2 } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

interface DemoVideoSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Video URL (if available) */
  videoUrl?: string;
  /** Poster image URL */
  posterUrl?: string;
  /** CTA text */
  ctaText?: string;
  /** CTA link */
  ctaHref?: string;
  /** Show stats overlay */
  showStats?: boolean;
  /** Stats data */
  stats?: Array<{
    value: string;
    label: string;
  }>;
  /** Enable animated waveform */
  enableWaveform?: boolean;
  /** Background gradient variant */
  backgroundVariant?: 'gradient' | 'solid' | 'none';
}

export function DemoVideoSection({
  title = 'See It In Action',
  description = 'Watch how MonoFrame transforms a raw video into a cinematic highlight reel',
  videoUrl,
  posterUrl,
  ctaText = 'Try it yourself with your own video',
  ctaHref = '/demo/ai-editor',
  showStats = true,
  stats = [
    { value: '3 min', label: 'Original length' },
    { value: '45 sec', label: 'Highlight reel' },
    { value: '8 clips', label: 'Best moments' },
  ],
  enableWaveform = true,
  backgroundVariant = 'gradient',
}: DemoVideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate random waveform heights
  const waveformBars = Array.from({ length: 40 }, () => Math.random() * 100);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const backgroundClasses = {
    gradient: 'bg-gradient-to-b from-mono-black to-mono-charcoal',
    solid: 'bg-mono-charcoal',
    none: 'bg-transparent',
  };

  return (
    <section
      id="demo"
      className={`py-28 px-4 ${backgroundClasses[backgroundVariant]}`}
    >
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20"></div>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <RevealOnScroll.FadeUp>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              {title}
            </h2>
            <p className="text-xl text-mono-silver font-inter max-w-2xl mx-auto">
              {description}
            </p>
          </div>
        </RevealOnScroll.FadeUp>

        {/* Video Container */}
        <RevealOnScroll delay={200}>
          <div
            className="relative aspect-video bg-mono-charcoal border border-mono-border rounded-lg overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Video Element (if URL provided) */}
            {videoUrl ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={posterUrl}
                onClick={handlePlayPause}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              /* Placeholder with Animated Waveform */
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-mono-charcoal via-mono-black to-mono-charcoal">
                {/* Waveform Background */}
                {enableWaveform && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1 px-8 opacity-20">
                    {waveformBars.map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-mono-white rounded-full transition-all duration-300"
                        style={{
                          height: `${height}%`,
                          animation: `waveform ${1 + Math.random()}s ease-in-out infinite`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="relative z-10 text-center">
                  <div
                    className={`w-20 h-20 bg-mono-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-mono-white/20 transition-all duration-300 cursor-pointer ${
                      isHovered
                        ? 'bg-mono-white/20 scale-110 border-mono-white/40'
                        : ''
                    }`}
                  >
                    <Play className="w-10 h-10 text-mono-white translate-x-0.5" />
                  </div>
                  <p className="text-mono-silver font-inter">
                    {isHovered ? 'Click to watch demo' : 'Interactive demo preview'}
                  </p>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-mono-white/20" />
                <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-mono-white/20" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-mono-white/20" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-mono-white/20" />

                {/* Floating Info Labels */}
                <div className="absolute top-8 left-8 px-3 py-1 bg-mono-black/80 backdrop-blur-sm border border-mono-white/20 rounded text-sm font-inter text-mono-silver">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                  Demo Preview
                </div>
              </div>
            )}

            {/* Video Controls (if video is playing) */}
            {videoUrl && (
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-mono-black/90 to-transparent p-4 transition-opacity duration-300 ${
                  isHovered || isPlaying ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="w-10 h-10 bg-mono-white/10 hover:bg-mono-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-mono-white/20 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 translate-x-0.5" />
                    )}
                  </button>
                  <div className="flex-1 h-1 bg-mono-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-mono-white w-1/3 rounded-full" />
                  </div>
                  <Volume2 className="w-5 h-5 text-mono-silver" />
                  <Maximize2 className="w-5 h-5 text-mono-silver cursor-pointer hover:text-mono-white transition-colors" />
                </div>
              </div>
            )}

            {/* Stats Overlay */}
            {showStats && stats.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-mono-black/90 to-transparent p-8">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {stats.map((stat, i) => (
                    <div key={i} className="group">
                      <div className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">
                        {stat.value}
                      </div>
                      <div className="text-sm text-mono-silver font-inter">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hover Glow Effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr from-mono-white/5 to-transparent transition-opacity duration-500 pointer-events-none ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </RevealOnScroll>

        {/* CTA */}
        {ctaText && ctaHref && (
          <RevealOnScroll delay={400}>
            <div className="text-center mt-12">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 text-lg font-semibold text-mono-white hover:text-mono-silver transition-colors group"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </RevealOnScroll>
        )}

        {/* Waveform Animation */}
        <style jsx>{`
          @keyframes waveform {
            0%, 100% {
              height: 20%;
              opacity: 0.3;
            }
            50% {
              height: 100%;
              opacity: 0.6;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

/**
 * Preset: Minimal Demo (no stats, no waveform)
 */
DemoVideoSection.Minimal = function MinimalDemo(
  props: Omit<DemoVideoSectionProps, 'showStats' | 'enableWaveform'>
) {
  return (
    <DemoVideoSection
      showStats={false}
      enableWaveform={false}
      {...props}
    />
  );
};

/**
 * Preset: Stats Focus (prominent stats, minimal decoration)
 */
DemoVideoSection.StatsFocus = function StatsFocusDemo(
  props: Omit<DemoVideoSectionProps, 'enableWaveform'>
) {
  return (
    <DemoVideoSection
      enableWaveform={false}
      showStats={true}
      {...props}
    />
  );
};

/**
 * Preset: Full Experience (all features enabled)
 */
DemoVideoSection.Full = function FullDemo(
  props: Omit<DemoVideoSectionProps, 'showStats' | 'enableWaveform'>
) {
  return (
    <DemoVideoSection
      showStats={true}
      enableWaveform={true}
      {...props}
    />
  );
};


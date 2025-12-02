'use client';

import { Quote, Heart, Lightbulb, Target } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

interface FounderStorySectionProps {
  /** Section title */
  title?: string;
  /** Founder name */
  founderName?: string;
  /** Founder title */
  founderTitle?: string;
  /** Founder avatar (initials or image URL) */
  founderAvatar?: string;
  /** Story paragraphs */
  story?: string[];
  /** Mission statement */
  mission?: string;
  /** Layout direction */
  layout?: 'image-left' | 'image-right';
  /** Background variant */
  backgroundVariant?: 'dark' | 'light' | 'gradient';
  /** Show decorative quote */
  showQuote?: boolean;
}

export function FounderStorySection({
  title = 'Why We Built MonoFrame',
  founderName = 'Praj Vaggu',
  founderTitle = 'Founder & CEO, MonoFrame Studio',
  founderAvatar = 'PV',
  story = [
    'As a content creator, I spent countless hours watching raw footage frame by frame, trying to find the "magic moments." I knew there had to be a better way.',
    'That\'s when I realized: what if AI could watch the entire video, detect emotional peaks, identify the best scenes, and suggest professional cuts automatically?',
    'MonoFrame Studio was born from that frustration. We built the tool we wished existed—a professional video editor that works at the speed of thought, powered by AI, accessible to everyone through the browser.',
  ],
  mission = 'Our mission: democratize professional video editing. Make it fast, intelligent, and accessible to every creator, regardless of technical skill or budget.',
  layout = 'image-left',
  backgroundVariant = 'dark',
  showQuote = true,
}: FounderStorySectionProps) {
  const backgroundClasses = {
    dark: 'bg-mono-charcoal text-mono-white',
    light: 'bg-mono-white text-mono-black',
    gradient: 'bg-gradient-to-b from-mono-black to-mono-charcoal text-mono-white',
  };

  return (
    <section className={`py-28 px-4 ${backgroundClasses[backgroundVariant]}`}>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20"></div>
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        {title && (
          <RevealOnScroll.FadeUp>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold">
                {title}
              </h2>
            </div>
          </RevealOnScroll.FadeUp>
        )}

        {/* Two-Column Layout */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
            layout === 'image-right' ? 'lg:flex-row-reverse' : ''
          }`}
        >
          {/* Image Column */}
          <RevealOnScroll delay={layout === 'image-left' ? 100 : 200}>
            <div className={`${layout === 'image-right' ? 'lg:order-2' : ''}`}>
              <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
                {/* Image Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-mono-white/10 to-mono-white/5 border border-mono-white/20 flex items-center justify-center overflow-hidden group">
                  {/* Avatar/Initials */}
                  <div className="text-9xl font-bold text-mono-white/20">
                    {founderAvatar}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-mono-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-mono-white/30" />
                  <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-mono-white/30" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-mono-white/30" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-mono-white/30" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute -z-10 top-8 left-8 w-full h-full border border-mono-border" />
              </div>
            </div>
          </RevealOnScroll>

          {/* Text Column */}
          <RevealOnScroll delay={layout === 'image-left' ? 200 : 100}>
            <div className={`space-y-6 ${layout === 'image-right' ? 'lg:order-1' : ''}`}>
              {/* Decorative Quote Icon */}
              {showQuote && (
                <div className="mb-8">
                  <Quote className="w-12 h-12 text-mono-silver/40" />
                </div>
              )}

              {/* Story Paragraphs */}
              <div className="space-y-6">
                {story.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-lg text-mono-silver font-inter leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Mission Statement */}
              {mission && (
                <div className="pt-6 mt-6 border-t border-mono-border">
                  <div className="flex items-start gap-3 mb-4">
                    <Target className="w-6 h-6 text-mono-white flex-shrink-0 mt-1" />
                    <p className="text-mono-white font-semibold text-xl">
                      {mission}
                    </p>
                  </div>
                </div>
              )}

              {/* Founder Info */}
              <div className="pt-8 mt-8 border-t border-mono-border">
                <div className="flex items-center gap-4">
                  {/* Small Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-mono-white/20 to-mono-white/5 border border-mono-white/20 rounded-full flex items-center justify-center font-bold text-xl">
                    {founderAvatar}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="text-xl font-semibold">{founderName}</div>
                    <div className="text-sm text-mono-silver font-inter">
                      {founderTitle}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

/**
 * Preset: ImageRight (image on right side)
 */
FounderStorySection.ImageRight = function ImageRightFounder(
  props: Omit<FounderStorySectionProps, 'layout'>
) {
  return <FounderStorySection layout="image-right" {...props} />;
};

/**
 * Preset: Minimal (no quote decoration)
 */
FounderStorySection.Minimal = function MinimalFounder(
  props: Omit<FounderStorySectionProps, 'showQuote'>
) {
  return <FounderStorySection showQuote={false} {...props} />;
};

/**
 * Preset: Light (light background)
 */
FounderStorySection.Light = function LightFounder(
  props: Omit<FounderStorySectionProps, 'backgroundVariant'>
) {
  return <FounderStorySection backgroundVariant="light" {...props} />;
};

/**
 * Preset: Gradient (gradient background)
 */
FounderStorySection.Gradient = function GradientFounder(
  props: Omit<FounderStorySectionProps, 'backgroundVariant'>
) {
  return <FounderStorySection backgroundVariant="gradient" {...props} />;
};


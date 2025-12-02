'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, Quote, CheckCircle2, TrendingUp, Users, Award } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { RecentActivityFeed } from '../social-proof';

interface Stat {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  prefix?: string;
  suffix?: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

interface SocialProofSectionProps {
  /** Section title (optional) */
  title?: string;
  /** Section description (optional) */
  description?: string;
  /** Main statistics */
  stats?: Stat[];
  /** Featured testimonial */
  testimonial?: Testimonial;
  /** Company logos (names or URLs) */
  companies?: string[];
  /** Show trust badges */
  showTrustBadges?: boolean;
  /** Trust badge items */
  trustBadges?: string[];
  /** Background variant */
  backgroundVariant?: 'light' | 'dark' | 'gradient';
  /** Enable counter animation for stats */
  enableCounterAnimation?: boolean;
}

export function SocialProofSection({
  title = 'Trusted by creators worldwide',
  description,
  stats = [
    { value: '10K+', label: 'Videos Edited', icon: TrendingUp },
    { value: '5K+', label: 'Active Creators', icon: Users },
    { value: '98%', label: 'Satisfaction Rate', icon: Award },
  ],
  testimonial = {
    quote: 'MonoFrame cut my editing time by 90%. I can now focus on creating content instead of spending hours in post-production.',
    author: 'Sarah Chen',
    role: 'Content Creator',
    company: 'YouTube',
    avatar: 'SC',
    rating: 5,
  },
  companies = ['Creator Co', 'MediaLab', 'Studio X', 'Agency Y'],
  showTrustBadges = false,
  trustBadges = ['SOC 2 Certified', 'GDPR Compliant', '256-bit Encryption'],
  backgroundVariant = 'dark',
  enableCounterAnimation = true,
}: SocialProofSectionProps) {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer for counter animation
  useEffect(() => {
    if (!enableCounterAnimation) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [enableCounterAnimation, isInView]);

  const backgroundClasses = {
    light: 'bg-mono-white text-mono-black',
    dark: 'bg-mono-black text-mono-white border-y border-mono-border',
    gradient: 'bg-gradient-to-b from-mono-charcoal to-mono-black text-mono-white',
  };

  return (
    <section
      ref={sectionRef}
      className={`py-20 px-4 ${backgroundClasses[backgroundVariant]}`}
    >
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20"></div>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        {(title || description) && (
          <RevealOnScroll.FadeUp>
            <div className="text-center mb-12">
              {title && (
                <p className="text-center text-mono-silver font-inter mb-4">
                  {title}
                </p>
              )}
              {description && (
                <h2 className="text-3xl md:text-5xl font-bold">
                  {description}
                </h2>
              )}
            </div>
          </RevealOnScroll.FadeUp>
        )}

        {/* Company Logos */}
        {companies && companies.length > 0 && (
          <RevealOnScroll delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center mb-16">
              {companies.map((company, i) => (
                <div
                  key={i}
                  className="text-xl md:text-2xl font-bold text-mono-silver/40 hover:text-mono-silver/60 transition-colors"
                >
                  {company}
                </div>
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <RevealOnScroll delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center p-8 border border-mono-border hover:border-mono-white transition-all group"
                >
                  {stat.icon && (
                    <stat.icon className="w-10 h-10 mx-auto mb-4 text-mono-silver group-hover:text-mono-white transition-colors" />
                  )}
                  <div
                    className={`text-5xl font-bold mb-2 ${
                      enableCounterAnimation && isInView
                        ? 'animate-count-up'
                        : ''
                    }`}
                  >
                    {stat.prefix}
                    {stat.value}
                    {stat.suffix}
                  </div>
                  <div className="text-mono-silver font-inter group-hover:text-mono-white transition-colors">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* Testimonial Glass Card */}
        {testimonial && (
          <RevealOnScroll delay={400}>
            <div className="max-w-4xl mx-auto">
              <div className="relative p-8 md:p-12 border border-mono-white/20 bg-mono-white/5 backdrop-blur-lg rounded-lg overflow-hidden group hover:border-mono-white/40 transition-all">
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-mono-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Quote icon */}
                <div className="absolute top-6 left-6 opacity-20">
                  <Quote className="w-16 h-16" />
                </div>

                <div className="relative z-10">
                  {/* Rating */}
                  {testimonial.rating && (
                    <div className="flex gap-1 mb-6 justify-center md:justify-start">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-mono-white text-mono-white"
                        />
                      ))}
                    </div>
                  )}

                  {/* Quote */}
                  <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-8 text-center md:text-left">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-gradient-to-br from-mono-white/20 to-mono-white/5 border border-mono-white/20 rounded-full flex items-center justify-center font-semibold text-lg backdrop-blur-sm">
                      {testimonial.avatar || testimonial.author.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="text-left">
                      <div className="font-semibold text-lg">
                        {testimonial.author}
                      </div>
                      <div className="text-mono-silver font-inter">
                        {testimonial.role}
                        {testimonial.company && (
                          <span className="text-mono-silver/60">
                            {' • '}
                            {testimonial.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative corner accents */}
                <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-mono-white/10 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-mono-white/10 rounded-bl-lg" />
              </div>
            </div>
          </RevealOnScroll>
        )}

        {/* Trust Badges */}
        {showTrustBadges && trustBadges && trustBadges.length > 0 && (
          <RevealOnScroll delay={600}>
            <div className="flex flex-wrap gap-6 justify-center items-center mt-12">
              {trustBadges.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 border border-mono-border rounded-full hover:border-mono-white transition-colors group"
                >
                  <CheckCircle2 className="w-4 h-4 text-mono-silver group-hover:text-mono-white transition-colors" />
                  <span className="text-sm font-inter text-mono-silver group-hover:text-mono-white transition-colors">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* Recent Activity Feed */}
        <RevealOnScroll delay={600}>
          <div className="flex justify-center mt-12">
            <RecentActivityFeed />
          </div>
        </RevealOnScroll>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes count-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-count-up {
          animation: count-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
}

/**
 * Preset: Minimal (stats only, no testimonial)
 */
SocialProofSection.Minimal = function MinimalProof(
  props: Omit<SocialProofSectionProps, 'testimonial'>
) {
  return <SocialProofSection testimonial={undefined} {...props} />;
};

/**
 * Preset: Testimonial Focus (large testimonial, minimal stats)
 */
SocialProofSection.TestimonialFocus = function TestimonialFocusProof(
  props: SocialProofSectionProps
) {
  return (
    <SocialProofSection
      stats={undefined}
      companies={undefined}
      {...props}
    />
  );
};

/**
 * Preset: Full (all elements)
 */
SocialProofSection.Full = function FullProof(
  props: Omit<SocialProofSectionProps, 'showTrustBadges'>
) {
  return <SocialProofSection showTrustBadges={true} {...props} />;
};

/**
 * Preset: Light (light background variant)
 */
SocialProofSection.Light = function LightProof(
  props: Omit<SocialProofSectionProps, 'backgroundVariant'>
) {
  return <SocialProofSection backgroundVariant="light" {...props} />;
};


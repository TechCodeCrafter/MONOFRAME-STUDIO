'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { WaitlistSignup } from './WaitlistSignup';
import { LiveWaitlistCount, AvatarMarquee } from '../social-proof';

interface HeroSectionProps {
  /** Main headline text */
  headline?: string;
  /** Highlighted portion of headline (gradient effect) */
  headlineHighlight?: string;
  /** Subheadline/description */
  subheadline?: string;
  /** Badge text above headline */
  badge?: string;
  /** Primary CTA text */
  primaryCtaText?: string;
  /** Primary CTA link */
  primaryCtaHref?: string;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Secondary CTA link */
  secondaryCtaHref?: string;
  /** Trust badges/features */
  trustBadges?: string[];
  /** Enable parallax scrolling effect */
  enableParallax?: boolean;
  /** Enable animated grid background */
  enableGrid?: boolean;
  /** Enable floating elements */
  enableFloatingElements?: boolean;
  /** Video background URL (optional) */
  videoBackgroundUrl?: string;
}

export function HeroSection({
  headline = 'Turn Raw Footage',
  headlineHighlight = 'Cinematic Stories',
  subheadline = 'MonoFrame Studio analyzes emotions, finds the best moments, and crafts highlight reels automatically. Like having a professional editor in your browser.',
  badge = '✨ AI-Powered Video Editing',
  primaryCtaText = 'Try Live Demo',
  primaryCtaHref = '/demo/ai-editor',
  secondaryCtaText = 'View Pricing',
  secondaryCtaHref = '#pricing',
  trustBadges = ['No credit card required', '100% browser-based', 'Export in seconds'],
  enableParallax = true,
  enableGrid = true,
  enableFloatingElements = true,
  videoBackgroundUrl,
}: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  // Parallax scroll effect with requestAnimationFrame
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enableParallax) return;

    let frameId: number | null = null;

    const handleScroll = () => {
      const scrollY = window.scrollY || 0;
      setScrollY(scrollY);
      
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(() => {
        // Slight parallax; clamp for safety
        const offset = Math.min(scrollY * 0.15, 120);
        setParallaxOffset(offset);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [enableParallax]);

  // Background parallax effect with requestAnimationFrame
  useEffect(() => {
    if (typeof window === "undefined") return;

    let frameId: number | null = null;

    const handleScroll = () => {
      const scrollY = window.scrollY || 0;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(() => {
        // Slight parallax; clamp for safety
        const offset = Math.min(scrollY * 0.15, 120);
        setParallaxOffset(offset);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  // Mouse move effect for floating elements
  useEffect(() => {
    if (!enableFloatingElements) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableFloatingElements]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-4 pt-24 overflow-hidden"
    >
      {/* Video Background */}
      {videoBackgroundUrl && (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src={videoBackgroundUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-mono-black/50 via-mono-black/70 to-mono-black" />
        </div>
      )}

      {/* Parallax Background Wrapper */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          transform: `translateY(-${parallaxOffset}px)`,
          transition: "transform 0.08s linear",
        }}
      >
        {/* Animated Grid Background */}
        {enableGrid && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              transform: enableParallax ? `translateY(${scrollY * 0.3}px)` : undefined,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '100px 100px',
                animation: 'gridPulse 4s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Floating Gradient Orbs */}
        {enableFloatingElements && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Orb 1 - Top Right */}
            <div
              className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                top: '10%',
                right: '10%',
                transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            />
            {/* Orb 2 - Bottom Left */}
            <div
              className="absolute w-96 h-96 rounded-full opacity-15 blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)',
                bottom: '15%',
                left: '15%',
                transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            />
            {/* Orb 3 - Center */}
            <div
              className="absolute w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            />
          </div>
        )}

        {/* Floating Particles */}
        {enableFloatingElements && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none animate-parallax opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-mono-white rounded-full opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${10 + Math.random() * 20}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className="relative z-10 max-w-6xl mx-auto text-center"
        style={{
          transform: enableParallax ? `translateY(${scrollY * -0.15}px)` : undefined,
        }}
      >
        {/* Badge */}
        {badge && (
          <RevealOnScroll.FadeUpLarge delay={0}>
            <div className="inline-block px-4 py-2 border border-mono-border rounded-full mb-8 backdrop-blur-sm bg-mono-black/50 hover:border-mono-white transition-colors group">
              <span className="text-sm font-inter text-mono-silver group-hover:text-mono-white transition-colors">
                {badge}
              </span>
            </div>
          </RevealOnScroll.FadeUpLarge>
        )}

        {/* Main Headline */}
        <RevealOnScroll.FadeUpLarge delay={100}>
          <div className="relative">
            <h1 className="text-7xl md:text-8xl font-bold tracking-tight mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]">
              {headline}
              <br />
              Into{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-mono-white via-mono-silver to-mono-white animate-gradient">
                  {headlineHighlight}
                </span>
                {/* Animated underline */}
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-mono-white to-transparent opacity-50 animate-pulse" />
              </span>
            </h1>
            <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-white"></div>
          </div>
        </RevealOnScroll.FadeUpLarge>

        {/* Subheadline */}
        <RevealOnScroll delay={200}>
          <p className="text-xl md:text-2xl text-mono-silver mb-4 max-w-3xl mx-auto font-inter leading-relaxed">
            {subheadline}
          </p>
          <p className="text-sm text-white/40 mt-4 mb-12">
            Trusted by over <span className="text-white">10,000+</span> creators worldwide.
          </p>
        </RevealOnScroll>

        {/* CTAs */}
        <RevealOnScroll delay={300}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {/* Primary CTA */}
            <Link
              href={primaryCtaHref}
              className="group relative bg-white text-black px-6 py-3 rounded-lg font-semibold shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_55px_rgba(255,255,255,0.4)] transition-all duration-300 flex items-center gap-2 overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="relative z-10">{primaryCtaText}</span>
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            </Link>

            {/* Secondary CTA */}
            {secondaryCtaText && (
              <Link
                href={secondaryCtaHref}
                className="group border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/5 hover:border-white/40 transition-all duration-300 font-semibold backdrop-blur-sm flex items-center gap-2"
              >
                {secondaryCtaText}
                <ArrowRight className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </RevealOnScroll>

        {/* Waitlist Signup */}
        <RevealOnScroll delay={400}>
          <div className="max-w-2xl mx-auto mb-12">
            <WaitlistSignup placeholder="Enter your email to get early access" />
          </div>
        </RevealOnScroll>

        {/* Trust Badges */}
        {trustBadges && trustBadges.length > 0 && (
          <RevealOnScroll delay={500}>
            <div className="flex flex-wrap gap-8 justify-center text-sm text-mono-silver font-inter">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <CheckCircle2 className="w-4 h-4 text-mono-white group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-mono-white transition-colors">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* Social Proof - Waitlist Count + Avatars */}
        <RevealOnScroll delay={600}>
          <div className="mt-12 space-y-6">
            <div className="flex justify-center">
              <LiveWaitlistCount />
            </div>
            <AvatarMarquee />
          </div>
        </RevealOnScroll>

        {/* Sparkle decoration */}
        {enableFloatingElements && (
          <div className="absolute top-20 right-10 hidden lg:block animate-pulse-slow">
            <Sparkles className="w-8 h-8 text-mono-silver/30" />
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <RevealOnScroll delay={600}>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer group">
          <div className="w-6 h-10 border-2 border-mono-border group-hover:border-mono-white transition-colors rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-mono-white rounded-full animate-scroll-indicator" />
          </div>
          <div className="text-xs text-mono-silver font-inter mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            Scroll
          </div>
        </div>
      </RevealOnScroll>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes parallaxMove {
          from { transform: translateY(0); }
          to { transform: translateY(-15px); }
        }

        @keyframes gridPulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.15; }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-50px) translateX(-10px);
            opacity: 0.3;
          }
          75% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.5;
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        @keyframes scroll-indicator {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(12px);
            opacity: 0.5;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-scroll-indicator {
          animation: scroll-indicator 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-parallax {
          animation: parallaxMove 3s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
}

/**
 * Preset: Minimal Hero (clean, no effects)
 */
HeroSection.Minimal = function MinimalHero(props: Omit<HeroSectionProps, 'enableParallax' | 'enableGrid' | 'enableFloatingElements'>) {
  return (
    <HeroSection
      enableParallax={false}
      enableGrid={false}
      enableFloatingElements={false}
      {...props}
    />
  );
};

/**
 * Preset: Video Hero (with background video)
 */
HeroSection.Video = function VideoHero(props: HeroSectionProps) {
  return (
    <HeroSection
      enableGrid={false}
      {...props}
    />
  );
};

/**
 * Preset: Interactive Hero (maximum effects)
 */
HeroSection.Interactive = function InteractiveHero(props: Omit<HeroSectionProps, 'enableParallax' | 'enableGrid' | 'enableFloatingElements'>) {
  return (
    <HeroSection
      enableParallax={true}
      enableGrid={true}
      enableFloatingElements={true}
      {...props}
    />
  );
};


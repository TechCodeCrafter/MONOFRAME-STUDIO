'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { WaitlistSignup } from './WaitlistSignup';
import { LiveWaitlistCount } from '../social-proof';

interface FinalCtaSectionProps {
  /** Main headline */
  headline?: string;
  /** Subheadline/description */
  subheadline?: string;
  /** Primary CTA text */
  primaryCtaText?: string;
  /** Primary CTA link */
  primaryCtaHref?: string;
  /** Primary CTA icon */
  primaryCtaIcon?: React.ComponentType<{ className?: string }>;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Secondary CTA link */
  secondaryCtaHref?: string;
  /** Secondary CTA icon */
  secondaryCtaIcon?: React.ComponentType<{ className?: string }>;
  /** Show email capture */
  showEmailCapture?: boolean;
  /** Trust badges/reassurance text */
  trustBadges?: string[];
  /** Background variant */
  backgroundVariant?: 'dark' | 'light' | 'gradient';
  /** Show decorative elements */
  showDecorations?: boolean;
}

export function FinalCtaSection({
  headline = 'Ready To Transform Your Videos?',
  subheadline = 'Join thousands of creators who\'ve already discovered the future of video editing',
  primaryCtaText = 'Get Started',
  primaryCtaHref = '/signup',
  primaryCtaIcon = Play,
  secondaryCtaText = 'View Pricing',
  secondaryCtaHref = '#pricing',
  secondaryCtaIcon = ArrowRight,
  showEmailCapture = false,
  trustBadges = [
    'No credit card required',
    'Cancel anytime',
    '14-day free trial',
  ],
  backgroundVariant = 'dark',
  showDecorations = true,
}: FinalCtaSectionProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      // Handle email submission (e.g., API call)
    }
  };

  const backgroundClasses = {
    dark: 'bg-mono-black text-mono-white',
    light: 'bg-mono-white text-mono-black',
    gradient: 'bg-gradient-to-b from-mono-charcoal to-mono-black text-mono-white',
  };

  const PrimaryIcon = primaryCtaIcon;
  const SecondaryIcon = secondaryCtaIcon;

  return (
    <section className={`relative py-28 px-4 overflow-hidden ${backgroundClasses[backgroundVariant]}`}>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20"></div>
      {/* Decorative Background Elements */}
      {showDecorations && (
        <>
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-mono-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-mono-white/5 rounded-full blur-3xl" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />
          </div>
        </>
      )}

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Headline */}
        <RevealOnScroll.FadeUpLarge>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            {headline}
          </h2>
        </RevealOnScroll.FadeUpLarge>

        {/* Subheadline */}
        <RevealOnScroll delay={200}>
          <p className="text-xl md:text-2xl text-mono-silver font-inter mb-12 max-w-2xl mx-auto">
            {subheadline}
          </p>
        </RevealOnScroll>

        {/* Waitlist Signup or CTAs */}
        {showEmailCapture ? (
          <RevealOnScroll delay={300}>
            <div className="max-w-2xl mx-auto mb-8">
              <WaitlistSignup 
                placeholder="Enter your email to join the waitlist" 
                buttonText={primaryCtaText}
              />
            </div>
          </RevealOnScroll>
        ) : (
          /* Two CTAs */
          <RevealOnScroll delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {/* Primary CTA */}
              <Link
                href={primaryCtaHref}
                className="group relative bg-white text-black px-6 py-3 rounded-lg font-semibold shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_55px_rgba(255,255,255,0.4)] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <span className="relative z-10">{primaryCtaText}</span>
                <PrimaryIcon className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary CTA */}
              <Link
                href={secondaryCtaHref}
                className="group border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/5 hover:border-white/40 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              >
                {secondaryCtaText}
                <SecondaryIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </RevealOnScroll>
        )}

        {/* Trust Badges */}
        {trustBadges && trustBadges.length > 0 && (
          <RevealOnScroll delay={400}>
            <div className="flex flex-wrap gap-6 justify-center text-sm text-mono-silver font-inter">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-mono-white" />
                  {badge}
                </div>
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* Live Waitlist Count */}
        <RevealOnScroll delay={500}>
          <div className="flex justify-center mt-12">
            <LiveWaitlistCount compact={true} />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/**
 * Preset: WithEmail (email capture instead of buttons)
 */
FinalCtaSection.WithEmail = function EmailCaptureCta(
  props: Omit<FinalCtaSectionProps, 'showEmailCapture'>
) {
  return <FinalCtaSection showEmailCapture={true} {...props} />;
};

/**
 * Preset: Minimal (no decorations)
 */
FinalCtaSection.Minimal = function MinimalCta(
  props: Omit<FinalCtaSectionProps, 'showDecorations'>
) {
  return <FinalCtaSection showDecorations={false} {...props} />;
};

/**
 * Preset: Light (light background)
 */
FinalCtaSection.Light = function LightCta(
  props: Omit<FinalCtaSectionProps, 'backgroundVariant'>
) {
  return <FinalCtaSection backgroundVariant="light" {...props} />;
};

/**
 * Preset: Gradient (gradient background)
 */
FinalCtaSection.Gradient = function GradientCta(
  props: Omit<FinalCtaSectionProps, 'backgroundVariant'>
) {
  return <FinalCtaSection backgroundVariant="gradient" {...props} />;
};


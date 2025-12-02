'use client';

import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import { WaitlistSignup } from '../marketing/WaitlistSignup';

export function DemoFinalCTA() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      {/* Section Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20" />

      {/* Background Effects */}
      <div className="relative">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Upload Your First Video
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto font-inter">
            Experience MonoFrame's AI editing yourself. No installation required, 100% free to try.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {/* Primary CTA */}
            <Link
              href="/demo/ai-editor"
              className="group relative bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_55px_rgba(255,255,255,0.4)] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden hover:scale-105 active:scale-95"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <Play className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Try MonoFrame Free</span>
            </Link>

            {/* Secondary CTA - Waitlist trigger */}
            <button
              onClick={() => {
                // Scroll to waitlist or show modal
                const waitlistEl = document.querySelector('#final-cta-waitlist');
                waitlistEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="group border border-white/20 text-white px-8 py-4 rounded-lg hover:bg-white/5 hover:border-white/40 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
            >
              Join the Waitlist
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Waitlist Signup */}
          <div id="final-cta-waitlist" className="max-w-2xl mx-auto">
            <div className="mb-6">
              <p className="text-white/60 text-sm font-inter mb-4">
                Or join the waitlist to get notified when we launch new features:
              </p>
            </div>
            <WaitlistSignup 
              placeholder="Enter your email for early access"
              buttonText="Get Early Access"
            />
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-8 justify-center text-sm text-white/50 font-inter mt-12">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Process locally in your browser</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Export in seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


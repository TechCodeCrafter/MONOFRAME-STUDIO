'use client';

import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';

export function HeroDemo() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 pt-32 pb-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-block px-4 py-2 border border-white/20 rounded-full mb-8 backdrop-blur-sm bg-white/5">
          <span className="text-sm font-inter text-white/80">
            ✨ Live Demo
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
          Experience the Future of Editing
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto font-inter leading-relaxed">
          Watch a real MonoFrame AI cut. See how our AI analyzes emotion, motion, and pacing to create cinematic highlights automatically.
        </p>

        {/* CTA */}
        <Link
          href="/demo/ai-editor"
          className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_55px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Play className="w-5 h-5" />
          Try It Yourself
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Secondary Text */}
        <p className="mt-6 text-sm text-white/50 font-inter">
          No upload required • See results instantly
        </p>
      </div>
    </section>
  );
}


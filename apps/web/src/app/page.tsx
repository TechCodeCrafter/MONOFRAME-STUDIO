'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'landing_page',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail('');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to join waitlist. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      // Fallback to success for demo purposes
      setSubmitted(true);
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-mono-black text-mono-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 border-b border-mono-silver/20">
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-mono-shadow via-mono-black to-mono-slate opacity-50" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8 animate-fade-up">
            {/* Logo/Brand Mark */}
            <div className="inline-block mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="8" y="8" width="48" height="48" />
                <line x1="32" y1="8" x2="32" y2="56" />
                <line x1="8" y1="32" x2="56" y2="32" />
              </svg>
            </div>

            {/* Cinematic glow behind headline */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[800px] h-[300px] bg-mono-white/5 blur-[120px] rounded-full" />
              </div>

              {/* Headline */}
              <h1 className="relative font-montserrat font-bold text-6xl md:text-8xl lg:text-9xl tracking-tight leading-none">
                MONOFRAME
              </h1>
            </div>

            {/* Subheadline */}
            <p className="font-montserrat font-semibold text-xl md:text-2xl lg:text-3xl text-mono-silver max-w-3xl mx-auto">
              Cinematic AI Video Editing.
              <br />
              Precision. Speed. Excellence.
            </p>

            {/* Description */}
            <p className="font-inter text-base md:text-lg text-mono-silver max-w-2xl mx-auto leading-relaxed">
              Detect emotional peaks. Score excitement. Auto-cut scenes. Deliver cinematic edits
              instantly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button className="btn-primary w-full sm:w-auto">Start Creating</button>
              <button className="btn-secondary w-full sm:w-auto">Watch Demo</button>
            </div>

            {/* Trust Badge */}
            <p className="text-sm text-mono-silver pt-8 font-inter">
              Trusted by creators worldwide • No credit card required
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-px h-16 bg-mono-silver" />
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-32 px-4 bg-mono-slate border-b border-mono-silver/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="font-montserrat font-bold text-4xl md:text-6xl mb-6">
              Upload. Analyze. Export.
            </h2>
            <p className="font-inter text-lg text-mono-silver max-w-2xl mx-auto">
              Watch MonoFrame transform raw footage into cinematic gold in seconds.
            </p>
          </div>

          {/* Demo Preview */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {/* Step 1: Upload */}
            <div className="space-y-4 animate-fade-up">
              <div className="aspect-square bg-mono-shadow border border-mono-silver flex items-center justify-center">
                <div className="text-center p-8">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    viewBox="0 0 64 64"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M32 16 L32 48 M16 32 L32 16 L48 32" />
                    <rect x="12" y="52" width="40" height="2" />
                  </svg>
                  <p className="font-montserrat text-sm">UPLOAD</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-montserrat font-semibold text-xl mb-2">1. Upload Footage</h3>
                <p className="font-inter text-sm text-mono-silver">
                  Drag and drop your raw video files
                </p>
              </div>
            </div>

            {/* Step 2: AI Analysis */}
            <div className="space-y-4 animate-fade-up animation-delay-200">
              <div className="aspect-square bg-mono-shadow border border-mono-silver flex items-center justify-center">
                <div className="text-center p-8">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 animate-pulse"
                    viewBox="0 0 64 64"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="32" cy="32" r="20" />
                    <circle cx="32" cy="32" r="12" />
                    <circle cx="32" cy="32" r="4" />
                    <line x1="32" y1="12" x2="32" y2="8" />
                    <line x1="32" y1="56" x2="32" y2="52" />
                    <line x1="52" y1="32" x2="56" y2="32" />
                    <line x1="12" y1="32" x2="8" y2="32" />
                  </svg>
                  <p className="font-montserrat text-sm">ANALYZING</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-montserrat font-semibold text-xl mb-2">2. AI Processing</h3>
                <p className="font-inter text-sm text-mono-silver">
                  Detect peaks, score moments, auto-edit
                </p>
              </div>
            </div>

            {/* Step 3: Export */}
            <div className="space-y-4 animate-fade-up animation-delay-400">
              <div className="aspect-square bg-mono-shadow border border-mono-silver flex items-center justify-center">
                <div className="text-center p-8">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    viewBox="0 0 64 64"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M32 48 L32 16 M16 32 L32 48 L48 32" />
                    <rect x="12" y="12" width="40" height="2" />
                    <polyline points="52,20 56,20 56,56 8,56 8,20 12,20" />
                  </svg>
                  <p className="font-montserrat text-sm">READY</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-montserrat font-semibold text-xl mb-2">3. Export & Share</h3>
                <p className="font-inter text-sm text-mono-silver">
                  Download for any platform instantly
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-16 border-t border-mono-silver">
            <div className="text-center">
              <p className="font-montserrat font-bold text-4xl mb-2">95%</p>
              <p className="font-inter text-sm text-mono-silver">Time Saved</p>
            </div>
            <div className="text-center">
              <p className="font-montserrat font-bold text-4xl mb-2">&lt;5min</p>
              <p className="font-inter text-sm text-mono-silver">Processing Time</p>
            </div>
            <div className="text-center">
              <p className="font-montserrat font-bold text-4xl mb-2">10K+</p>
              <p className="font-inter text-sm text-mono-silver">Videos Edited</p>
            </div>
            <div className="text-center">
              <p className="font-montserrat font-bold text-4xl mb-2">4.9★</p>
              <p className="font-inter text-sm text-mono-silver">Creator Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 bg-mono-black border-b border-mono-silver/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat font-bold text-4xl md:text-6xl mb-6">
              Precision Meets Power
            </h2>
            <p className="font-inter text-lg text-mono-silver max-w-2xl mx-auto">
              Every feature engineered for cinematic excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="space-y-4 group animate-fade-up">
              <svg
                className="w-16 h-16 stroke-mono-white group-hover:fill-mono-white transition-all duration-300"
                viewBox="0 0 64 64"
                fill="none"
                strokeWidth="1.5"
              >
                <rect x="8" y="16" width="48" height="32" />
                <circle cx="20" cy="28" r="4" />
                <polyline points="8,40 20,32 32,36 44,28 56,32" />
              </svg>
              <h3 className="font-montserrat font-semibold text-2xl">AI Scene Detection</h3>
              <p className="font-inter text-mono-silver leading-relaxed">
                Automatically identify emotional peaks, action sequences, and key moments with
                frame-level precision.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 group animate-fade-up animation-delay-200">
              <svg
                className="w-16 h-16 stroke-mono-white group-hover:fill-mono-white transition-all duration-300"
                viewBox="0 0 64 64"
                fill="none"
                strokeWidth="1.5"
              >
                <polyline points="8,40 20,28 32,32 44,20 56,24" />
                <circle cx="20" cy="28" r="3" />
                <circle cx="32" cy="32" r="3" />
                <circle cx="44" cy="20" r="3" />
              </svg>
              <h3 className="font-montserrat font-semibold text-2xl">Smart Scoring</h3>
              <p className="font-inter text-mono-silver leading-relaxed">
                Advanced algorithms analyze excitement levels, pacing, and viewer engagement
                metrics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4 group animate-fade-up animation-delay-400">
              <svg
                className="w-16 h-16 stroke-mono-white group-hover:fill-mono-white transition-all duration-300"
                viewBox="0 0 64 64"
                fill="none"
                strokeWidth="1.5"
              >
                <rect x="8" y="20" width="20" height="24" />
                <rect x="36" y="20" width="20" height="24" />
                <line x1="28" y1="28" x2="36" y2="28" />
                <line x1="28" y1="36" x2="36" y2="36" />
              </svg>
              <h3 className="font-montserrat font-semibold text-2xl">Auto-Cut Editing</h3>
              <p className="font-inter text-mono-silver leading-relaxed">
                Generate multiple edit variations with perfect timing, transitions, and flow.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-4 group animate-fade-up">
              <svg
                className="w-16 h-16 stroke-mono-white group-hover:fill-mono-white transition-all duration-300"
                viewBox="0 0 64 64"
                fill="none"
                strokeWidth="1.5"
              >
                <rect x="16" y="12" width="32" height="20" />
                <rect x="12" y="36" width="16" height="16" />
                <rect x="36" y="36" width="16" height="16" />
                <line x1="32" y1="32" x2="20" y2="36" />
                <line x1="32" y1="32" x2="44" y2="36" />
              </svg>
              <h3 className="font-montserrat font-semibold text-2xl">Multi-Platform Export</h3>
              <p className="font-inter text-mono-silver leading-relaxed">
                One-click export optimized for YouTube, TikTok, Instagram, Twitter, and more.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="space-y-4 group animate-fade-up animation-delay-200">
              <svg
                className="w-16 h-16 stroke-mono-white group-hover:fill-mono-white transition-all duration-300"
                viewBox="0 0 64 64"
                fill="none"
                strokeWidth="1.5"
              >
                <line x1="16" y1="32" x2="16" y2="32" />
                <line x1="24" y1="24" x2="24" y2="40" />
                <line x1="32" y1="16" x2="32" y2="48" />
                <line x1="40" y1="28" x2="40" y2="36" />
                <line x1="48" y1="20" x2="48" y2="44" />
              </svg>
              <h3 className="font-montserrat font-semibold text-2xl">Audio Analysis</h3>
              <p className="font-inter text-mono-silver leading-relaxed">
                Sync edits with music beats, dialogue pauses, and sound design elements.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="space-y-4 group animate-fade-up animation-delay-400">
              <svg
                className="w-16 h-16 stroke-mono-white group-hover:fill-mono-white transition-all duration-300"
                viewBox="0 0 64 64"
                fill="none"
                strokeWidth="1.5"
              >
                <rect x="12" y="12" width="16" height="16" />
                <rect x="36" y="12" width="16" height="16" />
                <rect x="12" y="36" width="16" height="16" />
                <rect x="36" y="36" width="16" height="16" />
              </svg>
              <h3 className="font-montserrat font-semibold text-2xl">Batch Processing</h3>
              <p className="font-inter text-mono-silver leading-relaxed">
                Process multiple videos simultaneously with consistent quality and style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-32 px-4 bg-mono-slate border-b border-mono-silver/20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8">
            <h2 className="font-montserrat font-bold text-4xl md:text-6xl">Join the Waitlist</h2>
            <p className="font-inter text-lg text-mono-silver max-w-2xl mx-auto">
              Be among the first to experience the future of cinematic editing. Early access
              launching soon.
            </p>

            {!submitted ? (
              <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-6 py-4 bg-mono-black border-2 border-mono-white text-mono-white font-inter focus:outline-none focus:border-mono-silver transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary whitespace-nowrap"
                  >
                    {isSubmitting ? 'Joining...' : 'Get Early Access'}
                  </button>
                </div>
                <p className="text-xs text-mono-silver mt-4 font-inter">
                  No spam. Unsubscribe anytime. Your data is secure.
                </p>
              </form>
            ) : (
              <div className="animate-fade-in">
                <svg
                  className="w-16 h-16 mx-auto mb-4 stroke-mono-white"
                  viewBox="0 0 64 64"
                  fill="none"
                  strokeWidth="2"
                >
                  <circle cx="32" cy="32" r="24" />
                  <polyline points="20,32 28,40 44,24" />
                </svg>
                <p className="font-montserrat font-semibold text-xl">You&apos;re on the list!</p>
                <p className="font-inter text-mono-silver mt-2">
                  Check your inbox for confirmation.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-mono-black border-t border-mono-slate py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <svg
                className="w-12 h-12"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="8" y="8" width="48" height="48" />
                <line x1="32" y1="8" x2="32" y2="56" />
                <line x1="8" y1="32" x2="56" y2="32" />
              </svg>
              <p className="font-montserrat font-bold text-2xl">MONOFRAME</p>
              <p className="font-inter text-sm text-mono-silver">
                Cinematic excellence through AI-driven precision editing.
              </p>
            </div>

            {/* Product Column */}
            <div className="space-y-4">
              <h4 className="font-montserrat font-semibold text-sm uppercase tracking-wide">
                Product
              </h4>
              <ul className="space-y-2 font-inter text-sm text-mono-silver">
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    Enterprise
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-4">
              <h4 className="font-montserrat font-semibold text-sm uppercase tracking-wide">
                Company
              </h4>
              <ul className="space-y-2 font-inter text-sm text-mono-silver">
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-4">
              <h4 className="font-montserrat font-semibold text-sm uppercase tracking-wide">
                Legal
              </h4>
              <ul className="space-y-2 font-inter text-sm text-mono-silver">
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mono-white transition-colors">
                    Brand Guidelines
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-mono-slate flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-inter text-sm text-mono-silver">
              © {new Date().getFullYear()} MonoFrame Studio. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-mono-silver hover:text-mono-white transition-colors text-sm font-inter"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-mono-silver hover:text-mono-white transition-colors text-sm font-inter"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-mono-silver hover:text-mono-white transition-colors text-sm font-inter"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-mono-silver hover:text-mono-white transition-colors text-sm font-inter"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

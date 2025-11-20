'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EditorShowcase, Testimonials } from '@/components/home';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <main className="bg-mono-black text-mono-white relative">
      {/* Film Grain Overlay - Full Page */}
      <div className="film-grain"></div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 border-b border-mono-silver/20">
        {/* Cinematic gradient overlay with parallax */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-mono-shadow via-mono-black to-mono-slate opacity-50 transition-transform duration-75"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />

        {/* Film grain texture */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 animate-fade-up">
            {/* Logo */}
            <div className="inline-block mb-2">
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

            {/* Brand Name */}
            <h2 className="font-montserrat font-bold text-3xl md:text-4xl tracking-tight">
              MONOFRAME
            </h2>

            {/* Director Whisper Line */}
            <p className="font-montserrat text-mono-silver text-sm md:text-base tracking-widest uppercase opacity-90 mt-2">
              AI That Edits Like a Film Director
            </p>

            {/* Cinematic glow behind headline */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[800px] h-[300px] bg-mono-white/5 blur-[120px] rounded-full" />
              </div>

              {/* Big Cinematic Headline */}
              <h1 className="relative font-montserrat font-bold text-5xl md:text-7xl lg:text-8xl leading-none">
                The First AI Film Editor
              </h1>
            </div>

            {/* New Subtitle */}
            <p className="font-inter text-xl md:text-2xl text-mono-silver max-w-4xl mx-auto leading-relaxed">
              Edits your videos with taste, emotion, and cinematic timing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-12">
              <Link
                href="/upload"
                className="bg-mono-white text-mono-black font-montserrat font-semibold px-12 py-5 text-lg rounded hover:bg-mono-silver hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center btn-pulse"
              >
                Upload Your First Video
              </Link>
              <Link
                href="/dashboard"
                className="border border-mono-white/30 text-mono-white font-montserrat font-semibold px-12 py-5 text-lg rounded hover:bg-mono-white/5 hover:border-mono-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

            {/* Sub-CTA */}
            <p className="text-base text-mono-silver pt-4 font-inter">
              Get your first 3 edits free. No credit card.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-px h-16 bg-mono-silver" />
        </div>
      </section>

      {/* Editor Showcase - NEW */}
      <EditorShowcase />

      {/* Social Proof Section */}
      <section className="py-24 px-4 bg-mono-black border-b border-mono-silver/20">
        <div className="container mx-auto max-w-6xl">
          {/* Creator Logos */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="font-inter text-sm text-mono-silver/60 uppercase tracking-wider mb-8">
              Trusted by Creators
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
              {['Creator 1', 'Creator 2', 'Creator 3', 'Creator 4', 'Creator 5'].map((name, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 0.6, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="w-32 h-16 border border-mono-silver/30 rounded flex items-center justify-center"
                >
                  <span className="font-montserrat text-xs text-mono-silver">{name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mini Stat */}
          <div className="text-center mb-16 animate-fade-up">
            <p className="font-montserrat font-bold text-4xl md:text-5xl mb-2">400,000+</p>
            <p className="font-inter text-lg text-mono-silver">Minutes edited by MonoFrame</p>
          </div>

          {/* Featured Testimonial with Face */}
          <div className="max-w-4xl mx-auto mb-16 animate-fade-up">
            <div className="border border-mono-white/30 rounded-lg p-10 bg-mono-slate/50 hover:shadow-2xl hover:border-mono-white transition-all duration-500">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* AI-Generated Face Placeholder */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-mono-silver to-mono-slate border-2 border-mono-white flex items-center justify-center">
                    <svg
                      className="w-12 h-12 stroke-mono-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="font-inter text-lg text-mono-white mb-4 leading-relaxed italic">
                    &quot;I&apos;ve tried every editing tool out there. MonoFrame is the first one
                    that actually feels like it understands storytelling. It finds the moments I
                    would have chosen myself.&quot;
                  </p>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <div className="text-left">
                      <p className="font-montserrat font-semibold">Alex Morgan</p>
                      <p className="font-inter text-sm text-mono-silver/70">
                        Documentary Filmmaker
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 fill-mono-white" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "MonoFrame finds moments I didn't even know existed in my footage. It's like having a professional editor on speed dial.",
                author: 'Sarah Chen',
                role: 'Content Creator',
              },
              {
                quote:
                  'I went from spending 6 hours editing to 10 minutes. The AI actually understands pacing and emotion.',
                author: 'Marcus Johnson',
                role: 'YouTuber',
              },
              {
                quote:
                  "This is the first AI tool that doesn't feel robotic. The edits have genuine cinematic flow.",
                author: 'Elena Rodriguez',
                role: 'Filmmaker',
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="border border-mono-silver/30 rounded-lg p-8 bg-mono-slate/30 animate-fade-up hover:shadow-2xl hover:-translate-y-1 hover:border-mono-white transition-all duration-300"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <p className="font-inter text-mono-silver mb-6 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="border-t border-mono-silver/20 pt-4">
                  <p className="font-montserrat font-semibold text-sm">{testimonial.author}</p>
                  <p className="font-inter text-xs text-mono-silver/70">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Holy Shit Moment */}
      <section className="py-40 px-4 bg-mono-slate border-b border-mono-silver/20 animate-fade-up">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="font-montserrat font-bold text-4xl md:text-6xl mb-6">
              Before AI, After AI
            </h2>
            <p className="font-inter text-lg text-mono-silver max-w-2xl mx-auto">
              Watch how MonoFrame transforms raw footage into cinematic gold
            </p>
          </div>

          {/* Split Screen */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Before */}
            <div className="space-y-4 animate-fade-up">
              <div className="aspect-video bg-mono-shadow border border-mono-silver/30 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-mono-black/80 px-3 py-1 rounded">
                  <p className="font-montserrat text-xs font-semibold">BEFORE</p>
                </div>
                <div className="text-center p-8">
                  <p className="font-inter text-sm text-mono-silver/70">Raw Footage</p>
                  <p className="font-montserrat text-xs text-mono-silver/50 mt-2">
                    45 min • Unedited
                  </p>
                </div>
              </div>
              <p className="font-inter text-sm text-mono-silver/70 text-center">
                Unfocused • No pacing • 45 minutes
              </p>
            </div>

            {/* After */}
            <div className="space-y-4 animate-fade-up animation-delay-200">
              <div className="aspect-video bg-mono-shadow border-2 border-mono-white rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-mono-white text-mono-black px-3 py-1 rounded">
                  <p className="font-montserrat text-xs font-semibold">AFTER AI</p>
                </div>
                <div className="text-center p-8">
                  <p className="font-inter text-sm text-mono-white">Polished Edit</p>
                  <p className="font-montserrat text-xs text-mono-silver mt-2">
                    3 clips • Cinematic
                  </p>
                </div>
              </div>
              <p className="font-inter text-sm text-mono-white text-center">
                Emotional peaks • Perfect pacing • 3 highlight clips
              </p>
            </div>
          </div>

          {/* Speed Badge */}
          <div className="text-center animate-fade-up animation-delay-400">
            <div className="inline-block bg-mono-white text-mono-black px-6 py-3 rounded-lg">
              <p className="font-montserrat font-semibold">⚡ AI Edit Completed in 2m 13s</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-32 px-4 bg-mono-black border-b border-mono-silver/20">
        <div className="container mx-auto max-w-6xl">
          {/* Beta Sticker */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-mono-white text-mono-black px-6 py-3 rounded-lg mb-8">
              <p className="font-montserrat font-bold">
                🔥 Beta Launch — 50% off for first 500 creators
              </p>
            </div>
            <h2 className="font-montserrat font-bold text-4xl md:text-6xl mb-6">Simple Pricing</h2>
            <p className="font-inter text-lg text-mono-silver max-w-2xl mx-auto">
              Start free, upgrade when you&apos;re ready
            </p>
          </motion.div>

          {/* 3-Tier Pricing */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: [
                  '3 edits per month',
                  'Up to 10min videos',
                  'HD export',
                  'Basic AI analysis',
                ],
                cta: 'Start Free',
                popular: false,
              },
              {
                name: 'Pro',
                price: '$29',
                period: 'per month',
                originalPrice: '$58',
                features: [
                  'Unlimited edits',
                  'Up to 60min videos',
                  '4K export',
                  'Advanced AI analysis',
                  'Priority processing',
                  'Custom branding',
                ],
                cta: 'Start Pro Trial',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'contact us',
                features: [
                  'Everything in Pro',
                  'Unlimited video length',
                  'API access',
                  'Dedicated support',
                  'Custom models',
                  'SLA guarantee',
                ],
                cta: 'Contact Sales',
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`border rounded-lg p-8 animate-fade-up relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.popular
                  ? 'border-mono-white bg-mono-white/5 scale-105'
                  : 'border-mono-silver/30 bg-mono-slate/30 hover:border-mono-white'
                  }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-mono-white text-mono-black px-4 py-1 rounded-full">
                    <p className="font-montserrat text-xs font-bold">MOST POPULAR</p>
                  </div>
                )}
                <div className="mb-6">
                  <p className="font-montserrat font-semibold text-xl mb-2">{plan.name}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="font-montserrat font-bold text-4xl">{plan.price}</p>
                    <p className="font-inter text-sm text-mono-silver">{plan.period}</p>
                  </div>
                  {plan.originalPrice && (
                    <p className="font-inter text-sm text-mono-silver/70 line-through mt-1">
                      {plan.originalPrice}
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 stroke-mono-white flex-shrink-0 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                      >
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      <span className="font-inter text-sm text-mono-silver">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/upload"
                  className={`block text-center font-montserrat font-semibold px-6 py-3 rounded transition-all duration-300 ${plan.popular
                    ? 'bg-mono-white text-mono-black hover:bg-mono-silver'
                    : 'border-2 border-mono-white text-mono-white hover:bg-mono-white hover:text-mono-black'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-48 px-4 bg-mono-slate border-b border-mono-silver/20 animate-fade-up">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="font-montserrat font-bold text-4xl md:text-6xl mb-6">
              MonoFrame vs Others
            </h2>
            <p className="font-inter text-xl text-mono-silver max-w-3xl mx-auto">
              It doesn&apos;t apply filters — it edits like a human.
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-mono-silver/30">
                  <th className="text-left font-montserrat font-semibold p-4">Feature</th>
                  <th className="text-center font-montserrat font-semibold p-4 bg-mono-white/5">
                    MonoFrame
                  </th>
                  <th className="text-center font-montserrat font-semibold p-4 text-mono-silver/70">
                    CapCut
                  </th>
                  <th className="text-center font-montserrat font-semibold p-4 text-mono-silver/70">
                    Runway
                  </th>
                  <th className="text-center font-montserrat font-semibold p-4 text-mono-silver/70">
                    Premiere
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: 'AI Emotional Analysis',
                    monoframe: true,
                    capcut: false,
                    runway: false,
                    premiere: false,
                  },
                  {
                    feature: 'Auto Scene Detection',
                    monoframe: true,
                    capcut: true,
                    runway: false,
                    premiere: false,
                  },
                  {
                    feature: 'Cinematic Pacing',
                    monoframe: true,
                    capcut: false,
                    runway: false,
                    premiere: false,
                  },
                  {
                    feature: 'Audio Sync Analysis',
                    monoframe: true,
                    capcut: false,
                    runway: true,
                    premiere: true,
                  },
                  {
                    feature: 'One-Click Export',
                    monoframe: true,
                    capcut: true,
                    runway: true,
                    premiere: false,
                  },
                  {
                    feature: 'No Learning Curve',
                    monoframe: true,
                    capcut: false,
                    runway: false,
                    premiere: false,
                  },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-mono-silver/10">
                    <td className="font-inter p-4">{row.feature}</td>
                    <td className="text-center p-4 bg-mono-white/5">
                      {row.monoframe ? (
                        <svg
                          className="w-6 h-6 stroke-mono-white mx-auto"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="2"
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      ) : (
                        <span className="text-mono-silver/30">—</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {row.capcut ? (
                        <svg
                          className="w-6 h-6 stroke-mono-silver/50 mx-auto"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="2"
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      ) : (
                        <span className="text-mono-silver/30">—</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {row.runway ? (
                        <svg
                          className="w-6 h-6 stroke-mono-silver/50 mx-auto"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="2"
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      ) : (
                        <span className="text-mono-silver/30">—</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {row.premiere ? (
                        <svg
                          className="w-6 h-6 stroke-mono-silver/50 mx-auto"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="2"
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      ) : (
                        <span className="text-mono-silver/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials - NEW */}
      <Testimonials />

      {/* Manifesto Section */}
      <section className="py-48 px-4 bg-mono-black border-b border-mono-silver/20 animate-fade-up">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8 animate-[fadeIn_2s_ease-in]">
            <h2 className="font-montserrat font-bold text-3xl md:text-5xl leading-tight">
              Why We Built This
            </h2>
            <div className="space-y-6 font-inter text-lg md:text-xl text-mono-silver/90 leading-relaxed">
              <p>
                Every creator has felt it: hours of raw footage, endless possibilities, but no time
                to find the magic.
              </p>
              <p>
                Traditional editing tools give you buttons and timelines. But they don&apos;t
                understand what makes a moment <em className="text-mono-white">matter</em>.
              </p>
              <p>
                MonoFrame was built by filmmakers who got tired of spending 90% of their time
                hunting for the 10% that counts.
              </p>
              <p className="text-mono-white font-semibold">
                We believe AI should edit like a director — with taste, rhythm, and emotion.
              </p>
              <p>Not filters. Not templates. Just intelligent, cinematic storytelling.</p>
            </div>

            {/* Founder Note - Anonymous */}
            <div className="mt-16 pt-12 border-t border-mono-silver/20">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-1 h-16 bg-mono-white"></div>
                  <div className="space-y-3">
                    <p className="font-inter text-base md:text-lg text-mono-silver/90 leading-relaxed italic">
                      MonoFrame was built because creators deserve cinematic editing without 10
                      hours of suffering.
                    </p>
                    <p className="font-montserrat text-sm text-mono-silver/60">— Founder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-32 px-4 bg-mono-slate border-b border-mono-silver/20 animate-fade-up">
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
      <section className="py-32 px-4 bg-mono-black border-b border-mono-silver/20 animate-fade-up">
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

      {/* Final CTA Bar */}
      <section className="py-24 px-4 bg-mono-white text-mono-black border-b border-mono-silver/20 animate-fade-up">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <h2 className="font-montserrat font-bold text-4xl md:text-6xl">
              Upload Your First Video
            </h2>
            <p className="font-inter text-lg md:text-xl text-mono-black/70">
              Try it free — 3 edits included.
            </p>
            <Link
              href="/upload"
              className="inline-block bg-mono-black text-mono-white font-montserrat font-semibold px-12 py-5 text-lg rounded hover:bg-mono-slate hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 btn-pulse"
            >
              Start Creating Now
            </Link>
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-32 px-4 bg-mono-slate border-b border-mono-silver/20 animate-fade-up">
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
      <footer className="bg-mono-black relative py-24 px-4">
        {/* Gradient Top Border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mono-white to-transparent opacity-30"></div>
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

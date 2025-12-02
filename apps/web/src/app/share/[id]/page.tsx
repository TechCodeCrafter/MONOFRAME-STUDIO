'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getDemoShareById, DemoSharePayload } from '@/lib/shareStore';

interface SharePageProps {
  params: { id: string };
}

/**
 * Public Share Page
 * Investor-friendly, read-only view of an AI-edited video
 */
export default function SharePage({ params }: SharePageProps) {
  // SSR-safe gating
  const [isMounted, setIsMounted] = useState(false);
  const [share, setShare] = useState<DemoSharePayload | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const data = getDemoShareById(params.id);
    setShare(data);
  }, [isMounted, params.id]);

  // Generate fake scene bars for timeline visualization
  const sceneBars = useMemo(() => {
    return Array.from({ length: 12 }, () => ({
      height: Math.floor(Math.random() * 120) + 40,
    }));
  }, []);

  // Generate fake AI stats
  const aiStats = useMemo(() => {
    return {
      cuts: Math.floor(Math.random() * 9) + 8, // 8-16 cuts
      pacingAdjustment: Math.floor(Math.random() * 9) + 10, // 10-18%
      emotionMoments: Math.floor(Math.random() * 3) + 2, // 2-4 moments
    };
  }, []);

  if (!isMounted) {
    // Simple loading skeleton
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/60">
        Loading edit…
      </div>
    );
  }

  if (!share) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/80 text-lg font-semibold">
            This MonoFrame link has expired or was not found.
          </p>
          <Link
            href="/demo/ai-editor"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 transition"
          >
            Create your own AI edit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo-icon.svg"
              alt="MonoFrame"
              width={28}
              height={28}
              className="opacity-80"
            />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                MonoFrame AI Edit
              </h1>
              <p className="text-sm text-white/60">Shared cinematic cut</p>
            </div>
          </div>
          <Link
            href="/demo/ai-editor"
            className="
              px-6 py-3 bg-white text-black rounded-lg font-semibold text-sm
              hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]
              transition-all duration-200
            "
          >
            Edit your own
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Video Player + Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Card */}
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/70 backdrop-blur-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              <video
                src={share.videoUrl}
                controls
                className="w-full aspect-video bg-black"
              />
              <div className="px-4 py-3 flex items-center justify-between border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>AI processed cut</span>
                </div>
                <span className="text-xs text-white/40">
                  Shared {new Date(share.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Simple Fake Timeline Visualization */}
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/70 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                  AI-Estimated Scene Energy
                </h3>
                <span className="text-xs text-white/40">12 scenes detected</span>
              </div>
              
              <div className="h-32 bg-white/5 rounded-lg border border-white/10 p-4 flex items-end justify-around gap-1">
                {sceneBars.map((bar, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-white/20 rounded-t hover:bg-white/30 transition-all"
                    style={{ height: `${bar.height}px` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Meta + AI Summary */}
          <div className="space-y-6">
            {/* Meta Stats Card */}
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/70 backdrop-blur-xl p-6">
              <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
                Edit Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Resolution</span>
                  <span className="text-white/90 font-mono">1920×1080</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Format</span>
                  <span className="text-white/90 font-mono">MP4</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Engine</span>
                  <span className="text-white/90">MonoFrame AI</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
                  <span className="text-white/60">Share ID</span>
                  <span className="text-white/40 font-mono text-xs truncate max-w-[140px]">
                    {share.id}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Created</span>
                  <span className="text-white/90 text-xs">
                    {new Date(share.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/70 backdrop-blur-xl p-6">
              <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
                AI Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-1 h-1 rounded-full bg-white/60 mt-2" />
                  <p className="text-sm text-white/70 leading-relaxed">
                    Detected <span className="text-white font-semibold">{aiStats.cuts}</span> potential cuts
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1 h-1 rounded-full bg-white/60 mt-2" />
                  <p className="text-sm text-white/70 leading-relaxed">
                    Suggested pacing adjustment of <span className="text-white font-semibold">{aiStats.pacingAdjustment}%</span>
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1 h-1 rounded-full bg-white/60 mt-2" />
                  <p className="text-sm text-white/70 leading-relaxed">
                    Found <span className="text-white font-semibold">{aiStats.emotionMoments}</span> high-emotion moments
                  </p>
                </div>
              </div>
            </div>

            {/* Powered By */}
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/70 backdrop-blur-xl p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-xs text-white/40 uppercase tracking-wider">Powered by</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Image
                  src="/logo-icon.svg"
                  alt="MonoFrame"
                  width={20}
                  height={20}
                  className="opacity-60"
                />
                <span className="text-white/90 font-semibold tracking-wide">MonoFrame AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



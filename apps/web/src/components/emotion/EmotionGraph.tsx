'use client';

import { useMemo, useEffect, useRef } from 'react';
import type { Clip } from '@/lib/projectStore';

interface EmotionGraphProps {
  clip: Clip;
  startTime: number;
  endTime: number;
  duration: number;
  regenerateKey?: number;
}

/**
 * Generate emotion curve points from AI insights
 */
function generateEmotionCurve(clip: Clip, pointCount: number = 60): number[] {
  const { emotionalScore, sceneTension, audioEnergy, motionScore } = clip.analysis;

  // Normalize scores to 0-1 range (assuming they're 0-100)
  const normalizedEmotion = emotionalScore / 100;
  const normalizedTension = sceneTension / 100;
  const normalizedEnergy = audioEnergy / 100;
  const normalizedMotion = motionScore / 100;

  // Base emotional value from weighted AI insights
  const baseEmotion =
    normalizedEmotion * 0.45 +
    normalizedTension * 0.3 +
    normalizedEnergy * 0.15 +
    normalizedMotion * 0.1;

  // Generate points with organic variation
  const points: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    const progress = i / (pointCount - 1);

    // Create natural wave pattern
    const wave1 = Math.sin(progress * Math.PI * 2) * 0.15;
    const wave2 = Math.sin(progress * Math.PI * 4 + 1.2) * 0.08;

    // Add slight random jitter (±3%)
    const jitter = (Math.random() - 0.5) * 0.06;

    // Combine base + waves + jitter
    let value = baseEmotion + wave1 + wave2 + jitter;

    // Clamp to 0-1 range
    value = Math.max(0, Math.min(1, value));

    points.push(value);
  }

  return points;
}

/**
 * Create smooth SVG path from points using cubic bezier curves
 */
function createSmoothPath(
  points: number[],
  width: number,
  height: number,
  padding: number = 20
): string {
  if (points.length < 2) return '';

  const graphHeight = height - padding * 2;
  const segmentWidth = width / (points.length - 1);

  // Convert points to coordinates
  const coords = points.map((value, i) => ({
    x: i * segmentWidth,
    y: padding + graphHeight - value * graphHeight,
  }));

  // Start path
  let path = `M ${coords[0].x} ${coords[0].y}`;

  // Create smooth cubic bezier curves between points
  for (let i = 0; i < coords.length - 1; i++) {
    const current = coords[i];
    const next = coords[i + 1];

    // Control points for smooth curve
    const cp1x = current.x + segmentWidth * 0.4;
    const cp1y = current.y;
    const cp2x = next.x - segmentWidth * 0.4;
    const cp2y = next.y;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  return path;
}

/**
 * EmotionGraph - Displays a cinematic emotion curve timeline
 */
export default function EmotionGraph({
  clip,
  startTime,
  endTime,
  duration: _duration,
  regenerateKey = 0,
}: EmotionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const isDev = process.env.NODE_ENV !== 'production';

  // Safety check - return null if clip data is invalid
  if (!clip || !clip.analysis) {
    if (isDev) {
      console.warn('EmotionGraph: Missing clip or analysis data', {
        hasClip: !!clip,
        hasAnalysis: !!clip?.analysis,
      });
    }
    return null;
  }

  // Validate analysis data
  const { emotionalScore, sceneTension, audioEnergy, motionScore } = clip.analysis;
  if (
    typeof emotionalScore !== 'number' ||
    typeof sceneTension !== 'number' ||
    typeof audioEnergy !== 'number' ||
    typeof motionScore !== 'number'
  ) {
    if (isDev) {
      console.warn('EmotionGraph: Invalid analysis scores', {
        clipId: clip.id,
        emotionalScore,
        sceneTension,
        audioEnergy,
        motionScore,
      });
    }
    return null;
  }

  // Validate time values
  if (typeof startTime !== 'number' || typeof endTime !== 'number' || startTime >= endTime) {
    if (isDev) {
      console.warn('EmotionGraph: Invalid time range', { startTime, endTime });
    }
    return null;
  }

  // Generate emotion curve points
  // regenerateKey is intentionally included to force re-generation when clip regenerates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const emotionPoints = useMemo(() => {
    return generateEmotionCurve(clip, 60);
  }, [clip, regenerateKey]);

  // Create SVG path
  const pathData = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const width = 1200; // Base width, SVG will scale
    const height = 120;
    return createSmoothPath(emotionPoints, width, height);
  }, [emotionPoints]);

  // Animate path on mount and when regenerated
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();

    // Reset animation
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    // Trigger animation
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
      path.style.strokeDashoffset = '0';
    });

    return () => {
      path.style.transition = '';
    };
  }, [pathData, regenerateKey]);

  return (
    <div className="w-full h-[120px] relative overflow-hidden bg-black/20 border-y border-mono-silver/10">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Emotion curve */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for subtle depth */}
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Glow layer (behind main curve) */}
        <path
          d={pathData}
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeOpacity="0.3"
          filter="url(#glow)"
        />

        {/* Main curve */}
        <path
          ref={pathRef}
          d={pathData}
          fill="none"
          stroke="url(#curveGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        />
      </svg>

      {/* Time markers (subtle) */}
      <div className="absolute bottom-2 left-4 text-[10px] font-inter text-mono-silver/40">
        {startTime.toFixed(1)}s
      </div>
      <div className="absolute bottom-2 right-4 text-[10px] font-inter text-mono-silver/40">
        {endTime.toFixed(1)}s
      </div>

      {/* Label */}
      <div className="absolute top-2 left-4 text-[10px] font-montserrat font-semibold text-mono-silver/60 uppercase tracking-wider">
        Emotional Curve
      </div>
    </div>
  );
}

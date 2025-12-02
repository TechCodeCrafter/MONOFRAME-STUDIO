"use client";

/**
 * Insights Tab Content
 * Displays Cut Detection, Audio Intelligence, and Scene Intelligence in accordions
 */

import { Accordion } from '../Accordion';
import { BarChart3, Volume2, Brain } from 'lucide-react';
import type { EnrichedSegment, DetectedCut } from '@/lib/videoAnalysis';
import type { SegmentAudioIntelligence } from '@/lib/audioAnalysis';

interface InsightsTabProps {
  detectedCuts: DetectedCut[];
  audioAnalysis: SegmentAudioIntelligence[];
  analyzedSegments: EnrichedSegment[];
  duration: number;
}

export function InsightsTab({
  detectedCuts,
  audioAnalysis,
  analyzedSegments,
  duration,
}: InsightsTabProps) {
  // Calculate summaries
  const avgConfidence =
    detectedCuts.reduce((sum, cut) => sum + cut.confidence, 0) /
    (detectedCuts.length || 1);
  
  const avgSpeechProb =
    audioAnalysis.reduce((sum, a) => sum + a.speechProbability, 0) /
    (audioAnalysis.length || 1);
  
  const totalSilence = audioAnalysis.reduce(
    (sum, a) => sum + a.silences.reduce((s, sil) => s + (sil.endTime - sil.startTime), 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Cut Detection */}
      <Accordion
        title="Cut Detection Analysis"
        summary={`${detectedCuts.length} cuts detected • Avg confidence: ${(avgConfidence * 100).toFixed(1)}%`}
        icon={<BarChart3 className="w-5 h-5" />}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{detectedCuts.length}</div>
              <div className="text-xs text-white/50">Total Cuts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{(avgConfidence * 100).toFixed(1)}%</div>
              <div className="text-xs text-white/50">Avg Confidence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {((detectedCuts.length / duration) * 60).toFixed(1)}
              </div>
              <div className="text-xs text-white/50">Cuts per min</div>
            </div>
          </div>
          
          {/* Cut List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {detectedCuts.map((cut, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10"
              >
                <span className="text-sm text-white/80">
                  Cut #{i + 1} @ {cut.time.toFixed(2)}s
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400"
                      style={{ width: `${cut.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/50 font-mono w-12 text-right">
                    {(cut.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* Audio Intelligence */}
      <Accordion
        title="Audio Intelligence"
        summary={`Avg speech: ${(avgSpeechProb * 100).toFixed(1)}% • Silence: ${totalSilence.toFixed(1)}s`}
        icon={<Volume2 className="w-5 h-5" />}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">
                {(avgSpeechProb * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-white/50">Avg Speech</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalSilence.toFixed(1)}s</div>
              <div className="text-xs text-white/50">Total Silence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {audioAnalysis.length}
              </div>
              <div className="text-xs text-white/50">Segments</div>
            </div>
          </div>

          {/* Segment Audio Stats */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {audioAnalysis.map((audio, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 rounded border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/80">Segment {i + 1}</span>
                  <span className="text-xs text-white/50">
                    Speech: {(audio.speechProbability * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Small waveform preview */}
                <div className="h-8 bg-black/40 rounded flex items-center justify-center gap-0.5 px-1">
                  {audio.waveform.peaks.slice(0, 50).map((peak, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-blue-400/60 rounded-sm"
                      style={{ height: `${Math.max(peak * 100, 2)}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* Scene Intelligence */}
      <Accordion
        title="AI Scene Intelligence"
        summary={`${analyzedSegments.length} scenes labeled with AI`}
        icon={<Brain className="w-5 h-5" />}
        defaultOpen={false}
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {analyzedSegments.map((segment, i) => (
            <div
              key={i}
              className="p-4 bg-white/5 rounded border border-white/10"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {segment.aiLabel?.title || segment.label}
                  </h4>
                  <p className="text-xs text-white/60 mt-1">
                    {segment.aiLabel?.description || 'No description'}
                  </p>
                </div>
                {segment.aiLabel?.emotion && (
                  <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                    {segment.aiLabel.emotion}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>{segment.startTime.toFixed(1)}s – {segment.endTime.toFixed(1)}s</span>
                {segment.aiLabel?.subject && (
                  <>
                    <span>•</span>
                    <span>{segment.aiLabel.subject}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );
}


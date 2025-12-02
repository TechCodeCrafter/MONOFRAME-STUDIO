"use client";

/**
 * VoiceoverPanel Component
 * Phase 20: AI Voiceover Engine
 * 
 * UI for generating and configuring AI voiceover
 */

import { useState, useEffect } from "react";
import { Mic, AlertCircle, CheckCircle2 } from "lucide-react";
import type { EnrichedSegment } from "../../../../lib/videoAnalysis";
import type { AlignedTranscript } from "../../../../lib/transcription";
import {
  VOICE_PROFILES,
  buildSegmentVoicePlan,
  filterValidPlans,
  getTotalWordCount,
  synthesizeVoiceBatch,
  type SynthesisInput,
} from "../../../../lib/voiceover";
import { RevealOnScroll } from "../../../../components/marketing/RevealOnScroll";

export type VoiceoverSegmentData = {
  segmentId: string;
  audioUrl: string; // from URL.createObjectURL
  durationSeconds: number;
};

export type VoiceoverState = {
  segments: VoiceoverSegmentData[];
  generatedAt: string;
  voiceProfileId: string;
  speed: number;
};

type VoiceoverMode = "original" | "voiceover" | "mixed";

interface VoiceoverPanelProps {
  segments: EnrichedSegment[];
  transcript: AlignedTranscript[] | null;
  activeVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
  mode: VoiceoverMode;
  onModeChange: (mode: VoiceoverMode) => void;
  onApplyVoiceover: (state: VoiceoverState) => void;
}

export function VoiceoverPanel({
  segments,
  transcript,
  activeVoiceId,
  onVoiceChange,
  mode,
  onModeChange,
  onApplyVoiceover,
}: VoiceoverPanelProps) {
  const [speed, setSpeed] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get active voice profile
  const activeProfile =
    VOICE_PROFILES.find((p) => p.id === activeVoiceId) || VOICE_PROFILES[0];

  // Check if transcript is available
  const hasTranscript = transcript !== null;

  // Generate voiceover for all segments
  const handleGenerateVoiceover = async () => {
    if (!hasTranscript || !transcript) {
      setError("No transcript available. Please wait for transcription to complete.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);
    setProgress({ current: 0, total: 0 });

    try {
      // Build voice plan
      const allPlans = buildSegmentVoicePlan({ segments, transcript });
      const validPlans = filterValidPlans(allPlans);

      if (validPlans.length === 0) {
        throw new Error("No valid segments with text found.");
      }

      const totalWords = getTotalWordCount(validPlans);
      console.log(
        `[Voiceover] Generating voiceover for ${validPlans.length} segments (${totalWords} words)`
      );

      setProgress({ current: 0, total: validPlans.length });

      // Build synthesis inputs
      const inputs: SynthesisInput[] = validPlans.map((plan) => ({
        text: plan.text,
        voiceId: activeProfile.providerVoiceId || "alloy",
        speed,
      }));

      // Synthesize all segments
      const results = await synthesizeVoiceBatch(inputs, (current, total) => {
        setProgress({ current, total });
      });

      // Convert to VoiceoverSegmentData
      const voiceoverSegments: VoiceoverSegmentData[] = validPlans.map(
        (plan, index) => {
          const result = results[index];
          const blob = new Blob([result.audioBuffer], { type: "audio/mpeg" });
          const audioUrl = URL.createObjectURL(blob);

          return {
            segmentId: plan.segmentId,
            audioUrl,
            durationSeconds: result.durationSeconds,
          };
        }
      );

      // Create voiceover state
      const voiceoverState: VoiceoverState = {
        segments: voiceoverSegments,
        generatedAt: new Date().toISOString(),
        voiceProfileId: activeVoiceId,
        speed,
      };

      // Apply voiceover
      onApplyVoiceover(voiceoverState);

      setSuccess(true);
      console.log("[Voiceover] Generation complete:", voiceoverState);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("[Voiceover] Generation failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate voiceover"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup is handled by parent component
    };
  }, []);

  return (
    <RevealOnScroll>
      <div className="relative border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg p-8">
        {/* Section divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8 -mt-8"></div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Mic className="w-6 h-6 text-white/80" />
          <h3 className="text-2xl font-semibold text-white">🎙️ AI Voiceover</h3>
        </div>

        <p className="text-white/60 mb-8 text-sm">
          Generate AI narration for your video using the transcript. Choose a voice
          style and mix mode to create professional voiceovers.
        </p>

        {/* Voice Profile Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Voice Profile
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {VOICE_PROFILES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => onVoiceChange(profile.id)}
                disabled={isGenerating}
                className={`
                  relative p-4 rounded-lg border transition-all duration-200
                  ${
                    activeVoiceId === profile.id
                      ? "border-white/40 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }
                  ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <div className="text-sm font-medium text-white mb-1">
                  {profile.label}
                </div>
                <div className="text-xs text-white/50">
                  {profile.description}
                </div>
                {profile.gender && (
                  <div className="mt-2 text-xs text-white/40 capitalize">
                    {profile.gender} · {profile.style}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Control */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Speed: {speed.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            disabled={isGenerating}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>Slower (0.75x)</span>
            <span>Normal (1.0x)</span>
            <span>Faster (1.25x)</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Audio Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onModeChange("original")}
              disabled={isGenerating}
              className={`
                relative px-4 py-3 rounded-lg border transition-all duration-200 text-sm
                ${
                  mode === "original"
                    ? "border-white/40 bg-white/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }
                ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <div className="font-medium text-white">Original</div>
              <div className="text-xs text-white/50 mt-1">Video audio only</div>
            </button>

            <button
              onClick={() => onModeChange("voiceover")}
              disabled={isGenerating}
              className={`
                relative px-4 py-3 rounded-lg border transition-all duration-200 text-sm
                ${
                  mode === "voiceover"
                    ? "border-white/40 bg-white/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }
                ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <div className="font-medium text-white">AI Voiceover</div>
              <div className="text-xs text-white/50 mt-1">AI narration only</div>
            </button>

            <button
              onClick={() => onModeChange("mixed")}
              disabled={isGenerating}
              className={`
                relative px-4 py-3 rounded-lg border transition-all duration-200 text-sm
                ${
                  mode === "mixed"
                    ? "border-white/40 bg-white/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }
                ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <div className="font-medium text-white">Mixed</div>
              <div className="text-xs text-white/50 mt-1">Original + AI</div>
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateVoiceover}
          disabled={isGenerating || !hasTranscript}
          className={`
            w-full px-6 py-4 rounded-lg font-semibold text-base
            transition-all duration-200
            ${
              isGenerating || !hasTranscript
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-white text-black hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            }
          `}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
              Generating ({progress.current} / {progress.total})...
            </span>
          ) : (
            "Generate Voiceover for All Scenes"
          )}
        </button>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-red-400">Error</div>
              <div className="text-xs text-red-300/80 mt-1">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-green-400">Success</div>
              <div className="text-xs text-green-300/80 mt-1">
                Voiceover generated successfully! Export your video to hear it.
              </div>
            </div>
          </div>
        )}

        {!hasTranscript && (
          <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-300/80">
              Waiting for transcript... Voiceover will be available after transcription completes.
            </div>
          </div>
        )}
      </div>
    </RevealOnScroll>
  );
}


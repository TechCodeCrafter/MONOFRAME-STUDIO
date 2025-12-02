"use client";

/**
 * Voiceover Tab Content
 * Wraps VoiceoverPanel
 */

import { VoiceoverPanel, type VoiceoverState } from '../VoiceoverPanel';
import type { EnrichedSegment } from '@/lib/videoAnalysis';
import type { AlignedTranscript } from '@/lib/transcription';

interface VoiceoverTabProps {
  segments: EnrichedSegment[];
  transcript: AlignedTranscript[] | null;
  activeVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
  mode: 'original' | 'voiceover' | 'mixed';
  onModeChange: (mode: 'original' | 'voiceover' | 'mixed') => void;
  onApplyVoiceover: (state: VoiceoverState) => void;
}

export function VoiceoverTab({
  segments,
  transcript,
  activeVoiceId,
  onVoiceChange,
  mode,
  onModeChange,
  onApplyVoiceover,
}: VoiceoverTabProps) {
  return (
    <VoiceoverPanel
      segments={segments}
      transcript={transcript}
      activeVoiceId={activeVoiceId}
      onVoiceChange={onVoiceChange}
      mode={mode}
      onModeChange={onModeChange}
      onApplyVoiceover={onApplyVoiceover}
    />
  );
}


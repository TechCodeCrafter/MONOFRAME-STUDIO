"use client";

/**
 * Transcript Tab Content
 * Wraps TranscriptPanel
 */

import TranscriptPanel from '../TranscriptPanel';
import type { CleanedTranscript, AlignedTranscript } from '@/lib/transcription';

interface TranscriptTabProps {
  transcript: CleanedTranscript;
  alignedTranscript: AlignedTranscript[];
  currentTime: number;
  onSeekTo: (time: number) => void;
  onGenerateScriptCut: (selectedWordIndices: number[]) => void;
}

export function TranscriptTab({
  transcript,
  alignedTranscript,
  currentTime,
  onSeekTo,
  onGenerateScriptCut,
}: TranscriptTabProps) {
  return (
    <TranscriptPanel
      transcript={transcript}
      alignedTranscript={alignedTranscript}
      currentTime={currentTime}
      onSeekTo={onSeekTo}
      onGenerateScriptCut={onGenerateScriptCut}
    />
  );
}


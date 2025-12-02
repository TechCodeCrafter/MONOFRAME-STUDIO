'use client';

import { useState } from 'react';
import UploadArea from './components/UploadArea';
import ProcessingState from './components/ProcessingState';
import DemoResults from './components/DemoResults';
import type { EnrichedSegment, DetectedCut } from '@/lib/videoAnalysis';
import type { SegmentAudioIntelligence } from '@/lib/audioAnalysis';
import type { CleanedTranscript, AlignedTranscript } from '@/lib/transcription';

type DemoStep = 'upload' | 'processing' | 'results';

/**
 * AI Demo Editor Experience
 * Interactive demo showcasing MonoFrame's AI capabilities with smooth transitions
 */
export default function AIDemoPage() {
  const [currentStep, setCurrentStep] = useState<DemoStep>('upload');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [analyzedSegments, setAnalyzedSegments] = useState<EnrichedSegment[]>([]);
  const [detectedCuts, setDetectedCuts] = useState<DetectedCut[]>([]);
  const [audioAnalysis, setAudioAnalysis] = useState<SegmentAudioIntelligence[]>([]);
  const [transcript, setTranscript] = useState<CleanedTranscript | null>(null);
  const [alignedTranscript, setAlignedTranscript] = useState<AlignedTranscript[]>([]);

  const handleTransition = (nextStep: DemoStep) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  };

  const handleUploadComplete = (url: string) => {
    setVideoUrl(url);
    handleTransition('processing');
  };

  const handleAnalysisComplete = (
    segments: EnrichedSegment[],
    cuts: DetectedCut[],
    audio: SegmentAudioIntelligence[],
    transcriptData: CleanedTranscript,
    aligned: AlignedTranscript[]
  ) => {
    setAnalyzedSegments(segments);
    setDetectedCuts(cuts);
    setAudioAnalysis(audio);
    setTranscript(transcriptData);
    setAlignedTranscript(aligned);
    handleTransition('results');
  };

  const handleReset = () => {
    // Cleanup object URL
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl('');
    }
    setAnalyzedSegments([]);
    setDetectedCuts([]);
    setAudioAnalysis([]);
    setTranscript(null);
    setAlignedTranscript([]);
    handleTransition('upload');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div
        className={`w-full max-w-6xl transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {currentStep === 'upload' && (
          <UploadArea onUploadComplete={handleUploadComplete} />
        )}
        
        {currentStep === 'processing' && (
          <ProcessingState 
            videoUrl={videoUrl}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}
        
        {currentStep === 'results' && transcript && (
          <DemoResults 
            videoUrl={videoUrl}
            analyzedSegments={analyzedSegments}
            detectedCuts={detectedCuts}
            audioAnalysis={audioAnalysis}
            transcript={transcript}
            alignedTranscript={alignedTranscript}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

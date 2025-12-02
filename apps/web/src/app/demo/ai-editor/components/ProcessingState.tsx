'use client';

import { useEffect, useState, useRef } from 'react';
import { analyzeVideo, runSceneLabeling, type DetectedCut, type EnrichedSegment } from '@/lib/videoAnalysis';
import { analyzeAllSegments, type SegmentAudioIntelligence } from '@/lib/audioAnalysis';
import { transcribeWithWhisper, cleanTranscript, alignTranscriptToSegments, type CleanedTranscript, type AlignedTranscript } from '@/lib/transcription';

interface ProcessingStateProps {
  videoUrl: string;
  onAnalysisComplete: (
    segments: EnrichedSegment[],
    cuts: DetectedCut[],
    audioAnalysis: SegmentAudioIntelligence[],
    transcript: CleanedTranscript,
    alignedTranscript: AlignedTranscript[]
  ) => void;
}

/**
 * ProcessingState Component
 * Runs real AI cut detection and analysis
 */
export default function ProcessingState({ videoUrl, onAnalysisComplete }: ProcessingStateProps) {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Initializing...');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasAnalyzed = useRef(false);

  // Run real analysis
  useEffect(() => {
    if (!videoUrl || hasAnalyzed.current) return;

    const runAnalysis = async () => {
      try {
        // Create video element
        const video = document.createElement('video');
        video.src = videoUrl;
        video.preload = 'auto';
        videoRef.current = video;

        // Wait for video metadata
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error('Failed to load video'));
        });

        hasAnalyzed.current = true;

        // Run analysis pipeline (cut detection)
        const result = await analyzeVideo(video, (stage, prog) => {
          setCurrentTask(stage);
          setProgress(prog * 70); // 0-70% for cut detection
        });

        // Run AI scene labeling
        setCurrentTask('Understanding your scenes...');
        setProgress(70);
        
        const enrichedSegments = await runSceneLabeling(
          videoUrl,
          result.segments,
          (current, total) => {
            const labelProgress = 70 + ((current / total) * 20); // 70-90%
            setProgress(labelProgress);
            setCurrentTask(`Understanding your scenes... (${current}/${total})`);
          }
        );

        // Run audio analysis
        setCurrentTask('Analyzing your audio...');
        setProgress(70);
        
        const videoBlob = await fetch(videoUrl).then(res => res.blob());
        const audioAnalysis = await analyzeAllSegments(
          videoBlob,
          enrichedSegments,
          (current, total) => {
            const audioProgress = 70 + ((current / total) * 10); // 70-80%
            setProgress(audioProgress);
            setCurrentTask(`Analyzing your audio... (${current}/${total})`);
          }
        );

        // Run transcription
        setCurrentTask('Transcribing audio...');
        setProgress(80);
        
        const whisperResponse = await transcribeWithWhisper(videoBlob);
        setProgress(85);
        
        const cleanedTranscript = cleanTranscript(whisperResponse, {
          removeFillerWords: true,
          removeRepeatedWords: true,
          normalizePunctuation: true,
          joinBrokenSentences: true,
        });
        setProgress(90);
        
        setCurrentTask('Aligning transcript...');
        const alignedTranscript = alignTranscriptToSegments(cleanedTranscript.words, enrichedSegments);
        setProgress(95);

        // Store results in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('monoframe_analyzed_segments', JSON.stringify(enrichedSegments));
          localStorage.setItem('monoframe_detected_cuts', JSON.stringify(result.cuts));
          localStorage.setItem('monoframe_audio_analysis', JSON.stringify(audioAnalysis));
          localStorage.setItem('monoframe_transcript', JSON.stringify(cleanedTranscript));
          localStorage.setItem('monoframe_aligned_transcript', JSON.stringify(alignedTranscript));
        }

        // Complete
        setProgress(100);
        setTimeout(() => {
          onAnalysisComplete(enrichedSegments, result.cuts, audioAnalysis, cleanedTranscript, alignedTranscript);
        }, 500);
      } catch (error) {
        console.error('Analysis failed:', error);
        setCurrentTask('Analysis failed - using fallback');
        setProgress(100);
        
        // Fallback: create a simple segment
        const fallbackSegments: EnrichedSegment[] = [{
          id: 'segment-0',
          startTime: 0,
          endTime: videoRef.current?.duration || 60,
          label: 'Full Video',
          confidence: 1.0,
        }];
        
        const emptyTranscript: CleanedTranscript = {
          text: '',
          segments: [],
          words: [],
          fillerWordsRemoved: 0,
          originalText: '',
        };
        
        setTimeout(() => {
          onAnalysisComplete(fallbackSegments, [], [], emptyTranscript, []);
        }, 1000);
      }
    };

    runAnalysis();
  }, [videoUrl, onAnalysisComplete]);

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] p-20 backdrop-blur-xl">
          <div className="text-center space-y-8">
            {/* Animated Loader */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
                
                {/* Inner pulsing circle */}
                <div className="absolute inset-4 rounded-full bg-white/5 animate-pulse"></div>
                
                {/* Center progress percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Processing Title */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Analyzing your film...
              </h1>
              <p className="text-white/60 text-lg h-7">
                {currentTask}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                {/* Waveform animation underneath */}
                <div className="absolute inset-0 flex items-center justify-around opacity-30">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-white/50 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`,
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* Progress fill */}
                <div
                  className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Progress Steps (visual indicators) */}
            <div className="space-y-3 max-w-md mx-auto">
              <div className="flex items-center space-x-3 text-sm text-white/70">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <span>Real AI analysis in progress...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

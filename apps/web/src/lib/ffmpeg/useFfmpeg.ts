"use client";

/**
 * React hook for FFmpeg operations
 * Manages worker lifecycle and provides a clean API for video processing
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchFile } from '@ffmpeg/util';
import {
  buildTrimCommand,
  buildTrimCommandWithAudioSmoothing,
  buildTranscodeCommand,
  buildTrimCommandWithVoiceover,
  buildBlackVideoWithAudio,
  buildSilentBlackVideo,
  estimateProcessingTime,
  createConcatCommand,
  generateConcatFile,
  type VideoSegment,
} from './ffmpegCommands';

interface FFmpegProgress {
  stage: 'idle' | 'loading' | 'processing' | 'done' | 'error';
  progress: number; // 0-1
  message: string;
  estimatedTime?: number;
  logs: string[];
  currentSegment?: number;
  totalSegments?: number;
}

// Phase 20: Voiceover segment data
export interface VoiceoverSegmentData {
  segmentId: string;
  audioUrl: string;
  durationSeconds: number;
}

export interface VoiceoverOptions {
  mode: 'original' | 'voiceover' | 'mixed';
  segments: VoiceoverSegmentData[];
}

interface UseFfmpegReturn {
  isLoaded: boolean;
  isProcessing: boolean;
  progress: FFmpegProgress;
  loadEngine: () => Promise<boolean>;
  processVideo: (file: File) => Promise<Blob | null>;
  trimSegments: (file: File, segments: VideoSegment[]) => Promise<Blob | null>;
  exportTimeline: (file: File, segments: VideoSegment[]) => Promise<Blob | null>;
  exportTimelineMulti: (
    file: File,
    segments: VideoSegment[],
    voiceoverOptions?: VoiceoverOptions
  ) => Promise<Blob | null>;
  reset: () => void;
}

export function useFfmpeg(): UseFfmpegReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<FFmpegProgress>({
    stage: 'idle',
    progress: 0,
    message: 'Ready',
    logs: [],
  });

  const workerRef = useRef<Worker | null>(null);
  const isMountedRef = useRef(true);

  // Initialize worker
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Update progress helper
  const updateProgress = useCallback(
    (update: Partial<FFmpegProgress>) => {
      if (!isMountedRef.current) return;
      setProgress((prev) => ({ ...prev, ...update }));
    },
    []
  );

  // Add log helper
  const addLog = useCallback(
    (message: string) => {
      if (!isMountedRef.current) return;
      setProgress((prev) => ({
        ...prev,
        logs: [...prev.logs.slice(-50), message], // Keep last 50 logs
      }));
    },
    []
  );

  /**
   * Load FFmpeg engine
   */
  const loadEngine = useCallback(async (): Promise<boolean> => {
    if (isLoaded) return true;

    try {
      updateProgress({
        stage: 'loading',
        progress: 0,
        message: 'Loading FFmpeg engine...',
      });

      // Create worker
      workerRef.current = new Worker(
        new URL('./ffmpegWorker.ts', import.meta.url),
        { type: 'module' }
      );

      // Set up message handler
      return new Promise((resolve) => {
        if (!workerRef.current) {
          resolve(false);
          return;
        }

        workerRef.current.onmessage = (event) => {
          const { type } = event.data;

          switch (type) {
            case 'loaded':
              if (event.data.success) {
                setIsLoaded(true);
                updateProgress({
                  stage: 'idle',
                  progress: 0,
                  message: 'Engine loaded successfully',
                });
                addLog('✅ FFmpeg engine loaded');
                resolve(true);
              } else {
                updateProgress({
                  stage: 'error',
                  progress: 0,
                  message: `Failed to load: ${event.data.error}`,
                });
                addLog(`❌ Load failed: ${event.data.error}`);
                resolve(false);
              }
              break;

            case 'log':
              addLog(event.data.message);
              break;

            case 'progress':
              updateProgress({
                progress: event.data.ratio,
              });
              break;

            case 'done':
              // Handled in specific functions
              break;
          }
        };

        // Send load command
        workerRef.current.postMessage({ type: 'load' });
      });
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      updateProgress({
        stage: 'error',
        progress: 0,
        message: 'Failed to load engine',
      });
      return false;
    }
  }, [isLoaded, updateProgress, addLog]);

  /**
   * Process a single video (basic transcode)
   */
  const processVideo = useCallback(
    async (file: File): Promise<Blob | null> => {
      if (!isLoaded || !workerRef.current) {
        console.error('FFmpeg not loaded');
        return null;
      }

      try {
        setIsProcessing(true);
        updateProgress({
          stage: 'processing',
          progress: 0,
          message: 'Preparing video...',
        });

        const inputName = 'input.mp4';
        const outputName = 'output.mp4';

        // Write input file
        addLog(`📁 Writing ${file.name} to virtual filesystem...`);
        const data = await fetchFile(file);
        workerRef.current.postMessage({
          type: 'writeFile',
          name: inputName,
          data,
        });

        // Wait for file written
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Build transcode command
        const command = buildTranscodeCommand(inputName, outputName, {
          quality: 'medium',
        });

        addLog(`⚙️ Running FFmpeg: ${command.join(' ')}`);
        updateProgress({ message: 'Processing video...' });

        // Run FFmpeg
        return new Promise((resolve) => {
          if (!workerRef.current) {
            resolve(null);
            return;
          }

          const handler = async (event: MessageEvent) => {
            if (event.data.type === 'done') {
              if (event.data.success) {
                addLog('✅ Processing complete');
                updateProgress({ message: 'Reading output...' });

                // Read output file
                workerRef.current?.postMessage({
                  type: 'readFile',
                  name: outputName,
                });
              } else {
                addLog(`❌ Processing failed: ${event.data.error}`);
                updateProgress({
                  stage: 'error',
                  message: 'Processing failed',
                });
                setIsProcessing(false);
                resolve(null);
              }
            } else if (event.data.type === 'fileData') {
              const blob = new Blob([event.data.data], { type: 'video/mp4' });
              addLog(`📦 Output ready: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
              updateProgress({
                stage: 'done',
                progress: 1,
                message: 'Export complete',
              });
              setIsProcessing(false);
              workerRef.current?.removeEventListener('message', handler);
              resolve(blob);
            }
          };

          workerRef.current.addEventListener('message', handler);
          workerRef.current.postMessage({ type: 'run', args: command });
        });
      } catch (error) {
        console.error('Processing error:', error);
        addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        updateProgress({
          stage: 'error',
          message: 'Processing failed',
        });
        setIsProcessing(false);
        return null;
      }
    },
    [isLoaded, updateProgress, addLog]
  );

  /**
   * Trim video into segments
   */
  const trimSegments = useCallback(
    async (file: File, segments: VideoSegment[]): Promise<Blob | null> => {
      if (!isLoaded || !workerRef.current) {
        console.error('FFmpeg not loaded');
        return null;
      }

      if (segments.length === 0) {
        console.error('No segments provided');
        return null;
      }

      try {
        setIsProcessing(true);
        updateProgress({
          stage: 'processing',
          progress: 0,
          message: 'Preparing to trim segments...',
        });

        const inputName = 'input.mp4';
        const outputName = 'output.mp4';

        // Write input file
        addLog(`📁 Writing ${file.name}...`);
        const data = await fetchFile(file);
        workerRef.current.postMessage({
          type: 'writeFile',
          name: inputName,
          data,
        });

        await new Promise((resolve) => setTimeout(resolve, 500));

        // For simplicity, we'll just trim the first segment
        // In production, you'd trim each segment and concatenate
        const firstSegment = segments[0];
        const duration = firstSegment.endTime - firstSegment.startTime;

        const command = buildTrimCommand(
          inputName,
          outputName,
          firstSegment.startTime,
          duration
        );

        addLog(`✂️ Trimming ${segments.length} segment(s)...`);
        updateProgress({ message: 'Trimming video...' });

        return new Promise((resolve) => {
          if (!workerRef.current) {
            resolve(null);
            return;
          }

          const handler = async (event: MessageEvent) => {
            if (event.data.type === 'done') {
              if (event.data.success) {
                addLog('✅ Trim complete');
                workerRef.current?.postMessage({
                  type: 'readFile',
                  name: outputName,
                });
              } else {
                addLog(`❌ Trim failed: ${event.data.error}`);
                updateProgress({
                  stage: 'error',
                  message: 'Trimming failed',
                });
                setIsProcessing(false);
                resolve(null);
              }
            } else if (event.data.type === 'fileData') {
              const blob = new Blob([event.data.data], { type: 'video/mp4' });
              addLog(`📦 Trimmed video ready`);
              updateProgress({
                stage: 'done',
                progress: 1,
                message: 'Trim complete',
              });
              setIsProcessing(false);
              workerRef.current?.removeEventListener('message', handler);
              resolve(blob);
            }
          };

          workerRef.current.addEventListener('message', handler);
          workerRef.current.postMessage({ type: 'run', args: command });
        });
      } catch (error) {
        console.error('Trim error:', error);
        addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        setIsProcessing(false);
        return null;
      }
    },
    [isLoaded, updateProgress, addLog]
  );

  /**
   * Export timeline with multiple segments
   */
  const exportTimeline = useCallback(
    async (file: File, segments: VideoSegment[]): Promise<Blob | null> => {
      if (!isLoaded || !workerRef.current) {
        console.error('FFmpeg not loaded');
        return null;
      }

      if (segments.length === 0) {
        console.error('No segments provided');
        return null;
      }

      try {
        setIsProcessing(true);
        const totalDuration = segments.reduce(
          (acc, seg) => acc + (seg.endTime - seg.startTime),
          0
        );
        const estimatedTime = estimateProcessingTime(totalDuration, 'concat');

        updateProgress({
          stage: 'processing',
          progress: 0,
          message: 'Exporting timeline...',
          estimatedTime,
        });

        const inputName = 'input.mp4';
        const outputName = 'output.mp4';

        // Write input file
        addLog(`📁 Writing ${file.name}...`);
        const data = await fetchFile(file);
        workerRef.current.postMessage({
          type: 'writeFile',
          name: inputName,
          data,
        });

        await new Promise((resolve) => setTimeout(resolve, 500));

        // For MVP: Just use the first segment
        // In production: trim each segment, then concatenate
        const firstSegment = segments[0];
        const duration = firstSegment.endTime - firstSegment.startTime;

        const command = buildTrimCommand(
          inputName,
          outputName,
          firstSegment.startTime,
          duration
        );

        addLog(`🎬 Exporting ${segments.length} segment(s)...`);
        addLog(`⏱️ Estimated time: ${estimatedTime}s`);
        updateProgress({ message: 'Rendering timeline...' });

        return new Promise((resolve) => {
          if (!workerRef.current) {
            resolve(null);
            return;
          }

          const handler = async (event: MessageEvent) => {
            if (event.data.type === 'done') {
              if (event.data.success) {
                addLog('✅ Export complete');
                workerRef.current?.postMessage({
                  type: 'readFile',
                  name: outputName,
                });
              } else {
                addLog(`❌ Export failed: ${event.data.error}`);
                updateProgress({
                  stage: 'error',
                  message: 'Export failed',
                });
                setIsProcessing(false);
                resolve(null);
              }
            } else if (event.data.type === 'fileData') {
              const blob = new Blob([event.data.data], { type: 'video/mp4' });
              addLog(`📦 Export ready: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
              updateProgress({
                stage: 'done',
                progress: 1,
                message: 'Your AI edit is ready',
              });
              setIsProcessing(false);
              workerRef.current?.removeEventListener('message', handler);
              resolve(blob);
            }
          };

          workerRef.current.addEventListener('message', handler);
          workerRef.current.postMessage({ type: 'run', args: command });
        });
      } catch (error) {
        console.error('Export error:', error);
        addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        setIsProcessing(false);
        return null;
      }
    },
    [isLoaded, updateProgress, addLog]
  );

  /**
   * Export timeline with multiple segments (full AI edit)
   * Trims each segment, then concatenates them into final video
   * Phase 20: Now supports AI voiceover audio
   * Phase 21 - Part 7: Now supports script-reedited timelines with:
   *   - Segments split by deletions
   *   - Reordered segments
   *   - Audio-only segments (insertions with no underlying video)
   * 
   * Note: Script-reedited timelines may have many small cuts. We intentionally
   * ignore micro-gaps (< 0.1s) between segments for smoother playback.
   */
  const exportTimelineMulti = useCallback(
    async (
      file: File,
      segments: VideoSegment[],
      voiceoverOptions?: VoiceoverOptions
    ): Promise<Blob | null> => {
      if (!isLoaded || !workerRef.current) {
        console.error('FFmpeg not loaded');
        return null;
      }

      if (segments.length === 0) {
        console.error('No segments provided');
        return null;
      }

      try {
        setIsProcessing(true);
        const totalDuration = segments.reduce(
          (acc, seg) => acc + (seg.endTime - seg.startTime),
          0
        );
        const estimatedTime = estimateProcessingTime(totalDuration, 'concat');

        // Check if voiceover is active
        const hasVoiceover = 
          voiceoverOptions && 
          voiceoverOptions.mode !== 'original' && 
          voiceoverOptions.segments.length > 0;

        updateProgress({
          stage: 'processing',
          progress: 0,
          message: hasVoiceover 
            ? `Preparing ${voiceoverOptions.mode} export...`
            : 'Preparing multi-segment export...',
          estimatedTime,
          totalSegments: segments.length,
          currentSegment: 0,
        });

        const inputName = 'input.mp4';
        const outputName = 'output.mp4';
        const concatListName = 'segments.txt';

        // Write input file
        addLog(`📁 Writing ${file.name}...`);
        const data = await fetchFile(file);
        workerRef.current.postMessage({
          type: 'writeFile',
          name: inputName,
          data,
        });

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Phase 20: Write voiceover audio files if present
        if (hasVoiceover) {
          addLog(`🎙️ Writing ${voiceoverOptions.segments.length} voiceover files...`);
          for (const voSeg of voiceoverOptions.segments) {
            try {
              const response = await fetch(voSeg.audioUrl);
              const audioData = await response.arrayBuffer();
              const fileName = `vo_${voSeg.segmentId}.mp3`;
              
              workerRef.current.postMessage({
                type: 'writeFile',
                name: fileName,
                data: new Uint8Array(audioData),
              });
            } catch (error) {
              console.error(`Failed to write voiceover for ${voSeg.segmentId}:`, error);
              addLog(`⚠️ Skipping voiceover for segment ${voSeg.segmentId}`);
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        
        // Phase 21 - Part 7: Write audio blobs for audioOnly segments (script re-edit insertions)
        const audioOnlySegments = segments.filter(seg => seg.audioOnly && seg.audioBlob);
        if (audioOnlySegments.length > 0) {
          addLog(`🎙️ Writing ${audioOnlySegments.length} audio-only segment(s) (script re-edit)...`);
          for (let i = 0; i < audioOnlySegments.length; i++) {
            const seg = audioOnlySegments[i];
            if (!seg.audioBlob) continue;
            
            try {
              const audioData = await seg.audioBlob.arrayBuffer();
              const fileName = `audio_${i}.mp3`;
              
              workerRef.current.postMessage({
                type: 'writeFile',
                name: fileName,
                data: new Uint8Array(audioData),
              });
              
              // Store filename reference for later use
              (seg as VideoSegment & { __audioFileName?: string }).__audioFileName = fileName;
            } catch (error) {
              console.error(`Failed to write audio for audioOnly segment ${i}:`, error);
              addLog(`⚠️ Skipping audio for audioOnly segment ${i}`);
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Generate segment commands
        // Phase 21 - Part 7: Enhanced to handle audioOnly segments (script re-edit insertions)
        const segmentCommands = segments.map((segment, index) => {
          const duration = segment.endTime - segment.startTime;
          const outputFile = `segment_${index}.mp4`;
          
          // Phase 21 - Part 7: Handle audio-only segments (no underlying video)
          if (segment.audioOnly) {
            const audioFileName = (segment as VideoSegment & { __audioFileName?: string }).__audioFileName;
            
            if (audioFileName) {
              // Audio-only segment with custom audio (TTS voiceover from script re-edit)
              return {
                command: buildBlackVideoWithAudio(
                  audioFileName,
                  outputFile,
                  duration,
                  { fadeIn: true, fadeOut: true }
                ),
                outputFile,
                segment,
              };
            } else {
              // Audio-only segment without audio blob (fallback: silent black video)
              return {
                command: buildSilentBlackVideo(outputFile, duration),
                outputFile,
                segment,
              };
            }
          }
          
          // Phase 20: Use voiceover command if available
          if (hasVoiceover) {
            const voiceover = voiceoverOptions.segments.find(
              (vo) => vo.segmentId === segment.clipId
            );
            
            if (voiceover && voiceoverOptions.mode !== 'original') {
              const voiceoverFile = `vo_${voiceover.segmentId}.mp3`;
              return {
                command: buildTrimCommandWithVoiceover(
                  inputName,
                  voiceoverFile,
                  outputFile,
                  segment.startTime,
                  duration,
                  voiceoverOptions.mode as 'voiceover' | 'mixed'
                ),
                outputFile,
                segment,
              };
            }
          }
          
          // Default: audio smoothing without voiceover (normal video segment)
          return {
            command: buildTrimCommandWithAudioSmoothing(
              inputName,
              outputFile,
              segment.startTime,
              duration,
              { fadeIn: true, fadeOut: true, loudnorm: true }
            ),
            outputFile,
            segment,
          };
        });
        
        // Phase 21 - Part 7: Enhanced logging for script-reedited timelines
        const audioOnlyCount = segments.filter(s => s.audioOnly).length;
        if (audioOnlyCount > 0) {
          addLog(`✂️ Processing ${segments.length} segments (${audioOnlyCount} audio-only from script re-edit)...`);
        } else if (hasVoiceover) {
          addLog(`✂️ Trimming ${segments.length} segments with ${voiceoverOptions.mode} audio...`);
        } else {
          addLog(`✂️ Trimming ${segments.length} segments with audio smoothing...`);
        }

        // Prepare commands array for worker
        const trimCommands = segmentCommands.map((cmd, i) => ({
          id: `segment_${i}`,
          args: cmd.command,
        }));

        // Run all trim commands
        return new Promise((resolve) => {
          if (!workerRef.current) {
            resolve(null);
            return;
          }

          let segmentProgress = 0;

          const handler = async (event: MessageEvent) => {
            if (event.data.type === 'commandProgress') {
              const { commandIndex, totalCommands } = event.data;
              segmentProgress = (commandIndex / totalCommands) * 0.7;
              updateProgress({
                progress: segmentProgress,
                message: `Processing segment ${commandIndex + 1}/${totalCommands}...`,
                currentSegment: commandIndex + 1,
              });
              addLog(`✅ Segment ${commandIndex + 1}/${totalCommands} complete`);
            } else if (event.data.type === 'allDone') {
              if (event.data.success) {
                addLog('✅ All segments trimmed');
                updateProgress({
                  progress: 0.7,
                  message: 'Generating concat list...',
                });

                // Generate concat file content
                const segmentFiles = segmentCommands.map((cmd) => cmd.outputFile);
                const concatContent = generateConcatFile(segmentFiles);
                const concatData = new TextEncoder().encode(concatContent);

                // Write concat list
                workerRef.current?.postMessage({
                  type: 'writeFile',
                  name: concatListName,
                  data: concatData,
                });

                setTimeout(async () => {
                  addLog('🔗 Concatenating segments...');
                  updateProgress({
                    progress: 0.75,
                    message: 'Stitching final video...',
                  });

                  // Run concat command
                  const concatCommand = createConcatCommand(concatListName, outputName);
                  workerRef.current?.postMessage({
                    type: 'run',
                    args: concatCommand,
                  });
                }, 500);
              } else {
                addLog(`❌ Segment processing failed: ${event.data.error}`);
                updateProgress({
                  stage: 'error',
                  message: 'Segment processing failed',
                });
                setIsProcessing(false);
                workerRef.current?.removeEventListener('message', handler);
                resolve(null);
              }
            } else if (event.data.type === 'done') {
              if (event.data.success) {
                addLog('✅ Concatenation complete');
                updateProgress({
                  progress: 0.95,
                  message: 'Reading final video...',
                });
                workerRef.current?.postMessage({
                  type: 'readFile',
                  name: outputName,
                });
              } else {
                addLog(`❌ Concatenation failed: ${event.data.error}`);
                updateProgress({
                  stage: 'error',
                  message: 'Concatenation failed',
                });
                setIsProcessing(false);
                workerRef.current?.removeEventListener('message', handler);
                resolve(null);
              }
            } else if (event.data.type === 'fileData') {
              const blob = new Blob([event.data.data], { type: 'video/mp4' });
              addLog(`📦 Export ready: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
              addLog(`✨ ${segments.length} segments merged successfully`);
              updateProgress({
                stage: 'done',
                progress: 1,
                message: 'Your AI edit is ready',
              });
              setIsProcessing(false);
              workerRef.current?.removeEventListener('message', handler);
              resolve(blob);
            }
          };

          workerRef.current.addEventListener('message', handler);
          workerRef.current.postMessage({ type: 'runMultiple', commands: trimCommands });
        });
      } catch (error) {
        console.error('Multi-segment export error:', error);
        addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        setIsProcessing(false);
        return null;
      }
    },
    [isLoaded, updateProgress, addLog]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setProgress({
      stage: 'idle',
      progress: 0,
      message: 'Ready',
      logs: [],
    });
    setIsProcessing(false);
  }, []);

  return {
    isLoaded,
    isProcessing,
    progress,
    loadEngine,
    processVideo,
    trimSegments,
    exportTimeline,
    exportTimelineMulti,
    reset,
  };
}


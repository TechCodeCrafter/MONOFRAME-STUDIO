/**
 * FFmpeg command builders for video processing
 * Phase 21 - Part 7: Enhanced for script re-edit support
 */

export interface VideoSegment {
  startTime: number; // seconds
  endTime: number; // seconds
  clipId?: string;
  audioOnly?: boolean; // Phase 21: For script re-edit insertions (no underlying video)
  audioBlob?: Blob; // Phase 21: Custom audio for audioOnly segments (TTS voiceover)
}

/**
 * Generate FFmpeg command for trimming a single segment
 */
export function buildTrimCommand(
  inputFile: string,
  outputFile: string,
  startTime: number,
  duration: number
): string[] {
  return [
    '-i',
    inputFile,
    '-ss',
    startTime.toFixed(2),
    '-t',
    duration.toFixed(2),
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '23',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    outputFile,
  ];
}

/**
 * Generate FFmpeg command for concatenating multiple segments
 */
export function buildConcatCommand(
  inputFiles: string[],
  outputFile: string
): string[] {
  // Create concat filter
  const filterComplex = inputFiles
    .map((_, i) => `[${i}:v][${i}:a]`)
    .join('') + `concat=n=${inputFiles.length}:v=1:a=1[outv][outa]`;

  return [
    ...inputFiles.flatMap((file) => ['-i', file]),
    '-filter_complex',
    filterComplex,
    '-map',
    '[outv]',
    '-map',
    '[outa]',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '23',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    outputFile,
  ];
}

/**
 * Generate FFmpeg command for re-encoding with specific codec
 */
export function buildTranscodeCommand(
  inputFile: string,
  outputFile: string,
  options: {
    codec?: 'h264' | 'vp9';
    quality?: 'low' | 'medium' | 'high';
    fps?: number;
  } = {}
): string[] {
  const { codec = 'h264', quality = 'medium', fps } = options;

  const crfMap = {
    low: '28',
    medium: '23',
    high: '18',
  };

  const commands = [
    '-i',
    inputFile,
    '-c:v',
    codec === 'h264' ? 'libx264' : 'libvpx-vp9',
    '-crf',
    crfMap[quality],
    '-preset',
    'medium',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
  ];

  if (fps) {
    commands.push('-r', fps.toString());
  }

  commands.push(outputFile);

  return commands;
}

/**
 * Generate FFmpeg command for extracting audio
 */
export function buildExtractAudioCommand(
  inputFile: string,
  outputFile: string
): string[] {
  return [
    '-i',
    inputFile,
    '-vn',
    '-acodec',
    'libmp3lame',
    '-b:a',
    '192k',
    outputFile,
  ];
}

/**
 * Estimate processing time based on video duration and operation
 */
export function estimateProcessingTime(
  videoDuration: number,
  operation: 'trim' | 'concat' | 'transcode'
): number {
  const baseMultiplier = {
    trim: 0.3,
    concat: 0.5,
    transcode: 1.0,
  };

  return Math.ceil(videoDuration * baseMultiplier[operation]);
}

/**
 * Generate FFmpeg commands for multiple segments
 * Returns an array of commands, one per segment
 */
export function createSegmentCommands(
  inputFile: string,
  segments: VideoSegment[]
): Array<{ command: string[]; outputFile: string; segment: VideoSegment }> {
  return segments.map((segment, index) => {
    const duration = segment.endTime - segment.startTime;
    const outputFile = `segment_${index}.mp4`;
    
    return {
      command: buildTrimCommand(inputFile, outputFile, segment.startTime, duration),
      outputFile,
      segment,
    };
  });
}

/**
 * Generate concat list file content for FFmpeg
 * Format: file 'segment_0.mp4'\nfile 'segment_1.mp4'\n...
 */
export function generateConcatFile(segmentFiles: string[]): string {
  return segmentFiles.map((file) => `file '${file}'`).join('\n');
}

/**
 * Generate FFmpeg command for concatenating segment files
 * Uses concat demuxer (faster than filter_complex)
 */
export function createConcatCommand(
  concatListFile: string,
  outputFile: string
): string[] {
  return [
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    concatListFile,
    '-c',
    'copy',
    outputFile,
  ];
}

/**
 * Build audio filter for fade in/out
 */
export function buildAudioFadeFilter(duration: number, fadeOutDuration: number = 0.3): string {
  const fadeInEnd = Math.min(0.3, duration / 4);
  const fadeOutStart = Math.max(0, duration - fadeOutDuration);
  
  return `afade=t=in:st=0:d=${fadeInEnd},afade=t=out:st=${fadeOutStart}:d=${fadeOutDuration}`;
}

/**
 * Build loudness normalization filter
 */
export function buildLoudnormFilter(): string {
  return 'loudnorm=I=-16:TP=-1.5:LRA=11';
}

/**
 * Build trim command with audio smoothing
 */
export function buildTrimCommandWithAudioSmoothing(
  inputFile: string,
  outputFile: string,
  startTime: number,
  duration: number,
  options: {
    fadeIn?: boolean;
    fadeOut?: boolean;
    loudnorm?: boolean;
  } = {}
): string[] {
  const { fadeIn = true, fadeOut = true, loudnorm = true } = options;
  
  const audioFilters: string[] = [];
  
  if (fadeIn || fadeOut) {
    audioFilters.push(buildAudioFadeFilter(duration));
  }
  
  if (loudnorm) {
    audioFilters.push(buildLoudnormFilter());
  }
  
  const commands = [
    '-i',
    inputFile,
    '-ss',
    startTime.toFixed(2),
    '-t',
    duration.toFixed(2),
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '23',
  ];
  
  if (audioFilters.length > 0) {
    commands.push('-af', audioFilters.join(','));
  }
  
  commands.push(
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    outputFile
  );
  
  return commands;
}

/**
 * Interface for subsegment (non-silent portion)
 */
export interface Subsegment {
  start: number;
  end: number;
}

/**
 * Build commands for removing silence from a segment
 * Returns multiple subsegment commands
 */
export function buildSilenceRemovalCommands(
  inputFile: string,
  segmentIndex: number,
  subsegments: Subsegment[]
): Array<{ command: string[]; outputFile: string }> {
  return subsegments.map((subseg, idx) => {
    const duration = subseg.end - subseg.start;
    const outputFile = `segment_${segmentIndex}_sub_${idx}.mp4`;
    
    return {
      command: buildTrimCommandWithAudioSmoothing(
        inputFile,
        outputFile,
        subseg.start,
        duration
      ),
      outputFile,
    };
  });
}

/**
 * Phase 20: AI Voiceover
 * Build audio filter for mixing original + voiceover audio
 * 
 * @param mode - 'voiceover' (AI only) or 'mixed' (original + AI)
 * @param originalVolume - Volume for original audio (0.0 - 1.0), default 0.35 for mixed mode
 * @param voiceoverVolume - Volume for voiceover audio (0.0 - 1.0), default 1.0
 */
export function buildVoiceoverAudioFilter(
  mode: 'voiceover' | 'mixed',
  originalVolume: number = 0.35,
  voiceoverVolume: number = 1.0
): string {
  if (mode === 'voiceover') {
    // Use only the voiceover audio (input 1)
    // Apply volume adjustment and fade
    return `[1:a]volume=${voiceoverVolume}[aout]`;
  } else {
    // Mixed mode: blend original (input 0) and voiceover (input 1)
    // Original audio is lowered, voiceover is prominent
    return `[0:a]volume=${originalVolume}[a0];[1:a]volume=${voiceoverVolume}[a1];[a0][a1]amix=inputs=2:duration=longest:dropout_transition=2[aout]`;
  }
}

/**
 * Phase 20: AI Voiceover
 * Build trim command with voiceover audio replacement/mixing
 * 
 * @param videoInputFile - Original video file
 * @param voiceoverAudioFile - TTS audio file for this segment
 * @param outputFile - Output segment file
 * @param startTime - Start time in video
 * @param duration - Duration to trim
 * @param mode - 'voiceover' (AI only) or 'mixed' (original + AI)
 */
export function buildTrimCommandWithVoiceover(
  videoInputFile: string,
  voiceoverAudioFile: string,
  outputFile: string,
  startTime: number,
  duration: number,
  mode: 'voiceover' | 'mixed'
): string[] {
  const audioFilter = buildVoiceoverAudioFilter(mode);
  
  return [
    '-i',
    videoInputFile,
    '-i',
    voiceoverAudioFile,
    '-ss',
    startTime.toFixed(2),
    '-t',
    duration.toFixed(2),
    '-filter_complex',
    audioFilter,
    '-map',
    '0:v', // Video from input 0 (original video)
    '-map',
    '[aout]', // Audio from filter
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '23',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-shortest', // End when shortest stream ends
    outputFile,
  ];
}

/**
 * Generate black video segment with custom audio (for audio-only segments)
 * Phase 21 - Part 7: Script re-edit support
 * 
 * Use case: Script re-edit insertions where user added new text and we generated
 * TTS voiceover but have no underlying video. We create a black frame video
 * to match the audio duration.
 * 
 * @param audioFile - The audio file (TTS voiceover from script re-edit)
 * @param outputFile - Output video file name
 * @param duration - Duration in seconds
 * @param options - Fade in/out options
 * @returns FFmpeg command array
 */
export function buildBlackVideoWithAudio(
  audioFile: string,
  outputFile: string,
  duration: number,
  options: { fadeIn?: boolean; fadeOut?: boolean } = {}
): string[] {
  const { fadeIn = false, fadeOut = false } = options;
  
  // Audio filter chain
  const audioFilters: string[] = [];
  
  if (fadeIn) {
    audioFilters.push('afade=t=in:st=0:d=0.3');
  }
  
  if (fadeOut) {
    audioFilters.push(`afade=t=out:st=${Math.max(0, duration - 0.3)}:d=0.3`);
  }
  
  // Loudness normalization
  audioFilters.push('loudnorm=I=-16:TP=-1.5:LRA=11');
  
  const audioFilterString = audioFilters.length > 0 ? audioFilters.join(',') : 'anull';
  
  return [
    // Generate black video source
    '-f',
    'lavfi',
    '-i',
    `color=c=black:s=1920x1080:d=${duration.toFixed(3)}`,
    '-i',
    audioFile,
    // Video: encode black frame
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '23',
    // Audio: apply filters
    '-af',
    audioFilterString,
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-shortest',
    outputFile,
  ];
}

/**
 * Generate silent black video (fallback for audio-only segments without audio blob)
 * Phase 21 - Part 7: Script re-edit support
 * 
 * @param outputFile - Output video file name
 * @param duration - Duration in seconds
 * @returns FFmpeg command array
 */
export function buildSilentBlackVideo(
  outputFile: string,
  duration: number
): string[] {
  return [
    '-f',
    'lavfi',
    '-i',
    `color=c=black:s=1920x1080:d=${duration.toFixed(3)}`,
    '-f',
    'lavfi',
    '-i',
    `anullsrc=r=44100:cl=stereo:d=${duration.toFixed(3)}`,
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '23',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-shortest',
    outputFile,
  ];
}


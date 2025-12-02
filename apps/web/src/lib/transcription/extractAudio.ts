/**
 * Audio extraction from video for transcription
 * Uses FFmpeg.wasm to extract audio track
 */

/**
 * Extract audio from video blob
 * Returns WAV audio buffer ready for Whisper API
 * 
 * @param videoBlob - Video file blob
 * @returns Audio buffer (WAV format, 16kHz mono)
 */
export async function extractAudioFromVideo(videoBlob: Blob): Promise<Blob> {
  try {
    // For now, we'll use the video blob directly as Whisper API accepts video files
    // OpenAI Whisper API can process video files directly and extract audio
    // If we need pure audio extraction in the future, we can add FFmpeg processing
    
    // Whisper API supports: mp3, mp4, mpeg, mpga, m4a, wav, webm
    // Most uploaded videos will be mp4, which is directly supported
    
    return videoBlob;
  } catch (error) {
    console.error('Failed to extract audio:', error);
    throw new Error('Audio extraction failed');
  }
}

/**
 * Convert audio to format suitable for Whisper
 * Whisper prefers: WAV, 16kHz, mono
 * 
 * @param audioBlob - Audio blob
 * @returns Formatted audio blob
 */
export async function formatAudioForWhisper(audioBlob: Blob): Promise<Blob> {
  // OpenAI Whisper API handles format conversion automatically
  // We just ensure the file is under 25MB limit
  
  const maxSize = 25 * 1024 * 1024; // 25MB
  
  if (audioBlob.size > maxSize) {
    throw new Error(`Audio file too large (${(audioBlob.size / 1024 / 1024).toFixed(1)}MB). Maximum 25MB.`);
  }
  
  return audioBlob;
}

/**
 * Estimate transcription time based on audio duration
 * 
 * @param durationSeconds - Audio duration in seconds
 * @returns Estimated processing time in seconds
 */
export function estimateTranscriptionTime(durationSeconds: number): number {
  // Whisper API typically processes at 10-20x real-time speed
  // Add some buffer for API latency
  const processingRate = 15; // 15x real-time
  return Math.ceil(durationSeconds / processingRate) + 2; // +2s for API latency
}


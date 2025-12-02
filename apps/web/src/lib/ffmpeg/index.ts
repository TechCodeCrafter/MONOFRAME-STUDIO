/**
 * FFmpeg Export Module
 * Real video processing powered by ffmpeg.wasm
 */

export { useFfmpeg } from './useFfmpeg';
export type { VideoSegment } from './ffmpegCommands';
export {
  buildTrimCommand,
  buildConcatCommand,
  buildTranscodeCommand,
  buildExtractAudioCommand,
  estimateProcessingTime,
  createSegmentCommands,
  createConcatCommand,
  generateConcatFile,
} from './ffmpegCommands';


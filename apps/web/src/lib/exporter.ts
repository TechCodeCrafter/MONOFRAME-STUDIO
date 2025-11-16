import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Global FFmpeg instance (lazy loaded)
let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoading = false;
let ffmpegReady = false;

// Global reference to export overlay functions (set by ExportOverlayProvider)
let globalShowOverlay: ((message: string) => void) | null = null;
let globalUpdateOverlay: ((message: string) => void) | null = null;
let globalHideOverlay: (() => void) | null = null;

/**
 * Set the global overlay functions (called by ExportOverlayProvider)
 */
export function setExportOverlayFunctions(
  show: (message: string) => void,
  update: (message: string) => void,
  hide: () => void
) {
  globalShowOverlay = show;
  globalUpdateOverlay = update;
  globalHideOverlay = hide;
}

/**
 * Initialize FFmpeg instance (lazy loading with caching)
 */
async function getFFmpeg(): Promise<FFmpeg> {
  // Return existing instance if already loaded
  if (ffmpegReady && ffmpegInstance) {
    return ffmpegInstance;
  }

  // Wait if already loading
  if (ffmpegLoading) {
    while (!ffmpegReady) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return ffmpegInstance!;
  }

  // Initialize new instance
  ffmpegLoading = true;

  try {
    // Show loading overlay
    if (globalShowOverlay) {
      globalShowOverlay('Loading FFmpeg...');
    }

    ffmpegInstance = new FFmpeg();

    // Load FFmpeg core
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegReady = true;
    return ffmpegInstance;
  } catch (error) {
    ffmpegLoading = false;
    if (globalHideOverlay) {
      globalHideOverlay();
    }
    throw new Error(`Failed to load FFmpeg: ${error}`);
  }
}

/**
 * Convert video URL (blob or regular) to Blob
 */
async function videoUrlToBlob(videoUrl: string): Promise<Blob> {
  try {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    throw new Error(`Failed to convert video URL to blob: ${error}`);
  }
}

/**
 * Export a trimmed video clip
 * @param videoUrl - URL or blob URL of the video
 * @param startTime - Start time in seconds
 * @param endTime - End time in seconds
 * @param filename - Optional output filename (default: 'trimmed_clip.mp4')
 * @returns Blob of the trimmed video
 */
export async function exportTrimmedClip(
  videoUrl: string,
  startTime: number,
  endTime: number,
  filename: string = 'trimmed_clip.mp4'
): Promise<Blob> {
  try {
    // Get FFmpeg instance (lazy load if needed)
    const ffmpeg = await getFFmpeg();

    // Update overlay
    if (globalUpdateOverlay) {
      globalUpdateOverlay('Preparing export...');
    }

    // Convert video URL to blob
    const videoBlob = await videoUrlToBlob(videoUrl);

    // Write input file to FFmpeg virtual file system
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoBlob));

    // Update overlay
    if (globalUpdateOverlay) {
      globalUpdateOverlay('Processing clip...');
    }

    // Calculate duration
    const duration = endTime - startTime;

    // Execute FFmpeg command to trim video
    // -i input.mp4: input file
    // -ss startTime: seek to start position
    // -t duration: duration to extract
    // -c copy: copy codec (no re-encoding, faster)
    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-ss',
      startTime.toString(),
      '-t',
      duration.toString(),
      '-c',
      'copy',
      'output.mp4',
    ]);

    // Update overlay
    if (globalUpdateOverlay) {
      globalUpdateOverlay('Finalizing export...');
    }

    // Read output file from FFmpeg virtual file system
    const data = await ffmpeg.readFile('output.mp4');

    // Clean up virtual file system
    await ffmpeg.deleteFile('input.mp4');
    await ffmpeg.deleteFile('output.mp4');

    // Convert Uint8Array to Blob
    const outputBlob = new Blob([data], { type: 'video/mp4' });

    // Trigger download
    downloadBlob(outputBlob, filename);

    return outputBlob;
  } catch (error) {
    throw new Error(`Failed to export trimmed clip: ${error}`);
  }
}

/**
 * Export the original video clip (no trimming)
 * @param videoUrl - URL or blob URL of the video
 * @param filename - Optional output filename (default: 'original_clip.mp4')
 * @returns Blob of the original video
 */
export async function exportOriginalClip(
  videoUrl: string,
  filename: string = 'original_clip.mp4'
): Promise<Blob> {
  try {
    // Convert video URL to blob
    const videoBlob = await videoUrlToBlob(videoUrl);

    // Trigger download
    downloadBlob(videoBlob, filename);

    return videoBlob;
  } catch (error) {
    throw new Error(`Failed to export original clip: ${error}`);
  }
}

/**
 * Helper function to trigger file download
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export multiple clips as a ZIP file
 * @param clips - Array of {videoUrl, startTime, endTime, title}
 * @param zipFilename - Name of the output ZIP file
 */
export async function exportClipsAsZip(
  clips: Array<{
    videoUrl: string;
    startTime: number;
    endTime: number;
    title: string;
  }>,
  zipFilename: string = 'clips.zip'
): Promise<void> {
  try {
    // Dynamically import JSZip (code splitting)
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Get FFmpeg instance once
    const ffmpeg = await getFFmpeg();

    const total = clips.length;

    // Process each clip
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const sanitizedTitle = clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${i + 1}_${sanitizedTitle}.mp4`;

      // Update overlay with progress
      if (globalUpdateOverlay) {
        globalUpdateOverlay(`Exporting clip ${i + 1}/${total}...`);
      }

      // Convert video URL to blob
      const videoBlob = await videoUrlToBlob(clip.videoUrl);

      // Write input file
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoBlob));

      // Calculate duration
      const duration = clip.endTime - clip.startTime;

      // Execute FFmpeg command to trim
      await ffmpeg.exec([
        '-i',
        'input.mp4',
        '-ss',
        clip.startTime.toString(),
        '-t',
        duration.toString(),
        '-c',
        'copy',
        'output.mp4',
      ]);

      // Read output file
      const data = await ffmpeg.readFile('output.mp4');

      // Add to ZIP
      zip.file(filename, data);

      // Clean up
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
    }

    // Update overlay for ZIP bundling
    if (globalUpdateOverlay) {
      globalUpdateOverlay('Bundling ZIP...');
    }

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Download ZIP
    downloadBlob(zipBlob, zipFilename);
  } catch (error) {
    throw new Error(`Failed to export clips as ZIP: ${error}`);
  }
}

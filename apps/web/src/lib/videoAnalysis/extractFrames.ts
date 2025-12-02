/**
 * Extract frames from video for cut detection
 */

export interface VideoFrame {
  time: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Extract frames from video element at specified interval
 * @param videoElement - HTML video element
 * @param intervalMs - Time between frames in milliseconds (default: 300ms)
 * @returns Array of extracted frames with timestamps
 */
export async function extractFrames(
  videoElement: HTMLVideoElement,
  intervalMs: number = 300
): Promise<VideoFrame[]> {
  return new Promise((resolve, reject) => {
    const frames: VideoFrame[] = [];
    const duration = videoElement.duration;
    
    if (!duration || duration === 0) {
      reject(new Error('Video duration is 0 or invalid'));
      return;
    }

    // Create canvas for frame extraction
    const canvas = document.createElement('canvas');
    const targetWidth = 320; // Downscale for performance
    const targetHeight = 180;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    // Calculate frame times
    const intervalSeconds = intervalMs / 1000;
    const frameTimes: number[] = [];
    for (let t = 0; t < duration; t += intervalSeconds) {
      frameTimes.push(t);
    }
    // Always include the last frame
    if (frameTimes[frameTimes.length - 1] < duration - 0.1) {
      frameTimes.push(duration - 0.1);
    }

    let currentFrameIndex = 0;

    const handleSeeked = () => {
      try {
        // Draw current video frame to canvas
        ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        frames.push({
          time: frameTimes[currentFrameIndex],
          dataUrl,
          width: targetWidth,
          height: targetHeight,
        });

        currentFrameIndex++;

        if (currentFrameIndex < frameTimes.length) {
          // Seek to next frame
          videoElement.currentTime = frameTimes[currentFrameIndex];
        } else {
          // All frames extracted
          videoElement.removeEventListener('seeked', handleSeeked);
          videoElement.removeEventListener('error', handleError);
          resolve(frames);
        }
      } catch (error) {
        videoElement.removeEventListener('seeked', handleSeeked);
        videoElement.removeEventListener('error', handleError);
        reject(error);
      }
    };

    const handleError = (_error: Event) => {
      videoElement.removeEventListener('seeked', handleSeeked);
      videoElement.removeEventListener('error', handleError);
      reject(new Error('Video error during frame extraction'));
    };

    videoElement.addEventListener('seeked', handleSeeked);
    videoElement.addEventListener('error', handleError);

    // Start extraction
    videoElement.currentTime = frameTimes[0];
  });
}

/**
 * Convert data URL to ImageData for analysis
 */
export function dataUrlToImageData(
  dataUrl: string,
  width: number,
  height: number
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      resolve(imageData);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}


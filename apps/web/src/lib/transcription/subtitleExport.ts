/**
 * Subtitle file generation (SRT, VTT)
 */

import type { TranscriptSegment } from './runWhisper';

/**
 * Format time for SRT (00:00:00,000)
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

/**
 * Format time for VTT (00:00:00.000)
 */
function formatVTTTime(seconds: number): string {
  return formatSRTTime(seconds).replace(',', '.');
}

/**
 * Generate SRT subtitle file
 */
export function generateSRT(segments: TranscriptSegment[]): string {
  const lines: string[] = [];

  segments.forEach((segment, index) => {
    lines.push(String(index + 1));
    lines.push(`${formatSRTTime(segment.start)} --> ${formatSRTTime(segment.end)}`);
    lines.push(segment.text.trim());
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Generate VTT subtitle file
 */
export function generateVTT(segments: TranscriptSegment[]): string {
  const lines: string[] = ['WEBVTT', ''];

  segments.forEach(segment => {
    lines.push(`${formatVTTTime(segment.start)} --> ${formatVTTTime(segment.end)}`);
    lines.push(segment.text.trim());
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Download subtitle file
 */
export function downloadSubtitle(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


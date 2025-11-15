/**
 * @monoframe/core
 * Core utilities and types for MonoFrame Studio
 */

export interface VideoProject {
  id: string;
  name: string;
  sourceVideo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportFormat {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  resolution: string;
}

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

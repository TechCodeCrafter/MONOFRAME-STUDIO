"use client";

/**
 * Cuts Tab Content
 * Smart Cut + Director's Cut controls
 */

import { Wand2, Film, RotateCcw } from 'lucide-react';

interface CutsTabProps {
  // Smart Cut props
  smartEditActive: boolean;
  smartEditTargetDuration: number;
  smartEditStats: {
    segmentCount: number;
    totalDuration: number;
    avgScore: number;
    highScoreSegments: number;
  } | null;
  onGenerateSmartCut: () => void;
  onResetSmartCut: () => void;
  onSmartCutDurationChange: (duration: number) => void;

  // Director's Cut props
  directorsCutActive: boolean;
  directorsCutTargetDuration: number;
  directorsCutStats: {
    segmentCount: number;
    totalDuration: number;
    avgConfidence: number;
    hookPresent: boolean;
    climaxPresent: boolean;
    outroPresent: boolean;
  } | null;
  directorsCutStoryFlow: string;
  onGenerateDirectorsCut: () => void;
  onResetDirectorsCut: () => void;
  onDirectorsCutDurationChange: (duration: number) => void;

  // Script Cut props
  scriptCutActive: boolean;
  scriptCutStats: {
    segmentCount: number;
    totalDuration: number;
    totalWords: number;
    avgWordsPerMinute: number;
    avgSegmentDuration: number;
  } | null;
  onResetScriptCut: () => void;
}

export function CutsTab({
  smartEditActive,
  smartEditTargetDuration,
  smartEditStats,
  onGenerateSmartCut,
  onResetSmartCut,
  onSmartCutDurationChange,
  directorsCutActive,
  directorsCutTargetDuration,
  directorsCutStats,
  directorsCutStoryFlow,
  onGenerateDirectorsCut,
  onResetDirectorsCut,
  onDirectorsCutDurationChange,
  scriptCutActive,
  scriptCutStats,
  onResetScriptCut,
}: CutsTabProps) {
  return (
    <div className="space-y-6">
      {/* Script Cut Status (if active) */}
      {scriptCutActive && scriptCutStats && (
        <div className="border border-green-500/30 bg-green-500/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">✂️</span>
              <h3 className="text-lg font-semibold text-white">Script Cut Active</h3>
            </div>
            <button
              onClick={onResetScriptCut}
              className="px-3 py-1.5 text-sm border border-white/20 text-white hover:bg-white/10 rounded transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-xl font-bold text-white">{scriptCutStats.segmentCount}</div>
              <div className="text-xs text-white/50">Segments</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{scriptCutStats.totalDuration.toFixed(1)}s</div>
              <div className="text-xs text-white/50">Duration</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{scriptCutStats.totalWords}</div>
              <div className="text-xs text-white/50">Words</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{scriptCutStats.avgWordsPerMinute.toFixed(0)}</div>
              <div className="text-xs text-white/50">WPM</div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Cut */}
      <div className="border border-white/10 bg-white/[0.02] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Smart Cut (AI Auto Edit)</h3>
        </div>
        
        <p className="text-sm text-white/60 mb-4">
          Automatically select the best segments based on quality metrics.
        </p>

        {/* Duration Buttons */}
        <div className="flex items-center gap-2 mb-4">
          {[30, 60, 90, 120].map((dur) => (
            <button
              key={dur}
              onClick={() => onSmartCutDurationChange(dur)}
              className={`px-3 py-2 text-sm rounded transition-all ${
                smartEditTargetDuration === dur
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                  : 'border border-white/10 text-white/70 hover:bg-white/5'
              }`}
            >
              {dur}s
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerateSmartCut}
          className="w-full px-4 py-3 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg font-medium hover:bg-purple-500/30 transition-all"
        >
          Generate Smart Cut
        </button>

        {/* Stats */}
        {smartEditActive && smartEditStats && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-green-400">✓ Smart Cut Active</span>
              <button
                onClick={onResetSmartCut}
                className="px-2 py-1 text-xs border border-white/20 text-white hover:bg-white/10 rounded transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <div className="text-lg font-bold text-white">{smartEditStats.segmentCount}</div>
                <div className="text-xs text-white/50">Segments</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{smartEditStats.totalDuration.toFixed(1)}s</div>
                <div className="text-xs text-white/50">Duration</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{(smartEditStats.avgScore * 100).toFixed(0)}%</div>
                <div className="text-xs text-white/50">Avg Score</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{smartEditStats.highScoreSegments}</div>
                <div className="text-xs text-white/50">High Quality</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Director's Cut */}
      <div className="border border-white/10 bg-white/[0.02] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Film className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Director&apos;s Cut (AI Story Edit)</h3>
        </div>
        
        <p className="text-sm text-white/60 mb-4">
          Build a narrative storyline using scene archetypes and AI intelligence.
        </p>

        {/* Duration Buttons */}
        <div className="flex items-center gap-2 mb-4">
          {[60, 90, 120].map((dur) => (
            <button
              key={dur}
              onClick={() => onDirectorsCutDurationChange(dur)}
              className={`px-3 py-2 text-sm rounded transition-all ${
                directorsCutTargetDuration === dur
                  ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                  : 'border border-white/10 text-white/70 hover:bg-white/5'
              }`}
            >
              {dur}s
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerateDirectorsCut}
          className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg font-medium hover:bg-blue-500/30 transition-all"
        >
          Generate Director&apos;s Cut
        </button>

        {/* Stats */}
        {directorsCutActive && directorsCutStats && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-green-400">✓ Director&apos;s Cut Active</span>
              <button
                onClick={onResetDirectorsCut}
                className="px-2 py-1 text-xs border border-white/20 text-white hover:bg-white/10 rounded transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
            
            {/* Story Flow */}
            {directorsCutStoryFlow && (
              <p className="text-sm text-white/60 mb-3 italic">&ldquo;{directorsCutStoryFlow}&rdquo;</p>
            )}
            
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="text-lg font-bold text-white">{directorsCutStats.segmentCount}</div>
                <div className="text-xs text-white/50">Segments</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{directorsCutStats.totalDuration.toFixed(1)}s</div>
                <div className="text-xs text-white/50">Duration</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{(directorsCutStats.avgConfidence * 100).toFixed(0)}%</div>
                <div className="text-xs text-white/50">Confidence</div>
              </div>
            </div>
            
            <div className="mt-2 flex items-center justify-center gap-4 text-xs">
              <span className={directorsCutStats.hookPresent ? 'text-green-400' : 'text-white/30'}>
                {directorsCutStats.hookPresent ? '✓' : '○'} Hook
              </span>
              <span className={directorsCutStats.climaxPresent ? 'text-green-400' : 'text-white/30'}>
                {directorsCutStats.climaxPresent ? '✓' : '○'} Climax
              </span>
              <span className={directorsCutStats.outroPresent ? 'text-green-400' : 'text-white/30'}>
                {directorsCutStats.outroPresent ? '✓' : '○'} Outro
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


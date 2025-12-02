'use client';

import { useState } from 'react';
import { X, Lock, Download, Zap } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExport: (preset: string) => void;
}

type ExportPreset = {
  id: string;
  name: string;
  description: string;
  resolution: string;
  isLocked: boolean;
  badge?: string;
};

const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: '1080p',
    name: '1080p Fast Export',
    description: 'Full HD quality with AI enhancements applied. Perfect for social media and web.',
    resolution: '1920×1080',
    isLocked: false,
    badge: 'Free',
  },
  {
    id: '4k',
    name: '4K Premium Export',
    description: 'Ultra HD quality with advanced color grading and motion smoothing.',
    resolution: '3840×2160',
    isLocked: true,
    badge: 'Pro',
  },
  {
    id: 'pro',
    name: 'Pro Export w/ Watermark Removed',
    description: 'Highest quality export with no branding. Includes all AI features unlocked.',
    resolution: '4096×2160',
    isLocked: true,
    badge: 'Enterprise',
  },
];

/**
 * ExportModal Component
 * Modal for selecting export preset and initiating fake AI export
 */
export default function ExportModal({ isOpen, onClose, onStartExport }: ExportModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('1080p');

  if (!isOpen) return null;

  const handleStartExport = () => {
    const preset = EXPORT_PRESETS.find((p) => p.id === selectedPreset);
    if (preset && !preset.isLocked) {
      onStartExport(selectedPreset);
    }
  };

  const canExport = EXPORT_PRESETS.find((p) => p.id === selectedPreset)?.isLocked === false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_48px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
              Export AI Edit
            </h2>
            <p className="text-sm text-white/60">
              Choose your export quality and start rendering
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Presets */}
        <div className="p-8 space-y-4">
          {EXPORT_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className={`
                relative p-6 rounded-xl border transition-all duration-200 cursor-pointer
                ${
                  preset.isLocked
                    ? 'bg-white/[0.02] border-white/5 opacity-60 cursor-not-allowed'
                    : selectedPreset === preset.id
                    ? 'bg-white/[0.08] border-white/30 shadow-[0_0_24px_rgba(255,255,255,0.1)]'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                }
              `}
              onClick={() => !preset.isLocked && setSelectedPreset(preset.id)}
            >
              {/* Lock Icon */}
              {preset.isLocked && (
                <div className="absolute top-4 right-4">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
              )}

              {/* Badge */}
              {preset.badge && (
                <div className="absolute top-4 right-4">
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold tracking-wide
                      ${
                        preset.isLocked
                          ? 'bg-white/10 text-white/50'
                          : 'bg-white text-black'
                      }
                    `}
                  >
                    {preset.badge}
                  </span>
                </div>
              )}

              {/* Radio Button */}
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-6 h-6 mt-1">
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${
                        selectedPreset === preset.id && !preset.isLocked
                          ? 'border-white bg-white'
                          : 'border-white/30 bg-transparent'
                      }
                    `}
                  >
                    {selectedPreset === preset.id && !preset.isLocked && (
                      <div className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {preset.name}
                    </h3>
                    {!preset.isLocked && (
                      <Zap className="w-4 h-4 text-white/60" />
                    )}
                  </div>
                  <p className="text-sm text-white/60 mb-3">
                    {preset.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-white/40">
                    <span className="flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>MP4</span>
                    </span>
                    <span>•</span>
                    <span>{preset.resolution}</span>
                    {!preset.isLocked && (
                      <>
                        <span>•</span>
                        <span>~4 seconds</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-8 border-t border-white/10 bg-white/[0.02]">
          <p className="text-xs text-white/50">
            {canExport ? 'Free tier includes 1080p exports' : 'Upgrade to unlock premium exports'}
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExport}
              disabled={!canExport}
              className={`
                px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200
                ${
                  canExport
                    ? 'bg-white text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }
              `}
            >
              Start Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



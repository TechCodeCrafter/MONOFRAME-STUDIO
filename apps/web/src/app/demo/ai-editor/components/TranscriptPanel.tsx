'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Download, Type, Scissors } from 'lucide-react';
import type { CleanedTranscript, AlignedTranscript, WordTimestamp } from '@/lib/transcription';
import { searchKeyword, generateSRT, generateVTT, downloadSubtitle, isFillerWord } from '@/lib/transcription';

interface TranscriptPanelProps {
  transcript: CleanedTranscript;
  alignedTranscript: AlignedTranscript[];
  currentTime?: number;
  onSeekTo?: (time: number) => void;
  onGenerateScriptCut?: (selectedWordIndices: number[]) => void;
  className?: string;
  // New props for script re-editing
  onScriptApply?: (editedText: string) => void;
  originalPlainText?: string;
  editedPlainText?: string;
}

export default function TranscriptPanel({
  transcript,
  alignedTranscript,
  currentTime = 0,
  onSeekTo,
  onGenerateScriptCut,
  className = '',
  onScriptApply,
  originalPlainText,
  editedPlainText,
}: TranscriptPanelProps) {
  const [showFillerWords, setShowFillerWords] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [selectedWordIndices, setSelectedWordIndices] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Script re-edit mode
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [draftText, setDraftText] = useState<string>('');
  
  // Initialize draftText from transcript
  useEffect(() => {
    if (originalPlainText) {
      setDraftText(originalPlainText);
    } else if (editedPlainText) {
      setDraftText(editedPlainText);
    } else if (transcript.words.length > 0) {
      // Compute from words
      const plainText = transcript.words.map(w => w.word).join(' ');
      setDraftText(plainText);
    }
  }, [originalPlainText, editedPlainText, transcript.words]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = searchKeyword(searchQuery, transcript.words);
    setSearchResults(results.map(r => r.wordIndex));
  }, [searchQuery, transcript.words]);

  // Handle word click
  const handleWordClick = (word: WordTimestamp, index: number) => {
    if (isSelectionMode) {
      // Toggle selection
      const newSelection = new Set(selectedWordIndices);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      setSelectedWordIndices(newSelection);
    } else {
      // Seek to word timestamp
      onSeekTo?.(word.start);
    }
  };

  // Handle download SRT
  const handleDownloadSRT = () => {
    const srtContent = generateSRT(transcript.segments);
    downloadSubtitle(srtContent, 'transcript.srt');
  };

  // Handle download VTT
  const handleDownloadVTT = () => {
    const vttContent = generateVTT(transcript.segments);
    downloadSubtitle(vttContent, 'transcript.vtt');
  };

  // Handle generate script cut
  const handleGenerateScriptCut = () => {
    if (selectedWordIndices.size === 0) {
      alert('Please select text ranges to keep in your Script Cut.');
      return;
    }

    const indices = Array.from(selectedWordIndices).sort((a, b) => a - b);
    onGenerateScriptCut?.(indices);
    
    // Reset selection
    setSelectedWordIndices(new Set());
    setIsSelectionMode(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${String(secs).padStart(2, '0')}.${ms}`;
  };
  
  // Handle apply script changes
  const handleApplyScriptChanges = () => {
    if (!onScriptApply) return;
    
    const originalText = originalPlainText || transcript.words.map(w => w.word).join(' ');
    
    if (draftText.trim() === originalText.trim()) {
      alert('No changes detected in the script.');
      return;
    }
    
    const confirmApply = confirm(
      'Applying script changes will re-edit your video timeline based on text modifications. Continue?'
    );
    
    if (!confirmApply) return;
    
    onScriptApply(draftText);
  };
  
  // Check if script has changes
  const hasScriptChanges = () => {
    const originalText = originalPlainText || transcript.words.map(w => w.word).join(' ');
    return draftText.trim() !== originalText.trim() && draftText.trim().length >= 5;
  };

  return (
    <div className={`rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-semibold text-white">
            Transcript & Script Editing
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => setMode('view')}
              className={`px-3 py-1.5 text-sm rounded transition-all ${
                mode === 'view'
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              View Mode
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1.5 text-sm rounded transition-all ${
                mode === 'edit'
                  ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Edit Script
            </button>
          </div>
          
          <span className="text-xs text-white/40">
            {transcript.words.length} words
            {transcript.fillerWordsRemoved > 0 && ` • ${transcript.fillerWordsRemoved} filler removed`}
          </span>
        </div>
      </div>

      {/* VIEW MODE: Existing transcript viewer */}
      {mode === 'view' && (
        <>
          {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg focus:bg-white/10 focus:border-white/20 transition-all outline-none"
          />
          {searchResults.length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/60">
              {searchResults.length} found
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFillerWords(!showFillerWords)}
            className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${
              !showFillerWords
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            Hide Fillers
          </button>
          <button
            onClick={handleDownloadSRT}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 text-xs rounded-lg transition-all flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>SRT</span>
          </button>
          <button
            onClick={handleDownloadVTT}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 text-xs rounded-lg transition-all flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>VTT</span>
          </button>
        </div>
      </div>

      {/* Selection Mode Controls */}
      {isSelectionMode && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scissors className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">
              Selection Mode: {selectedWordIndices.size} words selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerateScriptCut}
              disabled={selectedWordIndices.size === 0}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs font-semibold rounded hover:bg-blue-500/30 transition-all disabled:opacity-50"
            >
              Generate Script Cut
            </button>
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedWordIndices(new Set());
              }}
              className="px-3 py-2 text-xs text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!isSelectionMode && onGenerateScriptCut && (
        <button
          onClick={() => setIsSelectionMode(true)}
          className="mb-4 w-full px-4 py-2 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 text-sm rounded-lg transition-all flex items-center justify-center space-x-2"
        >
          <Scissors className="w-4 h-4" />
          <span>Select Text to Create Script Cut</span>
        </button>
      )}

      {/* Transcript Content */}
      <div
        ref={panelRef}
        className="max-h-96 overflow-y-auto bg-black/30 rounded-lg p-4 space-y-4"
      >
        {alignedTranscript.length > 0 ? (
          alignedTranscript.map((aligned) => (
            <div key={aligned.segmentId} className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-white/40">
                <span className="font-mono">{formatTime(aligned.startTime)}</span>
                <span>—</span>
                <span className="font-mono">{formatTime(aligned.endTime)}</span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed flex flex-wrap gap-1">
                {aligned.words.map((word, wordIdx) => {
                  const globalIndex = transcript.words.findIndex(
                    w => w.start === word.start && w.word === word.word
                  );
                  const isSearchMatch = searchResults.includes(globalIndex);
                  const isSelected = selectedWordIndices.has(globalIndex);
                  const isFiller = isFillerWord(word.word);
                  const isCurrentWord = currentTime >= word.start && currentTime < word.end;

                  return (
                    <span
                      key={`${aligned.segmentId}-${wordIdx}`}
                      onClick={() => handleWordClick(word, globalIndex)}
                      className={`inline-block px-1 rounded cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-500/40 text-blue-200'
                          : isSearchMatch
                          ? 'bg-yellow-500/40 text-yellow-200'
                          : isCurrentWord
                          ? 'bg-white/20 text-white font-semibold'
                          : isFiller && !showFillerWords
                          ? 'hidden'
                          : isFiller
                          ? 'text-white/30 italic'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                      title={`${formatTime(word.start)} - Click to seek`}
                    >
                      {word.word}
                    </span>
                  );
                })}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-white/50">
              Transcript will appear here after processing
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-xs text-white/50">
        <div>
          <span className="text-white/40">Total Words:</span>{' '}
          <span className="text-white font-mono">{transcript.words.length}</span>
        </div>
        {transcript.fillerWordsRemoved > 0 && (
          <div>
            <span className="text-white/40">Filler Removed:</span>{' '}
            <span className="text-emerald-400 font-mono">{transcript.fillerWordsRemoved}</span>
          </div>
        )}
        {alignedTranscript.length > 0 && (
          <div>
            <span className="text-white/40">Paragraphs:</span>{' '}
            <span className="text-white font-mono">{alignedTranscript.length}</span>
          </div>
        )}
      </div>
        </>
      )}

      {/* EDIT MODE: Full-text script editor */}
      {mode === 'edit' && (
        <div className="space-y-4">
          {/* Helper Text */}
          <p className="text-sm text-white/60">
            Edit the script below. Changes will be analyzed and applied to your video timeline.
          </p>

          {/* Textarea */}
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="w-full h-[500px] bg-black/40 border border-white/20 rounded-lg p-4 text-white text-sm leading-relaxed font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            placeholder="Edit your transcript here..."
            spellCheck={false}
          />

          {/* Character Count */}
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>{draftText.length} characters • {draftText.trim().split(/\s+/).length} words</span>
            {hasScriptChanges() && (
              <span className="text-emerald-400">● Changes detected</span>
            )}
          </div>

          {/* Apply Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => setMode('view')}
              className="px-4 py-2 text-sm border border-white/20 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyScriptChanges}
              disabled={!hasScriptChanges()}
              className="px-6 py-2 text-sm bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Script Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

/**
 * DemoResults Component - Compact Editor Layout
 * Refactored for professional editor-like UI with sidebar and tabs
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Scissors, Target, Download, FileVideo, Link, Loader2, BarChart3, Brain, Activity, Move, Sparkles } from 'lucide-react';
import ExportModal from './ExportModal';
import ExportProgress from './ExportProgress';
import TimelineEditor, { type TimelineSegment } from './TimelineEditor';
import { createDemoShare } from '@/lib/shareStore';
import { useFfmpeg } from '@/lib/ffmpeg/useFfmpeg';
import type { VideoSegment } from '@/lib/ffmpeg/ffmpegCommands';
import type { EnrichedSegment, DetectedCut } from '@/lib/videoAnalysis';
import type { SegmentAudioIntelligence } from '@/lib/audioAnalysis';
import { generateSmartEdit, calculateSmartEditStats } from '@/lib/autoEdit';
import { classifyAllScenes, buildStoryline, generateStoryFlowDescription } from '@/lib/directorsCut';
import { saveSession, getSessionById, generateSessionId, type MonoFrameEditSession, type EditMode } from '@/lib/editorSessionStore';
import type { CleanedTranscript, AlignedTranscript } from '@/lib/transcription';
import SavedEditsPanel from './SavedEditsPanel';
import TranscriptPanel from './TranscriptPanel';
import { VoiceoverPanel, type VoiceoverState } from './VoiceoverPanel';
import { diffTranscript, applyScriptEditsToTimeline, type TranscriptWord } from '@/lib/scriptReedit';
import { Wand2, RotateCcw, Film, FileEdit } from 'lucide-react';

interface DemoResultsProps {
  videoUrl: string;
  analyzedSegments: EnrichedSegment[];
  detectedCuts: DetectedCut[];
  audioAnalysis: SegmentAudioIntelligence[];
  transcript: CleanedTranscript;
  alignedTranscript: AlignedTranscript[];
  onReset: () => void;
}

const ALL_SUGGESTIONS = [
  'Increase pacing by 12% between 00:41–01:10',
  'Add punch-in zoom at Scene 3',
  'Use B-roll during transition at 02:05',
  'Reduce silence gap at 00:13',
  'Improve emotional delivery in final scene',
  'Add slow-motion effect at 01:23',
  'Tighten cut between Scene 4 and 5',
  'Enhance audio mix during dialogue',
  'Add subtle color grade for mood consistency',
];

const CUT_LABELS = [
  'Punch-in',
  'Wide shot',
  'Reaction',
  'Beat change',
  'Dialogue start',
  'Action peak',
  'Transition',
  'Establishing',
  'Close-up',
  'Pan',
  'Zoom',
  'Match cut',
];

export default function DemoResults({ 
  videoUrl, 
  analyzedSegments, 
  detectedCuts, 
  audioAnalysis, 
  transcript, 
  alignedTranscript, 
  onReset 
}: DemoResultsProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBeforeMode, setIsBeforeMode] = useState(false);
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);
  const [activeCutId, setActiveCutId] = useState<string | null>(null);
  
  // NEW: Simple tab state for compact layout
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'analysis' | 'cuts' | 'attention' | 'motion'>('analysis');
  
  // Export system state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportProgress, setShowExportProgress] = useState(false);
  const [exportedFiles, setExportedFiles] = useState<Array<{
    id: string;
    name: string;
    format: string;
    resolution: string;
    filesize: string;
    url: string;
    timestamp: Date;
  }>>([]);
  
  // Share system state
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  
  // FFmpeg real export state
  const {
    isLoaded: isFfmpegLoaded,
    isProcessing: isFfmpegProcessing,
    progress: ffmpegProgress,
    loadEngine,
    exportTimelineMulti,
  } = useFfmpeg();
  
  const [showFfmpegLogs, setShowFfmpegLogs] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Timeline editor state
  const [timelineSegments, setTimelineSegments] = useState<TimelineSegment[]>([]);
  const [originalSegments, setOriginalSegments] = useState<TimelineSegment[]>([]);
  
  // Smart Cut state
  const [smartEditActive, setSmartEditActive] = useState(false);
  const [smartEditTargetDuration, setSmartEditTargetDuration] = useState(60);
  const [smartEditStats, setSmartEditStats] = useState<{
    segmentCount: number;
    totalDuration: number;
    avgScore: number;
    highScoreSegments: number;
  } | null>(null);
  
  // Director's Cut state
  const [directorsCutActive, setDirectorsCutActive] = useState(false);
  const [directorsCutTargetDuration, setDirectorsCutTargetDuration] = useState(60);
  const [directorsCutStoryFlow, setDirectorsCutStoryFlow] = useState<string>('');
  const [directorsCutStats, setDirectorsCutStats] = useState<{
    segmentCount: number;
    totalDuration: number;
    avgConfidence: number;
    hookPresent: boolean;
    climaxPresent: boolean;
    outroPresent: boolean;
  } | null>(null);
  
  // Session management state
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  
  // Voiceover state
  const [voiceoverMode, setVoiceoverMode] = useState<'original' | 'voiceover' | 'mixed'>('original');
  const [activeVoiceId, setActiveVoiceId] = useState<string>('neutral_narrator');
  const [voiceoverState, setVoiceoverState] = useState<{
    segments: Array<{
      segmentId: string;
      audioUrl: string;
      durationSeconds: number;
    }>;
    generatedAt: string;
    voiceProfileId: string;
    speed: number;
  } | null>(null);
  
  // Script Re-Edit state
  const [scriptReeditActive, setScriptReeditActive] = useState(false);
  const [scriptReeditStats, setScriptReeditStats] = useState<{
    operationsCount: number;
    removedCount: number;
    insertedCount: number;
    replacedCount: number;
    reorderedCount: number;
  } | null>(null);
  const [originalTranscriptWords, setOriginalTranscriptWords] = useState<TranscriptWord[] | null>(null);
  const [originalTranscriptPlain, setOriginalTranscriptPlain] = useState<string | null>(null);
  const [timelineBeforeScriptReedit, setTimelineBeforeScriptReedit] = useState<TimelineSegment[]>([]);

  // Generate fake cut markers (8-14 cuts)
  const cutMarkers = useMemo(() => {
    const numCuts = Math.floor(Math.random() * 7) + 8;
    return Array.from({ length: numCuts }, (_, i) => ({
      id: `cut-${i}`,
      time: (i + 1) * (100 / (numCuts + 1)),
      intensity: Math.random() * 0.6 + 0.4,
      label: CUT_LABELS[Math.floor(Math.random() * CUT_LABELS.length)],
    }));
  }, []);

  // Generate fake tracked objects (3-5 objects)
  const trackedObjects = useMemo(() => {
    const numObjects = Math.floor(Math.random() * 3) + 3;
    return Array.from({ length: numObjects }, (_, i) => ({
      id: `track-${i}`,
      basePosition: {
        x: 10 + Math.random() * 70,
        y: 20 + Math.random() * 50,
      },
      size: {
        w: 10 + Math.random() * 15,
        h: 10 + Math.random() * 15,
      },
      amplitude: Math.random() * 5 + 2,
      frequency: Math.random() * 2 + 1,
      label: ['SUBJECT', 'FOREGROUND', 'ACTION', 'FOCUS'][Math.floor(Math.random() * 4)] + ` ${i + 1}`,
    }));
  }, []);

  // Generate attention heatmap segments (3-5 segments)
  const attentionSegments = useMemo(() => {
    const numSegments = Math.floor(Math.random() * 3) + 3;
    return Array.from({ length: numSegments }, (_, i) => {
      const startPercent = i * (100 / numSegments);
      const endPercent = (i + 1) * (100 / numSegments);
      return {
        id: `attention-${i}`,
        startPercent,
        endPercent,
        intensity: Math.random() * 0.5 + 0.5,
        label: ['High Emotion', 'Fast Action', 'Dialogue Focus', 'Visual Interest', 'Key Moment'][
          Math.floor(Math.random() * 5)
        ],
      };
    });
  }, []);

  // Use real analyzed segments
  const segmentList = useMemo(() => {
    return analyzedSegments.map((seg) => ({
      id: seg.id,
      label: seg.label,
      startPercent: (seg.startTime / duration) * 100,
      endPercent: (seg.endTime / duration) * 100,
      suggestion: ALL_SUGGESTIONS[Math.floor(Math.random() * ALL_SUGGESTIONS.length)],
    }));
  }, [analyzedSegments, duration]);

  // Generate 12 random scene bars (heights between 40-160px)
  const sceneBars = useMemo(() => {
    return Array.from({ length: 12 }, () => ({
      height: Math.floor(Math.random() * 120) + 40,
    }));
  }, []);

  // Select 3 random suggestions
  const selectedSuggestions = useMemo(() => {
    const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  // Initialize timeline segments from analyzed segments
  useEffect(() => {
    if (duration > 0 && analyzedSegments.length > 0) {
      const initialSegments: TimelineSegment[] = analyzedSegments.map((seg) => ({
        id: seg.id,
        startTime: seg.startTime,
        endTime: seg.endTime,
        label: seg.label,
        aiLabel: seg.aiLabel,
      }));
      setTimelineSegments(initialSegments);
      setOriginalSegments(initialSegments);
    }
  }, [duration, analyzedSegments]);
  
  // Initialize transcript for script re-editing
  useEffect(() => {
    if (transcript.words.length > 0) {
      // Convert WordTimestamp[] to TranscriptWord[]
      const transcriptWords: TranscriptWord[] = transcript.words.map((word, idx) => {
        // Find which segment this word belongs to
        const segment = analyzedSegments.find(
          seg => word.start >= seg.startTime && word.end <= seg.endTime
        );
        
        return {
          id: `word-${idx}`,
          text: word.word,
          start: word.start,
          end: word.end,
          segmentId: segment?.id || 'unknown',
        };
      });
      
      setOriginalTranscriptWords(transcriptWords);
      setOriginalTranscriptPlain(transcript.words.map(w => w.word).join(' '));
    }
  }, [transcript.words, analyzedSegments]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Load FFmpeg engine on mount
  useEffect(() => {
    loadEngine();
  }, [loadEngine]);

  // Restore uploaded file from localStorage
  useEffect(() => {
    const storedFile = localStorage.getItem('monoframe_uploaded_file');
    if (storedFile) {
      try {
        const fileData = JSON.parse(storedFile);
        // Reconstruct File object (note: this is a mock, real file data is in IndexedDB)
        const file = new File([], fileData.name, { type: fileData.type });
        setUploadedFile(file);
      } catch (error) {
        console.error('Failed to restore uploaded file:', error);
      }
    }
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeFromPercent = (percent: number): string => {
    return formatTime((percent / 100) * duration);
  };

  const seekToPercent = (percent: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = (percent / 100) * duration;
  };

  const seekAndHighlightCut = (id: string, percent: number) => {
    seekToPercent(percent);
    setActiveCutId(id);
    setTimeout(() => setActiveCutId(null), 2000);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const timeline = timelineRef.current;
    const video = videoRef.current;
    if (!timeline || !video) return;

    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    video.currentTime = newTime;
  };

  const getTrackedObjectPosition = (obj: typeof trackedObjects[0]) => {
    const t = (currentTime / duration) * Math.PI * 2 * obj.frequency;
    return {
      x: obj.basePosition.x + Math.sin(t) * obj.amplitude,
      y: obj.basePosition.y + Math.cos(t) * obj.amplitude,
    };
  };

  // Timeline Editor Handlers
  const handleReorder = useCallback((newSegments: TimelineSegment[]) => {
    setTimelineSegments(newSegments);
  }, []);

  const handleDelete = useCallback((segmentId: string) => {
    setTimelineSegments((prev) => prev.filter((seg) => seg.id !== segmentId));
  }, []);

  const handleMerge = useCallback((segmentId1: string, segmentId2: string) => {
    setTimelineSegments((prev) => {
      const seg1 = prev.find((s) => s.id === segmentId1);
      const seg2 = prev.find((s) => s.id === segmentId2);
      
      if (!seg1 || !seg2) return prev;
      
      const mergedSegment: TimelineSegment = {
        id: `${segmentId1}_${segmentId2}`,
        startTime: Math.min(seg1.startTime, seg2.startTime),
        endTime: Math.max(seg1.endTime, seg2.endTime),
        label: `${seg1.label} + ${seg2.label}`,
        aiLabel: seg1.aiLabel,
      };
      
      return prev.filter((s) => s.id !== segmentId1 && s.id !== segmentId2).concat(mergedSegment).sort((a, b) => a.startTime - b.startTime);
    });
  }, []);

  const handleTrim = useCallback((segmentId: string, newStart: number, newEnd: number) => {
    setTimelineSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId
          ? { ...seg, startTime: newStart, endTime: newEnd }
          : seg
      )
    );
  }, []);

  const handleReset = useCallback(() => {
    setTimelineSegments([...originalSegments]);
  }, [originalSegments]);

  // Smart Cut Handlers
  const handleGenerateSmartEdit = () => {
    const smartEditSegments = generateSmartEdit(analyzedSegments, audioAnalysis, smartEditTargetDuration);
    const stats = calculateSmartEditStats(smartEditSegments);
    
    const newTimelineSegments: TimelineSegment[] = smartEditSegments.map((seg) => ({
      id: seg.id,
      startTime: seg.startTime,
      endTime: seg.endTime,
      label: seg.label,
      aiLabel: seg.aiLabel,
    }));
    
    setSmartEditStats(stats);
    setTimelineSegments(newTimelineSegments);
    setSmartEditActive(true);
    
    // Deactivate other modes
    setDirectorsCutActive(false);
    setDirectorsCutStats(null);
    setScriptReeditActive(false);
    setScriptReeditStats(null);
  };

  const handleResetSmartEdit = () => {
    setTimelineSegments([...originalSegments]);
    setSmartEditActive(false);
    setSmartEditStats(null);
    setScriptReeditActive(false);
    setScriptReeditStats(null);
  };

  // Director's Cut Handlers
  const handleGenerateDirectorsCut = async () => {
    const classifiedSegments = await classifyAllScenes(analyzedSegments, audioAnalysis);
    const storylineResult = buildStoryline(classifiedSegments, directorsCutTargetDuration);
    const storyFlow = generateStoryFlowDescription(storylineResult);
    
    const newTimelineSegments: TimelineSegment[] = storylineResult.segments.map((seg) => ({
      id: seg.id,
      startTime: seg.startTime,
      endTime: seg.endTime,
      label: seg.label,
      aiLabel: seg.aiLabel,
    }));
    
    setDirectorsCutStoryFlow(storyFlow);
    setDirectorsCutStats({
      segmentCount: storylineResult.segments.length,
      totalDuration: storylineResult.totalDuration,
      avgConfidence: storylineResult.stats.avgConfidence,
      hookPresent: storylineResult.stats.hookPresent,
      climaxPresent: storylineResult.stats.climaxPresent,
      outroPresent: storylineResult.stats.outroPresent,
    });
    
    setTimelineSegments(newTimelineSegments);
    setDirectorsCutActive(true);
    
    // Deactivate other modes
    setSmartEditActive(false);
    setSmartEditStats(null);
    setScriptReeditActive(false);
    setScriptReeditStats(null);
  };

  const handleResetDirectorsCut = () => {
    setTimelineSegments([...originalSegments]);
    setDirectorsCutActive(false);
    setDirectorsCutStats(null);
    setDirectorsCutStoryFlow('');
    setScriptReeditActive(false);
    setScriptReeditStats(null);
  };

  // Session management handlers
  const handleSaveCurrentEdit = async () => {
    if (timelineSegments.length === 0) {
      alert('No timeline to save. Please create an edit first.');
      return;
    }

    setIsSavingSession(true);

    try {
      let mode: EditMode = 'full';
      let targetDuration: number | undefined;
      
      if (directorsCutActive) {
        mode = 'directors-cut';
        targetDuration = directorsCutTargetDuration;
      } else if (smartEditActive) {
        mode = 'smart-cut';
        targetDuration = smartEditTargetDuration;
      }

      let label = '';
      if (mode === 'directors-cut') {
        label = `Director's Cut — ${targetDuration}s`;
      } else if (mode === 'smart-cut') {
        label = `Smart Cut — ${targetDuration}s`;
      } else {
        label = `Full Timeline — ${analyzedSegments.length} segments`;
      }

      const sessionId = currentSessionId || generateSessionId();
      const now = new Date().toISOString();

      const session: MonoFrameEditSession = {
        id: sessionId,
        createdAt: currentSessionId ? (getSessionById(sessionId)?.createdAt || now) : now,
        updatedAt: now,
        label,
        sourceFileName: uploadedFile?.name,
        sourceDuration: duration,
        mode,
        targetDurationSeconds: targetDuration,
        timelineSegments: timelineSegments.map((seg) => ({
          id: seg.id,
          startTime: seg.startTime,
          endTime: seg.endTime,
          label: seg.label,
          aiLabel: seg.aiLabel,
        })),
        analysis: {
          cuts: detectedCuts,
          scenes: analyzedSegments,
          audio: audioAnalysis,
        },
        meta: {
          smartCutStats: smartEditStats || undefined,
          directorsCutStats: directorsCutStats || undefined,
          directorsCutStoryFlow: directorsCutStoryFlow || undefined,
        },
        voiceover: voiceoverState ? {
          mode: voiceoverMode,
          voiceProfileId: activeVoiceId,
          speed: voiceoverState.speed,
          generatedAt: voiceoverState.generatedAt,
          segmentCount: voiceoverState.segments.length,
        } : undefined,
      };

      saveSession(session);
      setCurrentSessionId(sessionId);
      
      setTimeout(() => {
        setIsSavingSession(false);
      }, 500);
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('Failed to save edit. Please try again.');
      setIsSavingSession(false);
    }
  };

  const handleLoadSession = (sessionId: string) => {
    const session = getSessionById(sessionId);
    
    if (!session) {
      alert('Session not found. It may have been deleted.');
      return;
    }

    try {
      setTimelineSegments(session.timelineSegments);
      setOriginalSegments(session.timelineSegments);
      
      if (session.mode === 'smart-cut') {
        setSmartEditActive(true);
        setSmartEditTargetDuration(session.targetDurationSeconds || 60);
        setSmartEditStats(session.meta?.smartCutStats || null);
        setDirectorsCutActive(false);
        setDirectorsCutStats(null);
      } else if (session.mode === 'directors-cut') {
        setDirectorsCutActive(true);
        setDirectorsCutTargetDuration(session.targetDurationSeconds || 90);
        setDirectorsCutStats(session.meta?.directorsCutStats || null);
        setDirectorsCutStoryFlow(session.meta?.directorsCutStoryFlow || '');
        setSmartEditActive(false);
        setSmartEditStats(null);
      } else {
        setSmartEditActive(false);
        setSmartEditStats(null);
        setDirectorsCutActive(false);
        setDirectorsCutStats(null);
        setDirectorsCutStoryFlow('');
      }
      
      if (session.voiceover) {
        setVoiceoverMode(session.voiceover.mode);
        setActiveVoiceId(session.voiceover.voiceProfileId);
        setVoiceoverState(null);
        console.log('[Session] Voiceover settings restored. Regenerate voiceover to hear it.');
      } else {
        setVoiceoverMode('original');
        setActiveVoiceId('neutral_narrator');
        setVoiceoverState(null);
      }
      
      setCurrentSessionId(session.id);
      console.log(`Loaded session: ${session.label}`);
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Failed to load edit. Please try again.');
    }
  };

  // Script Cut handler
  const handleGenerateScriptCut = (_selectedWordIndices: number[]) => {
    // Script Cut feature available but not displayed in compact UI
    console.log('Script Cut feature - use Transcript panel for text-based editing');
  };
  
  // Script Re-Edit handler
  const handleScriptApply = (editedText: string) => {
    if (!originalTranscriptWords || !originalTranscriptPlain) {
      alert('Original transcript not available. Please try re-uploading the video.');
      return;
    }
    
    // Backup current timeline before applying script re-edit
    if (!scriptReeditActive) {
      setTimelineBeforeScriptReedit([...timelineSegments]);
    }
    
    try {
      // 1. Compute diff operations
      const ops = diffTranscript(originalTranscriptWords, editedText);
      
      if (ops.length === 0) {
        alert('No meaningful script changes detected.');
        return;
      }
      
      // 2. Apply to timeline
      const result = applyScriptEditsToTimeline(
        timelineSegments,
        originalTranscriptWords,
        ops,
        { enableInsertAudioSegments: true }
      );
      
      // 3. Update state
      setTimelineSegments(result.timeline);
      setScriptReeditActive(true);
      setScriptReeditStats({
        operationsCount: ops.length,
        removedCount: ops.filter(o => o.type === 'delete').length,
        insertedCount: ops.filter(o => o.type === 'insert').length,
        replacedCount: ops.filter(o => o.type === 'replace').length,
        reorderedCount: ops.filter(o => o.type === 'reorder').length,
      });
      
      // Deactivate other modes
      setSmartEditActive(false);
      setSmartEditStats(null);
      setDirectorsCutActive(false);
      setDirectorsCutStats(null);
      setDirectorsCutStoryFlow('');
      
      console.log('[Script Re-Edit] Applied', ops.length, 'operations');
      console.log('[Script Re-Edit] Timeline segments:', result.timeline.length);
      
    } catch (error) {
      console.error('[Script Re-Edit] Failed to apply:', error);
      alert(`Failed to apply script changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Reset script re-edit
  const handleResetScriptReedit = () => {
    if (timelineBeforeScriptReedit.length > 0) {
      setTimelineSegments([...timelineBeforeScriptReedit]);
    } else {
      setTimelineSegments([...originalSegments]);
    }
    setScriptReeditActive(false);
    setScriptReeditStats(null);
    setTimelineBeforeScriptReedit([]);
  };

  // Export handlers
  const handleStartExport = async (_preset: string) => {
    setShowExportModal(false);
    
    if (!isFfmpegLoaded) {
      alert('FFmpeg engine is not loaded yet. Please wait...');
      return;
    }
    
    if (!uploadedFile) {
      console.error('No video file available');
      alert('No video file available for export.');
      return;
    }
    
    setShowExportProgress(true);
    setShowFfmpegLogs(true);
    
    try {
      const validSegments: VideoSegment[] = timelineSegments
        .filter((seg) => {
          const segDuration = seg.endTime - seg.startTime;
          return segDuration >= 0.5 && seg.startTime >= 0 && seg.endTime <= duration;
        })
        .map((seg) => ({
          startTime: seg.startTime,
          endTime: seg.endTime,
          clipId: seg.id,
        }));
      
      if (validSegments.length === 0) {
        alert('No valid segments to export. Segments must be at least 0.5s long.');
        return;
      }
      
      // Phase 20: Prepare voiceover options if active
      const voiceoverOptions = 
        voiceoverMode !== 'original' && voiceoverState 
          ? {
              mode: voiceoverMode,
              segments: voiceoverState.segments,
            }
          : undefined;
      
      const exportedBlob = await exportTimelineMulti(
        uploadedFile,
        validSegments,
        voiceoverOptions
      );
      
      if (exportedBlob) {
        const url = URL.createObjectURL(exportedBlob);
        const filesizeMB = (exportedBlob.size / 1024 / 1024).toFixed(2);
        
        const newExport = {
          id: `export-${Date.now()}`,
          name: `MonoFrame_AI_Edit_${new Date().toISOString().split('T')[0]}.mp4`,
          format: 'MP4',
          resolution: '1920×1080',
          filesize: `${filesizeMB}MB`,
          url,
          timestamp: new Date(),
        };
        
        setExportedFiles((prev) => [newExport, ...prev]);
        localStorage.setItem('monoframe_last_export_blob', url);
      } else {
        alert('Export failed. Check the console for details.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setShowExportProgress(false);
    }
  };

  const handleExportComplete = () => {
    setShowExportProgress(false);
  };

  const handleDownload = (exportFile: typeof exportedFiles[0]) => {
    const a = document.createElement('a');
    a.href = exportFile.url;
    a.download = exportFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Share handler
  const handleShareEdit = () => {
    if (!videoUrl) return;
    
    setIsCreatingShare(true);
    
    try {
      const share = createDemoShare({
        videoUrl,
        title: 'MonoFrame AI Edit',
        description: 'Cinematic edit generated with MonoFrame AI',
      });
      
      window.open(`/share/${share.id}`, '_blank');
    } catch (error) {
      console.error('Share creation failed:', error);
    } finally {
      setIsCreatingShare(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Analysis Complete</h1>
              <p className="text-sm text-white/50 mt-1">
                {analyzedSegments.length} segments • {formatTime(duration)}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShareEdit}
                disabled={!videoUrl || isCreatingShare}
                className="px-4 py-2 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-all disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  <span>{isCreatingShare ? 'Creating...' : 'Share'}</span>
                </div>
              </button>
              
              <button
                onClick={() => setShowExportModal(true)}
                disabled={!isFfmpegLoaded || isFfmpegProcessing}
                className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-all disabled:opacity-50"
              >
                {!isFfmpegLoaded ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Loading...
                  </>
                ) : isFfmpegProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 inline mr-2" />
                    Export AI Edit
                  </>
                )}
              </button>
              
              <button
                onClick={onReset}
                className="px-4 py-2 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Upload New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6 space-y-6">
        {/* Video Player - Prominent, Full Width */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            <video
              ref={videoRef}
              src={videoUrl}
              className={`w-full aspect-video bg-black ${
                isBeforeMode ? 'grayscale brightness-90' : 'contrast-105 saturate-110'
              }`}
            />
            
            {/* Motion Tracking Overlays */}
            {!isBeforeMode && duration > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {trackedObjects.map((obj) => {
                  const pos = getTrackedObjectPosition(obj);
                  return (
                    <div
                      key={obj.id}
                      className="absolute border border-white/70 bg-black/25 rounded"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: `${obj.size.w}%`,
                        height: `${obj.size.h}%`,
                      }}
                    >
                      <span className="absolute top-1 left-1 text-[10px] text-white/90 font-mono">
                        {obj.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Attention Heatmap Ribbon */}
            <div className="relative h-2 bg-gradient-to-r from-white/10 via-white/30 to-white/10">
              {attentionSegments.map((segment) => (
                <div
                  key={segment.id}
                  className="absolute top-0 h-full bg-white/40 hover:bg-white/60 cursor-pointer transition-all group"
                  style={{
                    left: `${segment.startPercent}%`,
                    width: `${segment.endPercent - segment.startPercent}%`,
                    opacity: segment.intensity,
                  }}
                  onClick={() => seekToPercent(segment.startPercent)}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[10px] text-white/80 whitespace-nowrap bg-black/60 px-2 py-1 rounded">
                      {segment.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <div className="space-y-2">
                {/* Timeline with Cut Markers */}
                <div className="relative">
                  <div className="absolute -top-3 left-0 right-0 h-3 flex items-end">
                    {cutMarkers.map((cut) => (
                      <div
                        key={cut.id}
                        className="absolute bottom-0 group cursor-pointer"
                        style={{ left: `${cut.time}%` }}
                        onClick={() => seekAndHighlightCut(cut.id, cut.time)}
                      >
                        <div
                          className={`w-0.5 bg-white/60 transition-all ${
                            activeCutId === cut.id ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''
                          }`}
                          style={{ height: `${8 + cut.intensity * 8}px` }}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-[10px] text-white/80 whitespace-nowrap bg-black/60 px-2 py-1 rounded">
                            {cut.label} • {formatTimeFromPercent(cut.time)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    ref={timelineRef}
                    className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group"
                    onClick={handleTimelineClick}
                    onMouseDown={(e) => {
                      setIsDraggingScrubber(true);
                      const handleMove = (moveEvent: MouseEvent) => {
                        if (!timelineRef.current || !videoRef.current) return;
                        const rect = timelineRef.current.getBoundingClientRect();
                        const x = moveEvent.clientX - rect.left;
                        const percentage = Math.max(0, Math.min(1, x / rect.width));
                        const newTime = percentage * duration;
                        videoRef.current.currentTime = newTime;
                      };
                      const handleUp = () => {
                        setIsDraggingScrubber(false);
                        document.removeEventListener('mousemove', handleMove);
                        document.removeEventListener('mouseup', handleUp);
                      };
                      document.addEventListener('mousemove', handleMove);
                      document.addEventListener('mouseup', handleUp);
                      handleTimelineClick(e);
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-white rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg ${
                        isDraggingScrubber ? 'scale-125' : 'group-hover:scale-110'
                      }`}
                      style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-6px' }}
                    />
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </button>
                    <span className="text-white/70 text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsBeforeMode(!isBeforeMode)}
                    className="px-3 py-1.5 text-xs border border-white/20 text-white/70 hover:text-white rounded transition-all"
                  >
                    {isBeforeMode ? 'Show After' : 'Show Before'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Timeline Editor */}
        <div className="sticky top-[73px] z-40 bg-[#0a0a0a] py-4 border-y border-white/10">
          {timelineSegments.length > 0 && (
            <TimelineEditor
              segments={timelineSegments}
              duration={duration}
              currentTime={currentTime}
              videoElement={videoRef.current}
              audioAnalysis={audioAnalysis}
              onReorder={handleReorder}
              onDelete={handleDelete}
              onMerge={handleMerge}
              onTrim={handleTrim}
              onReset={handleReset}
              onSegmentClick={(segment) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = segment.startTime;
                }
              }}
            />
          )}
        </div>

        {/* 2-Column Grid: Clips Sidebar + Tabbed Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* LEFT: Clips Sidebar (Scrollable) */}
          <div>
            <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-4 h-4 text-white/60" />
                <h3 className="text-sm font-semibold text-white">AI Cut Sheet</h3>
                <span className="ml-auto text-xs text-white/40">{segmentList.length} segments</span>
              </div>
              
              {/* Scrollable Clips List with Custom Scrollbar */}
              <div className="w-full max-h-[400px] overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                {segmentList.map((segment) => (
                  <div
                    key={segment.id}
                    className="bg-white/5 rounded border border-white/10 p-3 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
                    onClick={() => seekAndHighlightCut(segment.id, segment.startPercent)}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
                        {segment.label}
                      </h4>
                      <span className="text-[10px] text-white/50 font-mono">
                        {formatTimeFromPercent(segment.startPercent)}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed">
                      {segment.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Tabbed Content */}
          <div>
            <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex gap-1 border-b border-white/10 px-4 pt-4">
                <button
                  onClick={() => setActiveAnalysisTab('analysis')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                    activeAnalysisTab === 'analysis'
                      ? 'border-white text-white'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>AI Analysis</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('cuts')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                    activeAnalysisTab === 'cuts'
                      ? 'border-white text-white'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span>Scene Intelligence</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('attention')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                    activeAnalysisTab === 'attention'
                      ? 'border-white text-white'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>Attention</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('motion')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                    activeAnalysisTab === 'motion'
                      ? 'border-white text-white'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    <span>Motion</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* AI Analysis Tab */}
                {activeAnalysisTab === 'analysis' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Timeline Analysis</h3>
                      <div className="h-48 bg-white/5 rounded-lg border border-white/10 p-4 flex items-end justify-around gap-2">
                        {sceneBars.map((bar, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-white/20 rounded-t hover:bg-white/30 transition-all cursor-pointer relative group"
                            style={{ height: `${bar.height}px` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-white/60 whitespace-nowrap">
                                Scene {i + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-white/60" />
                        AI Optimization Tips
                      </h3>
                      <div className="space-y-2">
                        {selectedSuggestions.map((suggestion, i) => (
                          <div
                            key={i}
                            className="bg-white/5 rounded border border-white/10 p-4 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
                          >
                            <div className="flex items-start gap-3">
                              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-white/80 group-hover:text-white transition-colors">
                                {suggestion}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scene Intelligence Tab */}
                {activeAnalysisTab === 'cuts' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">AI Scene Intelligence</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {analyzedSegments.map((segment, i) => (
                        <div
                          key={i}
                          className="p-4 bg-white/5 rounded border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = segment.startTime;
                            }
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-semibold text-white">
                                {segment.aiLabel?.title || segment.label}
                              </h4>
                              <p className="text-xs text-white/60 mt-1">
                                {segment.aiLabel?.description || 'No description'}
                              </p>
                            </div>
                            {segment.aiLabel?.emotion && (
                              <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                                {segment.aiLabel.emotion}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <span>{segment.startTime.toFixed(1)}s – {segment.endTime.toFixed(1)}s</span>
                            {segment.aiLabel?.subject && (
                              <>
                                <span>•</span>
                                <span>{segment.aiLabel.subject}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attention Heatmap Tab */}
                {activeAnalysisTab === 'attention' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Attention Heatmap</h3>
                    <div className="space-y-3">
                      {attentionSegments.map((segment) => (
                        <div
                          key={segment.id}
                          className="p-4 bg-white/5 rounded border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer"
                          onClick={() => seekToPercent(segment.startPercent)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-white">{segment.label}</h4>
                            <span className="text-xs text-white/50 font-mono">
                              {formatTimeFromPercent(segment.startPercent)} – {formatTimeFromPercent(segment.endPercent)}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500/60 to-purple-500/60"
                              style={{ width: `${segment.intensity * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motion Tracking Tab */}
                {activeAnalysisTab === 'motion' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Motion Tracking</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-white/5 rounded border border-white/10 text-center">
                        <div className="text-3xl font-bold text-white mb-1">{trackedObjects.length}</div>
                        <div className="text-xs text-white/50">Tracked Objects</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded border border-white/10 text-center">
                        <div className="text-3xl font-bold text-white mb-1">{cutMarkers.length}</div>
                        <div className="text-xs text-white/50">Cut Markers</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {trackedObjects.map((obj) => (
                        <div
                          key={obj.id}
                          className="p-3 bg-white/5 rounded border border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">{obj.label}</span>
                            <span className="text-xs text-white/50">
                              {obj.basePosition.x.toFixed(0)}%, {obj.basePosition.y.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Panels (Smart Cut, Director's Cut, Transcript, Voiceover, Saved) */}
            <div className="mt-6 space-y-6">
              {/* Smart Cut */}
              <div className="border border-white/10 bg-white/[0.02] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Smart Cut (AI Auto Edit)</h3>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  {[30, 60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setSmartEditTargetDuration(dur)}
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

                <button
                  onClick={handleGenerateSmartEdit}
                  className="w-full px-4 py-3 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg font-medium hover:bg-purple-500/30 transition-all mb-4"
                >
                  Generate Smart Cut
                </button>

                {smartEditActive && smartEditStats && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-green-400">✓ Smart Cut Active</span>
                      <button
                        onClick={handleResetSmartEdit}
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
                  <h3 className="text-lg font-semibold text-white">Director&apos;s Cut (AI Story Edit)</h3>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  {[60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setDirectorsCutTargetDuration(dur)}
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

                <button
                  onClick={handleGenerateDirectorsCut}
                  className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg font-medium hover:bg-blue-500/30 transition-all mb-4"
                >
                  Generate Director&apos;s Cut
                </button>

                {directorsCutActive && directorsCutStats && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-green-400">✓ Director&apos;s Cut Active</span>
                      <button
                        onClick={handleResetDirectorsCut}
                        className="px-2 py-1 text-xs border border-white/20 text-white hover:bg-white/10 rounded transition-all flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>
                    
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
                  </div>
                )}
              </div>

              {/* Script Re-Edit Status */}
              {scriptReeditActive && scriptReeditStats && (
                <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileEdit className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-semibold text-white">Script Re-Edit Active</h3>
                    </div>
                    <button
                      onClick={handleResetScriptReedit}
                      className="px-3 py-1.5 text-sm border border-white/20 text-white hover:bg-white/10 rounded transition-all flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset to Original
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3 text-center text-sm">
                    <div>
                      <div className="text-xl font-bold text-white">{scriptReeditStats.operationsCount}</div>
                      <div className="text-xs text-white/50">Total Ops</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-red-400">{scriptReeditStats.removedCount}</div>
                      <div className="text-xs text-white/50">Removed</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-400">{scriptReeditStats.insertedCount}</div>
                      <div className="text-xs text-white/50">Inserted</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-400">{scriptReeditStats.replacedCount}</div>
                      <div className="text-xs text-white/50">Replaced</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-purple-400">{scriptReeditStats.reorderedCount}</div>
                      <div className="text-xs text-white/50">Reordered</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                      <div className="text-lg font-bold text-white">{timelineSegments.length}</div>
                      <div className="text-xs text-white/50">Current Segments</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">
                        {timelineSegments.reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0).toFixed(1)}s
                      </div>
                      <div className="text-xs text-white/50">Total Duration</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transcript Panel */}
              <TranscriptPanel
                transcript={transcript}
                alignedTranscript={alignedTranscript}
                currentTime={currentTime}
                onSeekTo={(time) => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = time;
                  }
                }}
                onGenerateScriptCut={handleGenerateScriptCut}
                onScriptApply={handleScriptApply}
                originalPlainText={originalTranscriptPlain || undefined}
              />

              {/* Voiceover Panel */}
              <VoiceoverPanel
                segments={analyzedSegments}
                transcript={alignedTranscript.length > 0 ? alignedTranscript : null}
                activeVoiceId={activeVoiceId}
                onVoiceChange={setActiveVoiceId}
                mode={voiceoverMode}
                onModeChange={setVoiceoverMode}
                onApplyVoiceover={(state: VoiceoverState) => {
                  setVoiceoverState(state);
                  console.log('[Voiceover] Applied:', state);
                }}
              />

              {/* Saved Edits Panel */}
              <SavedEditsPanel
                currentSessionMeta={
                  directorsCutActive ? {
                    mode: 'directors-cut',
                    targetDurationSeconds: directorsCutTargetDuration,
                  } : smartEditActive ? {
                    mode: 'smart-cut',
                    targetDurationSeconds: smartEditTargetDuration,
                  } : {
                    mode: 'full',
                  }
                }
                onLoadSession={handleLoadSession}
                onSaveCurrent={handleSaveCurrentEdit}
                isSaving={isSavingSession}
              />
            </div>
          </div>
        </div>

        {/* FFmpeg Export Progress */}
        {(isFfmpegProcessing || showFfmpegLogs) && (
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                {isFfmpegProcessing && <Loader2 className="w-5 h-5 text-white/60 animate-spin" />}
                <h2 className="text-xl font-semibold text-white">
                  {isFfmpegProcessing ? 'Exporting with FFmpeg...' : 'Export Complete'}
                </h2>
              </div>
              <button
                onClick={() => setShowFfmpegLogs(!showFfmpegLogs)}
                className="text-xs text-white/60 hover:text-white/80 transition-colors"
              >
                {showFfmpegLogs ? 'Hide Logs' : 'Show Logs'}
              </button>
            </div>
            
            {isFfmpegProcessing && (
              <div className="mb-6 space-y-4">
                {ffmpegProgress.totalSegments && ffmpegProgress.currentSegment !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">
                        Current Segment: {ffmpegProgress.currentSegment}/{ffmpegProgress.totalSegments}
                      </span>
                      <span className="text-xs text-white/50 font-mono">
                        Segment {ffmpegProgress.currentSegment}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500/60 to-blue-500/90 transition-all duration-300 ease-out"
                        style={{
                          width: `${((ffmpegProgress.currentSegment || 0) / (ffmpegProgress.totalSegments || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">{ffmpegProgress.message}</span>
                    <span className="text-xs text-white/50 font-mono">
                      {Math.round(ffmpegProgress.progress * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-white/60 to-white/90 transition-all duration-300 ease-out"
                      style={{ width: `${ffmpegProgress.progress * 100}%` }}
                    />
                  </div>
                  {ffmpegProgress.estimatedTime && (
                    <p className="text-xs text-white/40 mt-2">
                      Estimated time: ~{ffmpegProgress.estimatedTime}s
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {showFfmpegLogs && (
              <div className="bg-black/50 border border-white/10 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs text-white/70 space-y-1">
                {ffmpegProgress.logs.length === 0 ? (
                  <p className="text-white/40">No logs yet...</p>
                ) : (
                  ffmpegProgress.logs.map((log, i) => (
                    <div key={i} className="hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                      {log}
                    </div>
                  ))
                )}
              </div>
            )}
            
            {!isFfmpegProcessing && ffmpegProgress.stage === 'done' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-green-400 font-semibold">
                  ✅ {ffmpegProgress.message}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  Your video has been exported successfully!
                </p>
              </div>
            )}
            
            {!isFfmpegProcessing && ffmpegProgress.stage === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                <p className="text-red-400 font-semibold">
                  ❌ {ffmpegProgress.message}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  Please try again or check the logs above.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Previous Exports */}
        {exportedFiles.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileVideo className="w-5 h-5 text-white/60" />
              <h2 className="text-xl font-semibold text-white">
                Previous Exports
              </h2>
            </div>
            <div className="space-y-3">
              {exportedFiles.map((exportFile) => (
                <div
                  key={exportFile.id}
                  className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/[0.07] hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {exportFile.name}
                      </h3>
                      <p className="text-xs text-white/50">
                        {exportFile.format} • {exportFile.resolution} • {exportFile.filesize} • {exportFile.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(exportFile)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onStartExport={handleStartExport}
      />

      {showExportProgress && (
        <ExportProgress onComplete={handleExportComplete} />
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Save, Trash2, RefreshCw, Clock, Film } from 'lucide-react';
import {
  getAllSessions,
  deleteSession,
  clearAllSessions,
  formatRelativeTime,
  getModeDisplayName,
  type MonoFrameEditSession,
  type EditMode,
} from '@/lib/editorSessionStore';

interface SavedEditsPanelProps {
  currentSessionMeta?: {
    mode: EditMode;
    targetDurationSeconds?: number;
  };
  onLoadSession: (sessionId: string) => void;
  onSaveCurrent: () => void;
  isSaving: boolean;
  className?: string;
}

export default function SavedEditsPanel({
  currentSessionMeta,
  onLoadSession,
  onSaveCurrent,
  isSaving,
  className = '',
}: SavedEditsPanelProps) {
  const [sessions, setSessions] = useState<MonoFrameEditSession[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // SSR-safe mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load sessions on mount and when save/delete happens
  const refreshSessions = () => {
    if (isMounted) {
      setSessions(getAllSessions());
    }
  };

  useEffect(() => {
    refreshSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // Refresh after saving completes
  useEffect(() => {
    if (!isSaving) {
      refreshSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaving]);

  const handleDelete = (sessionId: string, sessionLabel: string) => {
    if (confirm(`Delete "${sessionLabel}"?`)) {
      deleteSession(sessionId);
      refreshSessions();
    }
  };

  const handleClearAll = () => {
    if (sessions.length === 0) return;
    
    if (confirm(`Delete all ${sessions.length} saved edits? This cannot be undone.`)) {
      clearAllSessions();
      refreshSessions();
    }
  };

  if (!isMounted) {
    return null; // Prevent SSR hydration mismatch
  }

  return (
    <div className={`rounded-xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Save className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">
            Saved Edits
          </h2>
        </div>
        
        {/* Clear All Button */}
        {sessions.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-white/40 hover:text-red-400 transition-colors flex items-center space-x-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Save Current Button */}
      <button
        onClick={onSaveCurrent}
        disabled={isSaving}
        className="w-full mb-6 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save Current Edit</span>
          </>
        )}
      </button>

      {/* Current Session Info */}
      {currentSessionMeta && (
        <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs text-white/60 mb-1">Current Edit:</p>
          <p className="text-sm text-white">
            {getModeDisplayName(currentSessionMeta.mode)}
            {currentSessionMeta.targetDurationSeconds && (
              <span className="text-white/70"> • {currentSessionMeta.targetDurationSeconds}s</span>
            )}
          </p>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/50 mb-2">No saved edits yet</p>
            <p className="text-xs text-white/40">
              Create an edit and save it here for later
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="group relative bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-lg p-4 transition-all"
            >
              {/* Session Info */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate mb-1">
                    {session.label}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-white/60">
                    <span className="flex items-center space-x-1">
                      <Film className="w-3 h-3" />
                      <span>{getModeDisplayName(session.mode)}</span>
                    </span>
                    {session.targetDurationSeconds && (
                      <>
                        <span className="text-white/30">•</span>
                        <span>{session.targetDurationSeconds}s</span>
                      </>
                    )}
                    <span className="text-white/30">•</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded">
                      {session.timelineSegments.length} segments
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center space-x-1 text-xs text-white/40 mb-3">
                <Clock className="w-3 h-3" />
                <span>Updated {formatRelativeTime(session.updatedAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onLoadSession(session.id)}
                  className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white text-xs font-medium rounded transition-all"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(session.id, session.label)}
                  className="px-3 py-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-xs rounded transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Storage Info (if sessions exist) */}
      {sessions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 text-center">
            {sessions.length} saved edit{sessions.length !== 1 ? 's' : ''} • Stored locally
          </p>
        </div>
      )}
    </div>
  );
}


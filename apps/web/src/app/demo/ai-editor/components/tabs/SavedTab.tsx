"use client";

/**
 * Saved Tab Content
 * Wraps SavedEditsPanel
 */

import SavedEditsPanel from '../SavedEditsPanel';

interface SavedTabProps {
  currentSessionMeta: {
    mode: 'full' | 'smart-cut' | 'directors-cut';
    targetDurationSeconds?: number;
  };
  onLoadSession: (sessionId: string) => void;
  onSaveCurrent: () => void;
  isSaving: boolean;
}

export function SavedTab({
  currentSessionMeta,
  onLoadSession,
  onSaveCurrent,
  isSaving,
}: SavedTabProps) {
  return (
    <SavedEditsPanel
      currentSessionMeta={currentSessionMeta}
      onLoadSession={onLoadSession}
      onSaveCurrent={onSaveCurrent}
      isSaving={isSaving}
    />
  );
}


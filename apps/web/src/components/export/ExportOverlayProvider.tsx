'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { setExportOverlayFunctions } from '@/lib/exporter';
import ExportOverlay from './ExportOverlay';

interface ExportOverlayContextType {
  isVisible: boolean;
  message: string;
  showExportOverlay: (message: string) => void;
  updateExportOverlay: (message: string) => void;
  hideExportOverlay: () => void;
}

const ExportOverlayContext = createContext<ExportOverlayContextType | null>(null);

export function ExportOverlayProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showExportOverlay = useCallback((msg: string) => {
    setMessage(msg);
    setIsVisible(true);
  }, []);

  const updateExportOverlay = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const hideExportOverlay = useCallback(() => {
    setIsVisible(false);
    // Clear message after fade-out animation
    setTimeout(() => setMessage(''), 300);
  }, []);

  const value = useMemo(
    () => ({
      isVisible,
      message,
      showExportOverlay,
      updateExportOverlay,
      hideExportOverlay,
    }),
    [isVisible, message, showExportOverlay, updateExportOverlay, hideExportOverlay]
  );

  // Register overlay functions with exporter on mount
  useEffect(() => {
    setExportOverlayFunctions(showExportOverlay, updateExportOverlay, hideExportOverlay);
  }, [showExportOverlay, updateExportOverlay, hideExportOverlay]);

  return (
    <ExportOverlayContext.Provider value={value}>
      {children}
      <ExportOverlay />
    </ExportOverlayContext.Provider>
  );
}

export function useExportOverlay() {
  const context = useContext(ExportOverlayContext);
  if (!context) {
    throw new Error('useExportOverlay must be used within ExportOverlayProvider');
  }
  return context;
}

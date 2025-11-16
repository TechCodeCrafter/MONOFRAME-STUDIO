'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import CommandPalette from './CommandPalette';

interface CommandPaletteContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  query: string;
  setQuery: (q: string) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  // Global keyboard listener
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // ⌘K or Ctrl+K to open
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      }
      // Escape to close
      if (event.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, close]);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle, query, setQuery }),
    [isOpen, open, close, toggle, query]
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return context;
}

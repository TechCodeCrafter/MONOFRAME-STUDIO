'use client';

import { CommandPaletteProvider } from '@/components/command-palette/CommandPaletteProvider';
import { ExportOverlayProvider } from '@/components/export/ExportOverlayProvider';
import AppHeader from '@/components/layout/AppHeader';

/**
 * Client-side providers wrapper
 * This component wraps all global providers (Command Palette, Export Overlay, etc.)
 * and renders the global AppHeader on all pages
 * Must be a client component to avoid server/client boundary violations
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ExportOverlayProvider>
      <CommandPaletteProvider>
        <AppHeader />
        {children}
      </CommandPaletteProvider>
    </ExportOverlayProvider>
  );
}

import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseFullscreenReturn {
  isFullscreen: boolean;
  isSupported: boolean;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
}

/**
 * useFullscreen - Custom hook for managing fullscreen state
 * Handles browser compatibility and provides a clean API
 */
export function useFullscreen(elementRef: RefObject<HTMLElement>): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check if Fullscreen API is supported
  useEffect(() => {
    const supported =
      document.fullscreenEnabled ||
      // @ts-ignore - webkit prefix
      document.webkitFullscreenEnabled ||
      // @ts-ignore - moz prefix
      document.mozFullScreenEnabled ||
      false;

    setIsSupported(supported);
  }, []);

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
    if (!elementRef.current || !isSupported) return;

    try {
      if (elementRef.current.requestFullscreen) {
        await elementRef.current.requestFullscreen();
        // @ts-ignore - webkit prefix
      } else if (elementRef.current.webkitRequestFullscreen) {
        // @ts-ignore
        await elementRef.current.webkitRequestFullscreen();
        // @ts-ignore - moz prefix
      } else if (elementRef.current.mozRequestFullScreen) {
        // @ts-ignore
        await elementRef.current.mozRequestFullScreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, [elementRef, isSupported]);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        // @ts-ignore - webkit prefix
      } else if (document.webkitExitFullscreen) {
        // @ts-ignore
        await document.webkitExitFullscreen();
        // @ts-ignore - moz prefix
      } else if (document.mozCancelFullScreen) {
        // @ts-ignore
        await document.mozCancelFullScreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        // @ts-ignore
        document.webkitFullscreenElement ||
        // @ts-ignore
        document.mozFullScreenElement ||
        null;

      setIsFullscreen(!!fullscreenElement);
    };

    // Add event listeners for all vendor prefixes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}

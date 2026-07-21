"use client";

import { useCallback } from 'react';

/**
 * Custom hook for triggering consistent haptic feedback across the PWA.
 * Fails gracefully if the device/browser doesn't support the Vibration API.
 */
export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore errors (some browsers block vibration without user interaction)
      }
    }
  }, []);

  const triggerLight = () => vibrate(10);
  const triggerMedium = () => vibrate(30);
  const triggerHeavy = () => vibrate(50);
  const triggerError = () => vibrate([10, 30, 10]);
  const triggerSuccess = () => vibrate([10, 20, 10, 20, 10]);

  return {
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerError,
    triggerSuccess
  };
}

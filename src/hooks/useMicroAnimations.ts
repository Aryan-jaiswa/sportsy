/**
 * useMicroAnimations — provides ready-to-bind event handlers for common
 * micro-interactions (button press, form-field focus, content reveal).
 *
 * All animations go through the centralised AnimationController so they
 * respect reduced-motion and get cleaned up automatically.
 */
import { useCallback, useEffect, useRef } from 'react';
import {
  buttonPress,
  contentReveal,
  cancelAll,
} from '../lib/animationController';

/**
 * Returns an `onMouseDown` / `onTouchStart` handler that plays the
 * "button press" scale animation.
 */
export function useButtonPress() {
  const handler = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    buttonPress(e.currentTarget as HTMLElement);
  }, []);

  return { onMouseDown: handler };
}

/**
 * Trigger a stagger-reveal on a set of elements (e.g. cards replacing
 * skeleton loaders). Call `reveal()` once data is ready.
 */
export function useContentReveal() {
  const reveal = useCallback((selector: string | HTMLElement[]) => {
    contentReveal(selector);
  }, []);

  return reveal;
}

/**
 * Cleanup hook — cancels all running animations when the component unmounts.
 * Attach this to any component that fires animations.
 */
export function useAnimationCleanup() {
  useEffect(() => {
    return () => {
      cancelAll();
    };
  }, []);
}

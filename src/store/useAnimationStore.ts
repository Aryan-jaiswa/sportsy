/**
 * useAnimationStore — Zustand store slice dedicated to animation state.
 *
 * Keeps page-transition gating, route tracking, and the animation queue
 * in one place so that the AnimationController and PageTransition component
 * can coordinate without prop-drilling.
 */
import { create } from 'zustand';
import { prefersReducedMotion } from '../lib/animationController';

export interface AnimationTask {
  id: string;
  type: 'enter' | 'exit' | 'micro';
  status: 'pending' | 'running' | 'done';
}

interface AnimationState {
  /** True while a page transition is in progress — locks UI interactions. */
  isTransitioning: boolean;
  /** The route path currently displayed. */
  currentPage: string;
  /** The route path we just left (needed for exit animations). */
  previousPage: string;
  /** Serialised animation pipeline. */
  animationQueue: AnimationTask[];
  /** Respects the OS-level prefers-reduced-motion media query. */
  reducedMotion: boolean;

  // ---- Actions ----
  setIsTransitioning: (v: boolean) => void;
  setCurrentPage: (page: string) => void;
  setPreviousPage: (page: string) => void;
  enqueueAnimation: (task: AnimationTask) => void;
  dequeueAnimation: (id: string) => void;
  clearQueue: () => void;
  setReducedMotion: (v: boolean) => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  isTransitioning: false,
  currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
  previousPage: '',
  animationQueue: [],
  reducedMotion: prefersReducedMotion(),

  setIsTransitioning: (v) => set({ isTransitioning: v }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPreviousPage: (page) => set({ previousPage: page }),

  enqueueAnimation: (task) =>
    set((s) => ({ animationQueue: [...s.animationQueue, task] })),
  dequeueAnimation: (id) =>
    set((s) => ({
      animationQueue: s.animationQueue.filter((t) => t.id !== id),
    })),
  clearQueue: () => set({ animationQueue: [] }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
}));

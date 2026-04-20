/**
 * AnimationController — centralised singleton for managing all Anime.js
 * animations.  Provides a queue, lifecycle helpers, and reduced-motion
 * support so every call-site stays lean.
 */
import anime from 'animejs';

// ---------------------------------------------------------------------------
// Reduced-motion detection
// ---------------------------------------------------------------------------
const motionQuery =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

let _prefersReducedMotion = motionQuery?.matches ?? false;

// Keep the flag in sync if the user toggles the OS preference at runtime.
motionQuery?.addEventListener?.('change', (e) => {
  _prefersReducedMotion = e.matches;
});

export const prefersReducedMotion = () => _prefersReducedMotion;

// ---------------------------------------------------------------------------
// Animation registry — tracks every running instance so we can cancel / clean
// ---------------------------------------------------------------------------
type AnimeInstance = anime.AnimeInstance;

const _registry = new Map<string, AnimeInstance>();
let _idCounter = 0;

function nextId(): string {
  return `anim_${++_idCounter}`;
}

// ---------------------------------------------------------------------------
// Core "animate" wrapper — the ONLY function that should call anime()
// ---------------------------------------------------------------------------
export interface AnimateParams extends anime.AnimeParams {
  /** Optional human-readable key.  Re-using a key auto-cancels the previous. */
  key?: string;
}

/**
 * Wraps `anime()` with:
 * 1. Reduced-motion short-circuit (instant final state, fires complete cb).
 * 2. Automatic registration / cleanup in the animation registry.
 * 3. `will-change` lifecycle (set before, removed after).
 */
export function animate(params: AnimateParams): AnimeInstance | null {
  const id = params.key ?? nextId();

  // If a keyed animation already exists, kill it first.
  if (params.key && _registry.has(params.key)) {
    const prev = _registry.get(params.key)!;
    prev.pause();
    if (prev.animatables) {
      prev.animatables.forEach((a) => anime.remove(a.target));
    }
    _registry.delete(params.key);
  }

  // Reduced-motion path — jump to end state, fire callbacks, no motion.
  if (_prefersReducedMotion) {
    applyFinalState(params);
    (params as any).complete?.(null as any);
    return null;
  }

  // Set will-change on targets before animating
  setWillChange(params.targets, true);

  const origComplete = (params as any).complete;
  const instance = anime({
    ...params,
    complete: (anim: AnimeInstance) => {
      setWillChange(params.targets, false);
      _registry.delete(id);
      origComplete?.(anim);
    },
  });

  _registry.set(id, instance);
  return instance;
}

// ---------------------------------------------------------------------------
// Timeline helper
// ---------------------------------------------------------------------------
export function createTimeline(
  params?: anime.AnimeParams & { key?: string },
): anime.AnimeTimelineInstance {
  const tl = anime.timeline(params);
  const id = params?.key ?? nextId();
  _registry.set(id, tl as unknown as AnimeInstance);
  return tl;
}

// ---------------------------------------------------------------------------
// Lifecycle helpers
// ---------------------------------------------------------------------------

/** Pause + remove a specific keyed animation. */
export function cancel(key: string): void {
  const inst = _registry.get(key);
  if (!inst) return;
  inst.pause();
  if (inst.animatables) {
    inst.animatables.forEach((a) => anime.remove(a.target));
  }
  _registry.delete(key);
}

/** Cancel ALL running animations (route change / unmount). */
export function cancelAll(): void {
  _registry.forEach((inst, key) => {
    inst.pause();
    if (inst.animatables) {
      inst.animatables.forEach((a) => anime.remove(a.target));
    }
    _registry.delete(key);
  });
}

/** Pause a specific keyed animation. */
export function pause(key: string): void {
  _registry.get(key)?.pause();
}

/** Play (resume) a specific keyed animation. */
export function play(key: string): void {
  _registry.get(key)?.play();
}

/** Reverse a specific keyed animation. */
export function reverse(key: string): void {
  const inst = _registry.get(key);
  if (inst) {
    inst.reverse();
    inst.play();
  }
}

/** Reset a specific keyed animation to time 0. */
export function reset(key: string): void {
  const inst = _registry.get(key);
  if (inst) {
    inst.pause();
    inst.seek(0);
  }
}

// ---------------------------------------------------------------------------
// Micro-interaction presets
// ---------------------------------------------------------------------------

/** Button press scale micro-animation. Attach to onMouseDown / onTouchStart. */
export function buttonPress(target: EventTarget | HTMLElement): void {
  animate({
    targets: target as HTMLElement,
    scale: [1, 0.94, 1],
    duration: 200,
    easing: 'easeOutBack',
  });
}

/** Modal open animation (backdrop + panel). */
export function modalOpen(
  backdrop: HTMLElement,
  panel: HTMLElement,
): AnimeInstance | null {
  const tl = createTimeline({ key: 'modal', easing: 'easeOutExpo' });
  tl.add({
    targets: backdrop,
    opacity: [0, 1],
    duration: 180,
  }).add(
    {
      targets: panel,
      scale: [0.88, 1],
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 300,
    },
    '-=100',
  );
  return tl as unknown as AnimeInstance;
}

/** Modal close animation (reverse of open). */
export function modalClose(
  backdrop: HTMLElement,
  panel: HTMLElement,
): Promise<void> {
  return new Promise((resolve) => {
    const tl = createTimeline({
      key: 'modal',
      easing: 'easeInQuart',
      complete: () => resolve(),
    });
    tl.add({
      targets: panel,
      scale: [1, 0.88],
      translateY: [0, 20],
      opacity: [1, 0],
      duration: 220,
    }).add(
      {
        targets: backdrop,
        opacity: [1, 0],
        duration: 180,
      },
      '-=100',
    );
  });
}

/** Toast / notification enter animation. */
export function toastEnter(target: HTMLElement): void {
  animate({
    targets: target,
    translateX: [120, 0],
    opacity: [0, 1],
    duration: 320,
    easing: 'easeOutBack',
  });
}

/** Toast / notification exit animation. */
export function toastExit(target: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    animate({
      targets: target,
      translateX: [0, 120],
      opacity: [1, 0],
      duration: 240,
      easing: 'easeInQuart',
      complete: () => resolve(),
    });
  });
}

/** Skeleton → content reveal (stagger cards). */
export function contentReveal(selector: string | HTMLElement[]): void {
  animate({
    targets: selector,
    opacity: [0, 1],
    translateY: [16, 0],
    delay: anime.stagger(80),
    duration: 500,
    easing: 'easeOutCubic',
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Apply the logical "end" state instantly for reduced-motion users. */
function applyFinalState(params: anime.AnimeParams): void {
  const targets =
    typeof params.targets === 'string'
      ? document.querySelectorAll(params.targets)
      : params.targets instanceof NodeList
        ? params.targets
        : Array.isArray(params.targets)
          ? params.targets
          : params.targets
            ? [params.targets]
            : [];

  (targets as ArrayLike<HTMLElement>).forEach?.((el: HTMLElement) => {
    if (el && el.style) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
  });

  // For NodeList / querySelectorAll
  if (typeof (targets as NodeListOf<HTMLElement>).forEach === 'function') {
    (targets as NodeListOf<HTMLElement>).forEach((el) => {
      if (el && el.style) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }
}

/** Toggle `will-change` on animation targets. */
function setWillChange(
  targets: anime.AnimeParams['targets'],
  on: boolean,
): void {
  const value = on ? 'transform, opacity' : 'auto';
  const els = resolveTargets(targets);
  els.forEach((el) => {
    if (el && (el as HTMLElement).style) {
      (el as HTMLElement).style.willChange = value;
    }
  });
}

function resolveTargets(targets: anime.AnimeParams['targets']): HTMLElement[] {
  if (!targets) return [];
  if (typeof targets === 'string')
    return Array.from(document.querySelectorAll<HTMLElement>(targets));
  if (targets instanceof NodeList)
    return Array.from(targets) as HTMLElement[];
  if (Array.isArray(targets)) return targets as HTMLElement[];
  return [targets as HTMLElement];
}

// Re-export anime for edge-cases where direct access is needed.
export { anime };

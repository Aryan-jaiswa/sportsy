/**
 * useScrollReveal — fires a one-shot anime.js reveal when an element
 * with `data-scroll-reveal` enters the viewport (IntersectionObserver).
 *
 * Usage:
 *   const ref = useScrollReveal<HTMLDivElement>();
 *   <div ref={ref} data-scroll-reveal> ... </div>
 *
 * Or attach to a container that has children with `data-scroll-reveal`:
 *   useScrollReveal(containerRef);
 */
import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { animate } from '../lib/animationController';

/**
 * Observes all `[data-scroll-reveal]` descendants inside `root`.
 * Each element animates once when it crosses the 15 % visibility threshold.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  externalRef?: React.RefObject<T | null>,
) {
  const internalRef = useRef<T>(null);
  const ref = externalRef ?? internalRef;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Gather targets — the container itself (if annotated) + descendants.
    const targets: HTMLElement[] = [];
    if (root.hasAttribute('data-scroll-reveal')) targets.push(root);
    root.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach((el) =>
      targets.push(el),
    );

    if (targets.length === 0) return;

    // Pre-hide so they're invisible until revealed.
    targets.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate({
              targets: entry.target as HTMLElement,
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 600,
              easing: 'easeOutExpo',
            });
            observer.unobserve(entry.target); // fire once only
          }
        });
      },
      { threshold: 0.15 },
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return internalRef;
}

export default useScrollReveal;

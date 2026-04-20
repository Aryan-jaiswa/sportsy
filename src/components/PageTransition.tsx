/**
 * PageTransition — wraps the routed content and orchestrates
 * EXIT ➜ ENTER animations on every location change.
 *
 * It manually holds the *previous* children in the DOM long enough for the
 * exit animation to finish before React Router swaps the component tree.
 */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import anime from 'animejs';
import { animate, cancelAll } from '../lib/animationController';
import { useAnimationStore } from '../store/useAnimationStore';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const {
    isTransitioning,
    setIsTransitioning,
    setCurrentPage,
    setPreviousPage,
    currentPage,
  } = useAnimationStore();

  // We keep a snapshot of the previous children so we can show them during exit.
  const [displayChildren, setDisplayChildren] = useState(children);
  const [displayLocation, setDisplayLocation] = useState(location);

  // Animate the progress bar during transition
  const animateProgressBar = useCallback((phase: 'start' | 'end') => {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;

    if (phase === 'start') {
      bar.style.opacity = '1';
      bar.style.width = '0%';
      animate({
        key: 'progress-bar',
        targets: bar,
        width: ['0%', '85%'],
        duration: 800,
        easing: 'easeOutQuart',
      });
    } else {
      animate({
        key: 'progress-bar',
        targets: bar,
        width: '100%',
        duration: 200,
        easing: 'easeOutQuart',
        complete: () => {
          animate({
            key: 'progress-bar-fade',
            targets: bar,
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuart',
            complete: () => {
              bar.style.width = '0%';
            },
          });
        },
      });
    }
  }, []);

  // Runs an "enter" reveal on all [data-page-enter] elements inside the container.
  const runEnterAnimation = useCallback(() => {
    if (!containerRef.current) return;
    const targets = containerRef.current.querySelectorAll('[data-page-enter]');
    if (targets.length === 0) {
      setIsTransitioning(false);
      animateProgressBar('end');
      return;
    }

    // Reset targets to their pre-animation state before animating in
    targets.forEach((el) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(32px)';
    });

    animate({
      key: 'page-enter',
      targets: targets,
      opacity: [0, 1],
      translateY: [32, 0],
      duration: 420,
      easing: 'easeOutExpo',
      delay: anime.stagger(60, { from: 'first' }),
      begin: () => {
        setIsTransitioning(false);
        animateProgressBar('end');
      },
    });
  }, [setIsTransitioning, animateProgressBar]);

  // Handle location changes
  useEffect(() => {
    // Skip animation on first render — just show the page.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setCurrentPage(location.pathname);
      // Trigger enter animation for the initial page load
      requestAnimationFrame(() => {
        runEnterAnimation();
      });
      return;
    }

    // Same path — nothing to animate.
    if (location.pathname === displayLocation.pathname) return;

    // Already transitioning — cancel stale animations.
    if (isTransitioning) {
      cancelAll();
    }

    setIsTransitioning(true);
    setPreviousPage(currentPage);
    animateProgressBar('start');

    // EXIT phase — animate out old content.
    const exitTargets = containerRef.current?.querySelectorAll('[data-page-enter]');

    if (exitTargets && exitTargets.length > 0) {
      animate({
        key: 'page-exit',
        targets: exitTargets,
        opacity: [1, 0],
        translateY: [0, -24],
        duration: 280,
        easing: 'easeInQuart',
        complete: () => {
          // Swap to new children & location
          setDisplayChildren(children);
          setDisplayLocation(location);
          setCurrentPage(location.pathname);
        },
      });
    } else {
      // No exit targets — swap immediately.
      setDisplayChildren(children);
      setDisplayLocation(location);
      setCurrentPage(location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // When displayChildren changes (after exit finishes), play enter.
  useEffect(() => {
    if (isFirstRender.current) return;
    // Wait one frame for React to paint the new DOM.
    requestAnimationFrame(() => {
      runEnterAnimation();
    });
  }, [displayChildren, runEnterAnimation]);

  // Keep children in sync when they change for non-route reasons (e.g. data loading).
  useEffect(() => {
    if (location.pathname === displayLocation.pathname) {
      setDisplayChildren(children);
    }
  }, [children, location.pathname, displayLocation.pathname]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', minHeight: '100vh' }}
      data-page-transition-container
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;

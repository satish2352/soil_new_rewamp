import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { BP } from './tokens';

/**
 * The engine: GSAP, ScrollTrigger and Lenis, configured once.
 *
 * Every animation in the site goes through this module rather than importing
 * gsap directly, for three reasons:
 *
 *  1. **ScrollTrigger must be registered exactly once.** Registering per
 *     component is harmless but registering conditionally is not, and a
 *     missing registration fails at runtime rather than at build.
 *  2. **Lenis and ScrollTrigger have to be told about each other.** Lenis
 *     moves the page on its own rAF loop; without wiring its `scroll` event to
 *     `ScrollTrigger.update`, every trigger fires against a stale scroll
 *     position and pinned sections drift behind the content.
 *  3. **Reduced motion has to be decided in one place.** Scattering
 *     `prefers-reduced-motion` checks across components guarantees one gets
 *     missed.
 */

gsap.registerPlugin(ScrollTrigger);

/*
  Default to the brand curve and a sensible duration so a tween written
  without either still matches the system.
*/
gsap.defaults({ ease: 'power3.out', duration: 0.62 });

/*
  ScrollTrigger recalculates on resize, which on mobile fires every time the
  address bar collapses — mid-scroll, repeatedly. Ignoring resizes that only
  change height stops pinned sections jumping while the user is reading.
*/
ScrollTrigger.config({ ignoreMobileResize: true });

let lenis = null;
let rafId = 0;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isDesktop = () =>
  typeof window !== 'undefined' && window.innerWidth >= BP.lg;

/**
 * Starts Lenis smooth scrolling and hands ScrollTrigger the wheel.
 *
 * Gated to desktop pointers with motion allowed. Smooth scroll is a comfort
 * feature on a mouse wheel and an active liability on touch: it replaces the
 * platform's own scroll physics — which users know, and which their OS
 * accessibility settings tune — with a JS approximation, and on a low-end
 * Android it adds a frame of latency to the one interaction that has to feel
 * immediate. So phones keep native scrolling, and so does anyone who asked for
 * reduced motion.
 *
 * Returns a teardown function.
 */
export function startSmoothScroll() {
  if (typeof window === 'undefined') return () => {};
  if (prefersReducedMotion() || isTouch()) return () => {};
  if (lenis) return stopSmoothScroll;

  lenis = new Lenis({
    duration: 1.05,
    // Exponential ease-out: quick to respond, slow to settle.
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
    // Never on touch, even if this somehow runs there.
    syncTouch: false,
    touchMultiplier: 1,
  });

  // Keep ScrollTrigger in step with Lenis's virtual scroll position.
  lenis.on('scroll', ScrollTrigger.update);

  const raf = (time) => {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  return stopSmoothScroll;
}

export function stopSmoothScroll() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  lenis?.destroy();
  lenis = null;
}

/**
 * Scrolls to a target through Lenis when it is running, natively otherwise.
 *
 * Anything that moves the viewport has to go through here. Calling
 * `window.scrollTo` while Lenis owns the scroll position leaves the two
 * disagreeing: the page jumps, then Lenis animates it back.
 */
export function scrollTo(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, { immediate: options.immediate, offset: options.offset || 0 });
    return;
  }
  const top =
    typeof target === 'number'
      ? target
      : (target?.getBoundingClientRect?.().top || 0) + window.scrollY + (options.offset || 0);
  window.scrollTo({ top, behavior: options.immediate ? 'auto' : 'smooth' });
}

/** Stops Lenis from touching the page — used while a modal owns the scroll. */
export function pauseSmoothScroll() {
  lenis?.stop();
}

export function resumeSmoothScroll() {
  lenis?.start();
}

export { gsap, ScrollTrigger };

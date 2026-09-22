/**
 * The motion system's public surface.
 *
 * Sections import from here and nowhere else — never from `gsap` directly.
 * That keeps plugin registration, the Lenis/ScrollTrigger wiring and the
 * reduced-motion policy in one place, and it means the engine underneath can
 * change without touching a single section.
 *
 *   src/lib/motion/
 *     tokens.js      durations, easings, distances, depths, breakpoints
 *     engine.js      GSAP + ScrollTrigger registration, Lenis, scroll control
 *     animations.js  the vocabulary: reveal, imageReveal, parallax, pin, …
 *     hooks.js       React bindings, each with GSAP context cleanup
 *
 * `framer-motion` is still used, deliberately and narrowly, for React
 * component transitions — modals, the mobile menu, route changes — where
 * presence animation (`AnimatePresence`) is the thing that matters and GSAP
 * would mean hand-managing mount/unmount. GSAP owns everything scroll-driven.
 */

export * from './tokens';
export * from './engine';
export * from './animations';
export * from './hooks';

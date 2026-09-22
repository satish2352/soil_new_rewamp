/**
 * Motion tokens — the single source of timing, easing and distance.
 *
 * Nothing in the motion system invents its own values. A section that wants a
 * different feel picks a different token; it does not write a new cubic-bezier
 * or a new pixel distance inline. These mirror the `--dur-*` / `--ease-*`
 * custom properties in styles/index.css so a CSS transition and a GSAP tween
 * on the same element agree with each other.
 */

/** Durations in seconds. GSAP takes seconds; CSS takes the ms mirror. */
export const DUR = {
  fast: 0.18,
  normal: 0.32,
  slow: 0.62,
  cine: 1.1,
  epic: 1.6,
};

/**
 * Easings.
 *
 * Two vocabularies for the same curves, because both engines are in use:
 * `EASE` holds GSAP easing strings, `BEZIER` holds the control-point arrays
 * framer-motion wants. They are the same curves — `organic` in one is
 * `organic` in the other — so an element handed from one engine to the other
 * does not visibly change character.
 */
export const EASE = {
  organic: 'power3.out',
  cine: 'expo.out',
  inOut: 'power2.inOut',
  spring: 'back.out(1.4)',
  linear: 'none',
};

export const BEZIER = {
  organic: [0.22, 1, 0.36, 1],
  cine: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
};

/** Stagger gaps. Denser than `tight` reads as a glitch rather than a stagger. */
export const GAP = {
  tight: 0.035,
  normal: 0.06,
  loose: 0.1,
};

/** Travel distances in px. Reveals move a little; they do not fly in. */
export const DIST = {
  sm: 16,
  md: 28,
  lg: 48,
};

/** Scale endpoints for reveals and hovers. */
export const SCALE = {
  imageFrom: 1.15,
  hover: 1.05,
  press: 0.97,
};

/**
 * Parallax speeds, as a fraction of scroll distance.
 *
 * Deliberately small. The brief's own instruction applies here — the goal is
 * depth, not visible movement. Anything above ~0.25 stops reading as a plane
 * at a distance and starts reading as an element sliding.
 */
export const DEPTH = {
  background: 0.05,
  content: 0.08,
  visual: 0.15,
  decor: 0.2,
};

/** Clip-path endpoints used by the image and text reveal system. */
export const CLIP = {
  hiddenUp: 'inset(100% 0 0 0)',
  hiddenDown: 'inset(0 0 100% 0)',
  hiddenLeft: 'inset(0 100% 0 0)',
  hiddenRight: 'inset(0 0 0 100%)',
  shown: 'inset(0% 0% 0% 0%)',
};

/**
 * Breakpoints, in px, matching tailwind.config.js.
 *
 * Exported as numbers so JS can gate behaviour on the same values the CSS uses
 * — a pinned section that engages at 1024 in CSS and 1000 in JS produces a
 * 24px band where the layout and the animation disagree.
 */
export const BP = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/** Standard ScrollTrigger start/end pairs, so sections trigger consistently. */
export const TRIGGER = {
  /** Fires as the element's top passes 85% down the viewport. */
  reveal: { start: 'top 85%' },
  /** Scrubbed across the element's full pass through the viewport. */
  pass: { start: 'top bottom', end: 'bottom top', scrub: true },
  /** Scrubbed while the element is pinned to the top. */
  pin: { start: 'top top', end: 'bottom bottom', scrub: true },
};

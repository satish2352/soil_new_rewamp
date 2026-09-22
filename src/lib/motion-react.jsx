/**
 * The motion system.
 *
 * Two rules hold this file together:
 *
 * 1. **Nothing invents its own timing.** Durations and easings come from the
 *    tokens below, which mirror the `--dur-*` / `--ease-*` variables in
 *    index.css. A section that wants a different feel picks a different token,
 *    it does not write a new cubic-bezier.
 *
 * 2. **Every primitive degrades under `prefers-reduced-motion`.** Not "runs
 *    faster" — degrades to a short opacity fade with no transform, no parallax,
 *    no scrub, no stagger. The content is never left invisible.
 */
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

/* ----------------------------------------------------------------- tokens */

/** Easings. `EASE` is kept as the historical name for the standard curve. */
export const EASE = [0.22, 1, 0.36, 1];
export const EASE_CINE = [0.16, 1, 0.3, 1];

/** Durations, in seconds, matching the CSS `--dur-*` scale. */
export const DUR = {
  fast: 0.18,
  normal: 0.32,
  slow: 0.62,
  cine: 1.1,
};

/** Stagger gaps. Anything denser than `tight` reads as a glitch, not a stagger. */
export const GAP = {
  tight: 0.05,
  normal: 0.08,
  loose: 0.12,
};

/** Standard viewport trigger: fire once, a little before the element is centred. */
const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' };

/** The reduced-motion fallback every primitive collapses to. */
const FADE = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: VIEWPORT,
  transition: { duration: 0.25 },
};

/* ------------------------------------------------------------- primitives */

/**
 * Fades and lifts a block into view on scroll.
 * `delay` staggers siblings; `y` controls travel distance.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  duration = DUR.slow,
  className,
  as = 'div',
  ...rest
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;

  return (
    <Comp
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: reduce ? 0.25 : duration, delay: reduce ? 0 : delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/**
 * Reveals an image behind a clip-path wipe, with a slow counter-scale so the
 * picture settles rather than pops.
 *
 * `from` chooses the wipe direction — 'bottom' (default) uncovers upward,
 * 'left' uncovers rightward. Direction is a storytelling choice: an image that
 * enters from the side of the page it sits on feels like it slid into place.
 */
export function ImageReveal({ children, className, delay = 0, from = 'bottom', ...rest }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <motion.div className={className} {...FADE} {...rest}>
        {children}
      </motion.div>
    );
  }

  const closed = from === 'left' ? 'inset(0 100% 0 0)' : 'inset(0 0 100% 0)';

  return (
    <motion.div
      className={className}
      style={{ overflow: 'hidden' }}
      initial={{ clipPath: closed }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={VIEWPORT}
      transition={{ duration: 1.05, delay, ease: EASE_CINE }}
      {...rest}
    >
      <motion.div
        initial={{ scale: 1.14 }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 1.3, delay, ease: EASE_CINE }}
        style={{ height: '100%' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Word-by-word headline reveal. Falls back to a single fade when motion is
 * reduced, and always renders the text as one accessible string.
 *
 * Reserved for the headings that carry a section. Per the hierarchy rule this
 * is deliberately *not* applied to every heading on the page — if every title
 * performs, none of them mean anything.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.055,
  wordClassName = '',
  as: As = 'h2',
  ...rest
}) {
  const reduce = useReducedMotion();
  const words = String(text).split(' ');

  // `rest` carries through `id`, which sections reference via aria-labelledby —
  // dropping it would leave those sections without an accessible name.
  if (reduce) {
    return (
      <motion.div {...FADE}>
        <As className={className} {...rest}>
          {text}
        </As>
      </motion.div>
    );
  }

  return (
    <As className={className} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span className="reveal-clip inline-block align-bottom">
              <motion.span
                className={`inline-block ${wordClassName}`}
                initial={{ y: '110%' }}
                whileInView={{ y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.75, delay: delay + i * stagger, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
            {/*
              The separator is a text node *between* the wrappers, never inside
              them. A trailing space within an `inline-block` sits at the end of
              that block's line box and is collapsed away, so putting it next to
              the word silently welds every heading into one long string —
              "your dream gallery" rendered as "yourdreamgallery".
            */}
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </As>
  );
}

/**
 * Line-masked reveal for a multi-line display heading: each line rises out of
 * its own mask, one after the other.
 *
 * Lines are explicit rather than measured. Detecting real line boxes means
 * reading layout after paint, which stalls on a webfont swap and breaks the
 * moment a translation rewraps the text — so the caller passes the lines it
 * wants, and a translated string simply wraps inside its own mask.
 */
export function LineReveal({
  lines,
  as: As = 'h1',
  className = '',
  lineClassName = '',
  delay = 0,
  stagger = 0.11,
  duration = 0.95,
  accentIndex = -1,
  accentClassName = 'text-sun',
  ...rest
}) {
  const reduce = useReducedMotion();
  const list = Array.isArray(lines) ? lines : [lines];

  return (
    <As className={className} {...rest}>
      <span className="sr-only">{list.join(' ')}</span>
      <span aria-hidden="true">
        {list.map((line, i) => (
          <span key={`${line}-${i}`} className="reveal-clip block">
            <motion.span
              className={`block ${lineClassName} ${i === accentIndex ? accentClassName : ''}`}
              initial={reduce ? { opacity: 0 } : { y: '106%' }}
              whileInView={reduce ? { opacity: 1 } : { y: 0 }}
              viewport={VIEWPORT}
              transition={{
                duration: reduce ? 0.25 : duration,
                delay: reduce ? 0 : delay + i * stagger,
                ease: EASE,
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </span>
    </As>
  );
}

/**
 * Scroll parallax for a decorative layer. `distance` is the total travel in px
 * across the element's full scroll pass. Disabled entirely under reduced motion.
 */
export function useParallax(distance = 60) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return { ref, y: reduce ? 0 : y, reduce };
}

/**
 * Raw scroll progress (0 → 1) for an element, with configurable start and end
 * points. This is the hook every scroll-driven scene is built on.
 *
 * `offset` follows framer-motion's convention: `['start end', 'end start']`
 * means "0 when the element's top hits the viewport bottom, 1 when its bottom
 * hits the viewport top".
 */
export function useSceneProgress(offset = ['start end', 'end start']) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return { ref, progress: scrollYProgress, reduce };
}

/**
 * Magnetic pointer attraction.
 *
 * Returns props to spread onto an element plus the motion values to drive it.
 * Travel is capped at `strength` px so the control never leaves its own hit
 * area — a button that outruns the cursor is a button you cannot click.
 *
 * Pointer-type aware: `onPointerMove` only reacts to a fine pointer, so a
 * touch drag across the button does not fling it around.
 */
export function useMagnetic(strength = 12) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 220, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 22, mass: 0.4 });

  const onPointerMove = useCallback(
    (e) => {
      if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      // Normalised to the element's own half-extent, then capped.
      x.set(Math.max(-1, Math.min(1, dx / (r.width / 2))) * strength);
      y.set(Math.max(-1, Math.min(1, dy / (r.height / 2))) * strength);
    },
    [reduce, strength, x, y]
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    ref,
    style: reduce ? undefined : { x: sx, y: sy },
    // `onBlur` matters: a keyboard user can focus the button while the pointer
    // sits elsewhere, and the offset must not stick.
    handlers: { onPointerMove, onPointerLeave: reset, onBlur: reset },
    reduce,
  };
}

/**
 * Tracks which index in a set is "active" as a pinned scene scrolls past.
 * Used by the sticky storytelling section to swap its visual in step with the
 * text column. Returns the active index and the raw progress.
 */
export function useSceneIndex(count, progress) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!progress || count < 1) return undefined;
    const unsubscribe = progress.on('change', (p) => {
      // Clamp before flooring: p reaches exactly 1 at the end of the pass and
      // would otherwise index one past the last item.
      const next = Math.min(count - 1, Math.max(0, Math.floor(p * count)));
      setIndex((prev) => (prev === next ? prev : next));
    });
    return unsubscribe;
  }, [progress, count]);

  return index;
}

/**
 * Character-by-character reveal, for the one headline that opens the site.
 *
 * Each character rises out of its own mask on a stagger. This is the most
 * expensive text treatment in the system — it creates a DOM node per glyph —
 * so it is reserved for the hero and nothing else. Words are kept intact as
 * inline-blocks so the line still wraps at spaces rather than mid-word.
 *
 * The whole string is also rendered once into an `sr-only` span, because a
 * headline split into 30 spans is read by some screen readers as 30 separate
 * items.
 */
export function CharReveal({
  text,
  as: As = 'span',
  className = '',
  charClassName = '',
  delay = 0,
  stagger = 0.028,
  duration = 0.85,
  ...rest
}) {
  const reduce = useReducedMotion();
  const words = String(text).split(' ');

  if (reduce) {
    return (
      <As className={className} {...rest}>
        {text}
      </As>
    );
  }

  let index = 0;

  return (
    <As className={className} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <Fragment key={`${word}-${w}`}>
            {/*
              One mask per word, not per character: a per-character mask clips
              the side bearings of italics and the connecting strokes of
              Devanagari, so letters visibly lose their edges as they rise.
            */}
            <span className="reveal-clip inline-block align-bottom">
              {[...word].map((char, c) => {
                const at = index++;
                return (
                  <motion.span
                    key={`${char}-${c}`}
                    className={`inline-block ${charClassName}`}
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration, delay: delay + at * stagger, ease: EASE }}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </span>
            {w < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </As>
  );
}

/**
 * Parallax for a layer *inside* a frame, driven by the frame's scroll pass.
 *
 * Returns a `y` to spread onto an oversized child. The child must be taller
 * than its container — `scale` says by how much — or the travel exposes the
 * edge of the image. `useParallax` moves a decorative element around the page;
 * this moves content within a fixed window, which is what gives photographs
 * depth without changing the layout at all.
 */
export function useFrameParallax({ distance = 18, scale = 1.18 } = {}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${distance}%`, `${distance}%`]);

  return {
    ref,
    // The inner layer keeps its own scale so the parallax never reveals an edge.
    style: reduce ? undefined : { y, scale },
    reduce,
  };
}

/**
 * Scroll velocity, smoothed and clamped.
 *
 * Feeds the "the page reacts to how hard you are scrolling" effects — a slight
 * skew or stretch while flicking, settling to nothing at rest. `max` caps the
 * output so a trackpad fling cannot shear the layout into abstraction.
 *
 * Returns a spring-damped value in the range [-max, max]; it is exactly 0 when
 * motion is reduced, so a consumer can spread it unconditionally.
 */
export function useScrollVelocity({ max = 5, factor = 2600 } = {}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  /*
    Lightly damped on purpose. Heavier damping (the 260/46 this started on)
    smoothed the signal so far below the clamp that the effect never became
    visible at all — it measured 0.01 degrees during a hard flick. These values
    let a real scroll register while still returning to rest quickly enough
    that nothing is left leaning after the user stops.
  */
  const smoothed = useSpring(velocity, { stiffness: 180, damping: 30, mass: 0.3 });
  const clamped = useTransform(smoothed, (v) =>
    Math.max(-max, Math.min(max, v / factor))
  );
  const zero = useMotionValue(0);
  return reduce ? zero : clamped;
}

/**
 * Continuous horizontal marquee.
 *
 * The track holds two identical copies of the children and translates by
 * exactly -50%, so the second copy lands where the first began and the loop is
 * seamless. The duplicate is `aria-hidden`, or every screen reader announces
 * the whole list twice.
 *
 * `reverse` runs it the other way, which is what lets two stacked rows move in
 * opposition — the detail that makes a marquee read as designed rather than as
 * a stock ticker.
 */
export function Marquee({
  children,
  speed = 38,
  /**
   * Which way the *content* travels, named after what the reader sees:
   *
   *   'rtl'  content moves right to left  (the news-ticker direction)
   *   'ltr'  content moves left to right
   *
   * Named rather than a `reverse` boolean on purpose — "reverse" only means
   * something if you already know which way the default went, and at the call
   * site that is exactly the thing you are trying to work out.
   */
  direction = 'rtl',
  className = '',
  trackClassName = '',
}) {
  const reduce = useReducedMotion();

  // With motion reduced this becomes a plain, honest horizontal scroller.
  if (reduce) {
    return (
      <div className={`no-scrollbar overflow-x-auto ${className}`}>
        <div className={`flex w-max ${trackClassName}`}>{children}</div>
      </div>
    );
  }

  /*
    A CSS animation, not a JS one — and that is a correctness fix as much as a
    performance one.

    This was a framer-motion `animate={{ x: ['0%', '-50%'] }}` with
    `repeat: Infinity`, and it silently did not run: inspected live, both
    tracks reported `getAnimations().length === 0` and sat parked on their
    final keyframe. It looked animated in review only because the check asked
    whether `transform !== 'none'`, which `translateX(-50%)` satisfies while
    perfectly still.

    An endless linear translate is the one case where a library earns nothing.
    The keyframe lives in tailwind.config.js, the compositor owns it, it
    survives a busy main thread, and `prefers-reduced-motion` already
    neutralises every CSS animation site-wide as a second line of defence.

    Direction comes from `animation-direction`: the keyframe always runs
    0% → -50%, so playing it in reverse walks the track the other way without
    needing a second set of keyframes to keep in sync.
  */
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex w-max animate-marquee ${trackClassName}`}
        style={{
          animationDuration: `${speed}s`,
          animationDirection: direction === 'ltr' ? 'reverse' : 'normal',
        }}
      >
        {children}
        {/* The duplicate is aria-hidden, or the list is announced twice. */}
        <span aria-hidden="true" className="contents">
          {children}
        </span>
      </div>
    </div>
  );
}

/** Container that staggers its Reveal children. */
export const stagger = (gap = GAP.normal) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

export {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
};

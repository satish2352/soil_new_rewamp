import { useMemo, useRef } from 'react';
import { useInView } from 'framer-motion';
import { motion, useReducedMotion } from '../lib/motion-react';

/**
 * Ambient fluid motion for a dark band.
 *
 * This is the thing the page was missing between scroll events: with every
 * animation tied to a scroll trigger, a stationary reader sees a completely
 * static image. A slow drift underneath gives the page a pulse without asking
 * for attention.
 *
 * Built as three overlapping blurred blobs on long, prime-ish, offset cycles
 * (19s / 23s / 29s) so they never resynchronise into a visible loop. Each one
 * animates `transform` and nothing else — no `filter` animation, no background
 * repaint, no layout — so the whole thing composites on the GPU and costs
 * effectively nothing per frame.
 *
 * Deliberately *not* WebGL. A shader-driven mesh gradient is the fashionable
 * version of this, and it would mean a renderer, a context and a rAF loop
 * running forever on a page whose audience skews to mid-range Android. Three
 * transformed divs get 90% of the look for none of that.
 *
 * `tone` picks the palette; `intensity` scales every opacity at once so a
 * section can dial it down without editing each layer.
 *
 * The drift is paused whenever the band is off-screen. With five of these on
 * the homepage that is fifteen elements the compositor would otherwise keep
 * re-drawing for a reader who is nowhere near them — measurably, the idle
 * frame budget on a long page. The margin starts them slightly before they
 * scroll in, so a band is never caught mid-jump into position.
 */
export default function FluidBackdrop({ tone = 'leaf', intensity = 1, className = '' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '15% 0px 15% 0px' });
  const running = inView && !reduce;

  /*
    Memoised because `useInView` flips state as each band scrolls in and out,
    and every one of those flips re-renders this component *during* a scroll.
    Rebuilding the palette and the three path objects each time allocates fresh
    arrays, which makes framer-motion treat the animation target as changed and
    restart it — visible as a hitch exactly when the band appears.
  */
  const palette = useMemo(() =>
    tone === 'sun'
      ? ['rgb(var(--c-accent))', 'rgb(var(--c-leaf))', 'rgb(var(--c-earth))']
      : tone === 'earth'
        ? ['rgb(var(--c-earth))', 'rgb(var(--c-soil))', 'rgb(var(--c-accent))']
        : ['rgb(var(--c-leaf))', 'rgb(var(--c-primary))', 'rgb(var(--c-accent))'],
  [tone]);

  const blobs = useMemo(() => [
    {
      color: palette[0],
      opacity: 0.16 * intensity,
      className: '-left-[15%] top-[-20%] h-[38rem] w-[38rem]',
      duration: 19,
      path: { x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.12, 0.95, 1] },
    },
    {
      color: palette[1],
      opacity: 0.13 * intensity,
      className: 'right-[-18%] top-[25%] h-[34rem] w-[34rem]',
      duration: 23,
      path: { x: [0, -50, 35, 0], y: [0, 45, -25, 0], scale: [1, 0.92, 1.1, 1] },
    },
    {
      color: palette[2],
      opacity: 0.1 * intensity,
      className: 'left-[30%] bottom-[-25%] h-[30rem] w-[30rem]',
      duration: 29,
      path: { x: [0, 40, -45, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.96, 1] },
    },
  ], [palette, intensity]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`blob absolute blur-3xl ${b.className}`}
          style={{ backgroundColor: b.color, opacity: b.opacity }}
          animate={running ? b.path : undefined}
          transition={
            running
              ? { duration: b.duration, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }
              : undefined
          }
        />
      ))}

      {/* Grain over the top ties the soft gradients back to the rest of the page. */}
      <div className="absolute inset-0 grain opacity-45" />
    </div>
  );
}

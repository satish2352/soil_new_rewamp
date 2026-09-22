import { motion, useScroll, useSpring } from '../lib/motion-react';

/**
 * A hairline across the bottom of the header showing how far through the
 * document the reader is.
 *
 * It earns its place on this site because several routes are genuinely long —
 * the article bodies and the careers page run well past a screen — and it
 * answers "how much is left" without costing any layout. It is one pixel of
 * accent on an existing edge, not a new element in the design.
 *
 * `scaleX` on a full-width bar rather than an animated `width`: width is a
 * layout property and would reflow on every scroll frame.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-leaf via-sun to-leaf"
    />
  );
}

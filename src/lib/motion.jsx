/**
 * Animation primitives. Every one of these degrades to a plain, instant render
 * when the user asks for reduced motion — no transforms, no parallax, no stagger.
 */
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const EASE = [0.22, 1, 0.36, 1];

/** Standard viewport trigger: fire once, a little before the element is centred. */
const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' };

/**
 * Fades and lifts a block into view on scroll.
 * `delay` staggers siblings; `y` controls travel distance.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  duration = 0.7,
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
 */
export function ImageReveal({ children, className, delay = 0, ...rest }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.25 }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      style={{ overflow: 'hidden' }}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={VIEWPORT}
      transition={{ duration: 1.05, delay, ease: EASE }}
      {...rest}
    >
      <motion.div
        initial={{ scale: 1.14 }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 1.3, delay, ease: EASE }}
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
 */
export function TextReveal({
  text,
  className,
  delay = 0,
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
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.25 }}
      >
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
          <span key={`${word}-${i}`} className="reveal-clip inline-block align-bottom">
            <motion.span
              className={`inline-block ${wordClassName}`}
              initial={{ y: '110%' }}
              whileInView={{ y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.75, delay: delay + i * 0.055, ease: EASE }}
            >
              {word}
              {i < words.length - 1 ? ' ' : ''}
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

/** Container that staggers its Reveal children. */
export const stagger = (gap = 0.09) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

export { motion, useReducedMotion };

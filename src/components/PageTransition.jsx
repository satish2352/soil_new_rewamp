import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { DUR, EASE_CINE, motion, useReducedMotion } from '../lib/motion-react';
import { scrollTo } from '../lib/motion';

/**
 * Moves the viewport for a new route: to the hash target if there is one,
 * otherwise to the top. Instant, never smooth — this runs at the moment the
 * screen is mid-transition, and a smooth scroll here is what produced the old
 * "watch the new page slide past before it settles" effect.
 */
function restoreScroll(hash) {
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      const header = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h')
      );
      const offset = (Number.isFinite(header) ? header : 4.5) * 16 + 16;
      scrollTo(target.getBoundingClientRect().top + window.scrollY - offset, { immediate: true });
      return;
    }
  }
  /*
    Through Lenis when it owns the scroll position. A raw `window.scrollTo`
    while Lenis is running leaves the two disagreeing — the page jumps to the
    top and Lenis immediately animates it back to where it was.
  */
  scrollTo(0, { immediate: true });
}

/**
 * Route transition.
 *
 * What this replaces: an instant tree swap followed by a *smooth* scroll to the
 * top, so the user watched the whole new page glide past before it settled.
 * Here the outgoing page fades down, the scroll is restored in the gap — while
 * nothing is on screen, so the jump is never seen — and the new page rises in.
 *
 * `mode="wait"` costs the exit duration in latency, so the exit stays short
 * (180ms) and the entrance carries the weight. Longer, and the site feels like
 * it is thinking rather than moving.
 *
 * Deliberately not the View Transitions API: it is still absent in Firefox and
 * in Safari before 18, and a route animation that silently does nothing for a
 * large share of visitors is not a transition system. This works everywhere.
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const reduce = useReducedMotion();
  const key = location.pathname;

  // The scroll restore is bound to the *exit* completing, not to the location
  // changing: at location-change time the outgoing page is still on screen, and
  // resetting scroll there would yank it out from under the reader.
  const onExitComplete = useCallback(() => restoreScroll(location.hash), [location.hash]);

  // With motion reduced there is no exit animation to hang the restore on.
  useEffect(() => {
    if (!reduce) return;
    restoreScroll(location.hash);
  }, [reduce, key, location.search, location.hash]);

  if (reduce) return children;

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: DUR.slow,
          ease: EASE_CINE,
          exit: { duration: DUR.fast, ease: 'easeIn' },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

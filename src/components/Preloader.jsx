import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { company } from '../data/site';
import { EASE_CINE, motion, useReducedMotion } from '../lib/motion-react';

/**
 * The opening curtain.
 *
 * This component was measured and rebuilt, because the first version was the
 * most expensive thing on the site by the only metric that matters here.
 *
 *   profile                    first paint    hero readable    curtain cost
 *   desktop, unthrottled           868 ms         2424 ms        +1556 ms
 *   mid Android, regular 4G       2264 ms         4088 ms        +1824 ms
 *   low-end Android, slow 4G      3960 ms         6301 ms        +2341 ms
 *
 * The original reasoning — "it never blocks, the page is painting underneath"
 * — was true and irrelevant. A visitor cannot read a headline through an
 * opaque curtain, so a page that is technically ready is still a page that has
 * not said anything yet. Six seconds before this site states what it sells, to
 * a farmer on mobile data, is a bounce.
 *
 * So the curtain now yields to the visitor rather than the other way round:
 *
 * - **Any sign of intent dismisses it instantly** — scroll, tap, key, pointer.
 *   Someone who is already interacting has finished being introduced.
 * - **The cap is 700ms**, down from 1150ms, and it is a ceiling rather than a
 *   duration to fill.
 * - **It is skipped outright on a slow or metered connection**, via the
 *   Network Information API. The visitors most likely to abandon are exactly
 *   the ones who were paying the most for it.
 * - It still runs once per session, never per navigation, and never under
 *   reduced motion.
 *
 * What survives is a brand moment for the desktop visitor who is browsing, and
 * nothing at all for the person on 4G who came for a phone number.
 */

const SESSION_KEY = 'sct-intro-played';
const MAX_MS = 700;

/** True when the connection is slow enough that a flourish is an imposition. */
function connectionIsExpensive() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return false;
  if (c.saveData) return true;
  return /(^|-)2g$|^3g$/.test(String(c.effectiveType || ''));
}

export default function Preloader() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (connectionIsExpensive()) return false;
    try {
      return sessionStorage.getItem(SESSION_KEY) !== '1';
    } catch {
      // Private mode can throw on access; an intro is not worth an exception.
      return false;
    }
  });

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return undefined;

    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* non-fatal */
    }

    const timer = setTimeout(dismiss, MAX_MS);

    /*
      Exit as soon as the curtain has a reason to stop existing.

      The one real job it can do is cover the webfont swap: Fraunces carries
      the headline, and without this the hero visibly re-renders from the
      fallback serif to the display face. Racing `fonts.ready` against the cap
      means the curtain lasts exactly as long as that swap takes — which on a
      warm cache is almost no time at all, instead of a fixed wait everyone
      pays on every first visit.
    */
    document.fonts?.ready.then(dismiss).catch(() => {});

    /*
      Intent beats the timer. `wheel` and `touchstart` are the important two:
      a visitor who has already started scrolling has told you they are past
      the introduction, and holding the curtain over them is the exact moment
      a considered opening becomes an obstacle.
    */
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    events.forEach((e) => window.addEventListener(e, dismiss, { once: true, passive: true }));

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, dismiss));
    };
  }, [visible, dismiss]);

  // The curtain covers the viewport, so the scrollbar must not move under it.
  useEffect(() => {
    if (!visible) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          // aria-hidden: the page underneath is the real content and is already
          // in the accessibility tree. Announcing a decorative curtain would
          // just put a meaningless stop in front of it.
          aria-hidden="true"
          className="fixed inset-0 z-[400] grid place-items-center bg-void"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.5, ease: EASE_CINE }}
        >
          <div className="absolute inset-0 grain opacity-50" />

          {/* The same low sun the hero backdrop uses, so the two are one scene. */}
          <div
            className="absolute inset-x-0 top-1/3 h-1/2 blur-3xl"
            style={{
              background:
                'radial-gradient(45% 80% at 50% 100%, rgb(var(--c-accent) / 0.35), transparent 70%)',
            }}
          />

          <div className="relative flex flex-col items-center gap-5 px-gutter">
            <motion.img
              src="/img/brand/logo-mark.png"
              alt=""
              width="64"
              height="64"
              className="h-14 w-14 rounded-full bg-white/95 object-contain p-2"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE_CINE }}
            />

            <span className="reveal-clip block overflow-hidden">
              <motion.span
                className="display block text-center text-fluid-2xl font-semibold text-cream"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.06, ease: EASE_CINE }}
              >
                {company.name}
              </motion.span>
            </span>

            <span className="block h-px w-32 overflow-hidden bg-cream/20">
              <motion.span
                className="block h-full origin-left bg-sun"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: MAX_MS / 1000, ease: 'linear' }}
              />
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useRef, useState } from 'react';
import { EASE, gsap, isTouch, prefersReducedMotion } from '../lib/motion';
import { useI18n } from '../lib/i18n';

/**
 * A contextual cursor that trails the pointer.
 *
 * The native cursor is deliberately left alone. The usual implementation sets
 * `cursor: none` and redraws the pointer in JS, which throws away every
 * affordance the OS gives for free — the I-beam over text, the hand over
 * links, the resize arrows on inputs — and visibly lags whenever the main
 * thread is busy, which is exactly when a user needs to see where they are
 * pointing. The brief's own instruction applies: do not hide the native cursor
 * if doing so hurts accessibility. So this is additive. It reads as considered
 * polish, and if it ever stutters nothing about using the page changes.
 *
 * States come from the element under the pointer, declared in markup via
 * `data-cursor`:
 *
 *   (none)            idle — a small ring
 *   a, button, input  interactive — the ring widens
 *   data-cursor=view  over an image — the ring fills and reads VIEW
 *   data-cursor=drag  over a scrollable rail — reads DRAG
 *   data-cursor=cta   over a primary action — accent fill
 *
 * `gsap.quickTo` is what keeps it cheap: one compiled setter per axis rather
 * than a new tween allocated on every `pointermove`, which at 120Hz on a
 * trackpad is the difference between a trailing ring and a GC stutter.
 */
export default function CursorRing() {
  const { t } = useI18n();
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const rafRef = useRef(0);
  const [state, setState] = useState('idle');
  const [band, setBand] = useState('light');
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || isTouch()) return undefined;
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    const ring = ringRef.current;
    if (!ring) return undefined;

    const xTo = gsap.quickTo(ring, 'x', { duration: 0.42, ease: EASE.organic });
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.42, ease: EASE.organic });

    let visible = false;

    const onMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      if (!visible) {
        visible = true;
        gsap.to(ring, { autoAlpha: 1, duration: 0.25 });
      }

      /*
        Resolving the element under the pointer is the expensive part, so it is
        throttled to one read per frame rather than one per mousemove event.
      */
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el) return;

        const declared = el.closest('[data-cursor]')?.dataset.cursor;
        if (declared) setState(declared);
        else if (el.closest('a, button, [role="button"], input, select, textarea, label')) {
          setState('interactive');
        } else setState('idle');

        // The ring blends with multiply on light ground and screen on dark, so
        // it has to know which band it is currently over.
        setBand(el.closest('.band-dark, .band-void, [data-band="dark"]') ? 'dark' : 'light');
      });
    };

    const onDown = () => setState((s) => (s === 'idle' ? 'press' : s));
    const onUp = () => setState((s) => (s === 'press' ? 'idle' : s));
    const onLeave = () => {
      visible = false;
      gsap.to(ring, { autoAlpha: 0, duration: 0.2 });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  // Size and fill respond to state. Labelled states grow enough to hold a word.
  useEffect(() => {
    if (!active || !ringRef.current) return;
    const labelled = state === 'view' || state === 'drag' || state === 'explore';
    gsap.to(ringRef.current, {
      scale: labelled ? 1 : state === 'interactive' ? 1.55 : state === 'press' ? 0.8 : 1,
      width: labelled ? 84 : 36,
      height: labelled ? 84 : 36,
      duration: 0.32,
      ease: EASE.organic,
    });
    gsap.to(labelRef.current, { autoAlpha: labelled ? 1 : 0, duration: 0.2 });
  }, [state, active]);

  if (!active) return null;

  const label =
    state === 'view' ? t('a11y.view') : state === 'drag' ? t('a11y.drag') : state === 'explore' ? t('a11y.explore') : '';

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="cursor-ring"
      data-band={band}
      data-state={state}
    >
      <span
        ref={labelRef}
        className="pointer-events-none absolute inset-0 grid place-items-center text-[0.6rem]
                   font-semibold uppercase tracking-[0.16em] opacity-0"
      >
        {label}
      </span>
    </div>
  );
}

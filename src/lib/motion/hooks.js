import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, isTouch, prefersReducedMotion } from './engine';
import { DEPTH, EASE } from './tokens';

/**
 * React bindings for the animation vocabulary.
 *
 * Every hook here runs its GSAP work inside a `gsap.context()` scoped to a
 * ref, and reverts that context on unmount. That is not boilerplate — it is
 * the thing that keeps a client-routed site from leaking. Each ScrollTrigger
 * registers global scroll listeners and holds a reference to its DOM node;
 * without `ctx.revert()` every route change leaves the old page's triggers
 * alive, firing against detached nodes, and the leak compounds with every
 * navigation until scrolling stutters.
 */

/** `useLayoutEffect` in the browser, `useEffect` on the server. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Runs GSAP work scoped to a container ref, cleaning up on unmount.
 *
 *   const ref = useGsap((ctx, el) => { reveal(el.querySelector('h2')) }, [deps])
 */
export function useGsap(setup, deps = []) {
  const scope = useRef(null);

  useIsomorphicLayoutEffect(() => {
    if (!scope.current) return undefined;
    const ctx = gsap.context((self) => setup(self, scope.current), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
}

/**
 * Pointer-driven depth for a hero.
 *
 * Returns a ref to put on the container. Any descendant carrying
 * `data-depth="0.05"` moves by that fraction of the pointer offset, so the
 * layer order is declared in the markup next to the thing it applies to rather
 * than in a list here.
 *
 * `gsap.quickTo` is the reason this is smooth: it compiles a single reusable
 * setter per property instead of allocating a fresh tween on every
 * `pointermove`, which at 120Hz on a trackpad is the difference between a
 * depth effect and a garbage-collection stutter.
 */
export function usePointerDepth({ strength = 1 } = {}) {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isTouch()) return undefined;

    const layers = [...el.querySelectorAll('[data-depth]')].map((node) => ({
      node,
      depth: parseFloat(node.dataset.depth) || DEPTH.content,
      xTo: gsap.quickTo(node, 'x', { duration: 0.8, ease: EASE.organic }),
      yTo: gsap.quickTo(node, 'y', { duration: 0.8, ease: EASE.organic }),
    }));
    if (!layers.length) return undefined;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      // Normalised to [-1, 1] from the centre of the hero.
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      for (const l of layers) {
        l.xTo(nx * l.depth * 100 * strength);
        l.yTo(ny * l.depth * 60 * strength);
      }
    };

    const onLeave = () => layers.forEach((l) => (l.xTo(0), l.yTo(0)));

    window.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return ref;
}

/**
 * Magnetic attraction toward the pointer.
 *
 * Travel is capped at `strength` px so the control never leaves its own hit
 * area — a button that outruns the cursor is a button you cannot click.
 */
export function useMagnetic(strength = 12) {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isTouch()) return undefined;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: EASE.organic });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: EASE.organic });

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      xTo(Math.max(-1, Math.min(1, dx)) * strength);
      yTo(Math.max(-1, Math.min(1, dy)) * strength);
    };
    const reset = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    // A keyboard user can focus this while the pointer sits elsewhere; the
    // offset must not stick.
    el.addEventListener('blur', reset);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset);
      el.removeEventListener('blur', reset);
    };
  }, [strength]);

  return ref;
}

/**
 * Restrained 3D tilt for a card.
 *
 * Capped at ±5deg, per the brief. Beyond that the text on the card starts to
 * keystone visibly and the effect stops reading as depth and starts reading as
 * a gimmick.
 */
export function useTilt({ max = 5 } = {}) {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isTouch()) return undefined;

    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: EASE.organic });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: EASE.organic });
    gsap.set(el, { transformPerspective: 1000, transformStyle: 'preserve-3d' });

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      ry(nx * max);
      rx(-ny * max);
    };
    const reset = () => {
      rx(0);
      ry(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset);
    };
  }, [max]);

  return ref;
}

/**
 * Reports scroll progress through an element, 0 → 1.
 *
 * Used by panels that need to know which step is current. The value is state,
 * so it re-renders; callers should keep the consuming component small.
 */
export function useScrollProgress(ref, { start = 'top top', end = 'bottom bottom' } = {}) {
  const [progress, setProgress] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      onUpdate: (self) => setProgress(self.progress),
    });
    return () => st.kill();
  }, [ref, start, end]);

  return progress;
}

/** Discrete step index derived from scroll progress through a section. */
export function useStepIndex(ref, count, options) {
  const progress = useScrollProgress(ref, options);
  // Clamp before flooring: progress reaches exactly 1 at the end of the pass
  // and would otherwise index one past the last step.
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
}

/** Media query as reactive state, for gating behaviour that CSS cannot. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Refreshes ScrollTrigger after layout settles — call on route change. */
export function useScrollTriggerRefresh(deps = []) {
  const refresh = useCallback(() => ScrollTrigger.refresh(), []);
  useEffect(() => {
    const id = setTimeout(refresh, 120);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return refresh;
}

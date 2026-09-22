import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pauseSmoothScroll, resumeSmoothScroll } from '../lib/motion';

/**
 * Fetches once on mount with an AbortController, and exposes a retry.
 * `fn` must accept an AbortSignal.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const ctrl = new AbortController();
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));

    fnRef
      .current(ctrl.signal)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (err?.name === 'AbortError' || !alive) return;
        setState({ data: null, loading: false, error: err });
      });

    return () => {
      alive = false;
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, retry };
}

/** Counts up to `target` the first time the element enters the viewport. */
export function useCountUp(target, { duration = 1900, enabled = true } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || done.current) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!enabled || reduce) {
      setValue(target);
      done.current = true;
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;
        io.disconnect();

        const start = performance.now();
        let raf;
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          // easeOutExpo — fast start, gentle settle.
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setValue(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.35 }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [target, duration, enabled]);

  return [ref, value];
}

/**
 * Locks body scroll while a modal or mobile menu is open, without layout shift.
 *
 * `overflow: hidden` alone is not enough once Lenis is running: Lenis drives
 * the page from its own rAF loop and does not consult body overflow, so the
 * page carries on scrolling underneath an open dialog. It has to be stopped
 * explicitly and restarted on close.
 */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    pauseSmoothScroll();

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      resumeSmoothScroll();
    };
  }, [locked]);
}

/** Calls `handler` on Escape. */
export function useEscape(handler, active = true) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => e.key === 'Escape' && handler(e);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handler, active]);
}

/** Traps Tab focus inside `ref` while `active`, restoring focus on close. */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const previous = document.activeElement;

    const focusables = () =>
      Array.from(
        root.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const first = focusables()[0];
    (first || root).focus?.();

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [ref, active]);
}

/** True once the page has scrolled past `offset`. */
export function useScrolled(offset = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return scrolled;
}

/** Matches a media query reactively. */
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

/**
 * Live API data with a built-in offline fallback.
 *
 * Every read section follows the same contract: call the live endpoint, map the
 * response into the component's shape, and fall back to the extracted snapshot
 * in src/data if the request fails or returns nothing. The section therefore
 * never renders empty, and `source` tells the caller which one it is showing.
 *
 *   const { data, source, loading, error, retry } = useApiData(getAboutUs, staticAbout, mapAbout)
 */
export function useApiData(fetcher, fallback, mapper) {
  const { data, loading, error, retry } = useAsync(fetcher, []);

  const value = useMemo(() => {
    if (!data) return fallback;
    try {
      const mapped = mapper ? mapper(data) : data;
      const empty =
        mapped == null || (Array.isArray(mapped) && mapped.length === 0);
      return empty ? fallback : mapped;
    } catch {
      // A shape change upstream must not take the section down.
      return fallback;
    }
  }, [data, fallback, mapper]);

  return {
    data: value,
    source: data && value !== fallback ? 'api' : 'fallback',
    loading,
    error,
    retry,
  };
}

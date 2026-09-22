import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger, startSmoothScroll } from '../lib/motion';

/**
 * Owns the Lenis lifecycle and keeps ScrollTrigger honest across routes.
 *
 * Mounted once, above the router. Two jobs:
 *
 * 1. **Start Lenis** — which `startSmoothScroll` will decline to do on touch
 *    or under reduced motion, so this component is safe to mount everywhere.
 *
 * 2. **Refresh ScrollTrigger after navigation.** Every trigger caches the
 *    pixel positions it was created at. A client-side route change replaces
 *    the whole page beneath them without firing a resize, so without a refresh
 *    the new page's triggers fire at the *old* page's offsets — pinned
 *    sections engage early, reveals fire off-screen, and the further apart the
 *    two page heights are, the worse it gets.
 *
 *    The refresh is deferred twice: once past the route's paint, and again
 *    after fonts settle, because Fraunces loading changes heading heights and
 *    therefore every offset below them.
 */
export default function SmoothScroll({ children }) {
  const location = useLocation();

  useEffect(() => startSmoothScroll(), []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    const settle = setTimeout(() => ScrollTrigger.refresh(), 320);
    let cancelled = false;
    document.fonts?.ready
      .then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [location.pathname]);

  return children;
}

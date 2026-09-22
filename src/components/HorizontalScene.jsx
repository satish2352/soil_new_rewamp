import { useRef } from 'react';
import { BP, gsap, horizontalScroll, scrollTo, useGsap, useMediaQuery } from '../lib/motion';

/**
 * A horizontal scene driven by vertical scroll.
 *
 * ScrollTrigger pins the frame and scrubs the track sideways; the page's own
 * scroll is the only input. Nothing is intercepted and no wheel event is
 * swallowed, so a user who flicks hard moves through the scene fast and out
 * the other side rather than being held in it.
 *
 * Three things it has to get right:
 *
 * 1. **Travel is measured, not assumed.** Track width depends on webfont
 *    loading and image sizing, so the distance is read from the DOM and
 *    `invalidateOnRefresh` re-reads it on resize. A hard-coded figure leaves
 *    either dead scroll at the end or content that never reaches the edge.
 *
 * 2. **Keyboard focus must drive the scene.** The track moves by `transform`,
 *    so tabbing to a card currently off to the right gives the browser nothing
 *    to scroll — `scrollIntoView` finds no scrollable ancestor and the focus
 *    ring lands somewhere invisible. The focus handler converts the card's
 *    horizontal offset back into the page scroll position that brings it into
 *    view, so tabbing walks the scene sideways.
 *
 * 3. **It must not run on touch or under reduced motion.** Pinning fights a
 *    touch device's own scroll physics, and the effect is decoration — so
 *    phones and anyone who asked for less motion get a plain swipeable rail,
 *    which is the better interaction there anyway. `horizontalScroll` already
 *    declines under reduced motion; the media query handles the rest.
 */
export default function HorizontalScene({ children, className = '', trackClassName = '' }) {
  const frameRef = useRef(null);
  const trackRef = useRef(null);
  /*
    Width *and* motion preference, both.

    Gating on width alone left a hole: at 1440px with reduced motion on, this
    rendered the pinned markup, but `horizontalScroll` correctly declined to
    animate — so the track sat at x=0 inside an `overflow-hidden` frame and
    every card past the first screen was clipped with no way to reach it. The
    effect degraded; the content disappeared with it.
  */
  const enabled = useMediaQuery(
    `(min-width: ${BP.lg}px) and (prefers-reduced-motion: no-preference)`
  );

  const scope = useGsap(() => {
    if (!enabled) return undefined;
    const frame = frameRef.current;
    const track = trackRef.current;
    if (!frame || !track) return undefined;

    const tween = horizontalScroll(frame, track);
    const st = tween?.scrollTrigger;
    if (!st) return undefined;

    const onFocusIn = (event) => {
      const card = event.target.closest('[data-scene-item]');
      if (!card) return;
      const distance = Math.max(1, track.scrollWidth - frame.offsetWidth);
      const progress = Math.min(
        1,
        Math.max(0, (card.offsetLeft - frame.offsetWidth * 0.1) / distance)
      );
      // Through the motion system so Lenis, when it owns the scroll, agrees.
      scrollTo(st.start + progress * (st.end - st.start));
    };

    frame.addEventListener('focusin', onFocusIn);
    return () => frame.removeEventListener('focusin', onFocusIn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, gsap.utils.toArray(children).length]);

  if (!enabled) {
    return (
      <div className={`rail rail-fade gap-5 pb-4 ${className}`} tabIndex={0} role="region">
        {children}
      </div>
    );
  }

  return (
    <div ref={scope}>
      <div
        ref={frameRef}
        className={`relative flex h-screen items-center overflow-hidden ${className}`}
      >
        {/*
          `w-max` lets the track size to its contents so it can overflow the
          frame; `[&>*]:shrink-0` stops flex compressing the cards back down to
          fit, which would defeat it.
        */}
        <div ref={trackRef} className={`flex w-max gap-6 [&>*]:shrink-0 ${trackClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

import { gsap, ScrollTrigger, prefersReducedMotion } from './engine';
import { CLIP, DIST, DUR, EASE, GAP, SCALE, TRIGGER } from './tokens';

/**
 * The animation vocabulary.
 *
 * Every function here takes a DOM element and returns a GSAP tween/timeline,
 * or `null` when motion is reduced. They are the only places tweens are
 * written; sections choose from this list rather than authoring their own.
 *
 * All of them are safe to call when motion is reduced — they set the final
 * state immediately and return null, so content is never left invisible. That
 * contract matters more than it looks: a reveal that silently does nothing
 * under reduced motion leaves `opacity: 0` on screen forever.
 */

/* ------------------------------------------------------------------ text */

/**
 * Splits an element's text into lines/words/chars for staggered animation.
 *
 * Hand-rolled rather than GSAP's SplitText, which is a paid Club plugin — this
 * covers the cases the design actually uses and keeps the dependency set to
 * what a fresh `npm install` can resolve.
 *
 * Two details that matter:
 *
 * - The original string is preserved in an `sr-only` span and the split output
 *   is `aria-hidden`. A headline split into 40 spans is announced by some
 *   screen readers as 40 separate items.
 * - `chars` still wraps whole words in their own mask. Masking each character
 *   individually clips the side bearings of italics and the connecting strokes
 *   of Devanagari, so letters visibly lose their edges as they move.
 *
 * Returns `{ targets, revert }`.
 */
export function splitText(el, { type = 'words', srOnly = true } = {}) {
  if (!el) return { targets: [], revert: () => {} };

  /*
    Idempotent, deliberately.

    React StrictMode double-invokes effects in development, and this function
    mutates the DOM rather than rendering — so the second pass read an element
    that had already been split. `textContent` on a split element returns the
    sr-only copy *plus* the visual copy concatenated, which it then split
    again: the hero headline rendered twice, at display size, one string welded
    to the next. Restoring the stashed original first makes a re-run a no-op
    instead of a doubling, and covers route changes and hot reloads too.
  */
  if (el.dataset.splitOriginal !== undefined) {
    el.innerHTML = el.dataset.splitOriginal;
  } else {
    el.dataset.splitOriginal = el.innerHTML;
  }

  const original = el.textContent;
  const html = el.dataset.splitOriginal;

  const makeMask = (child) => {
    const mask = document.createElement('span');
    mask.className = 'reveal-clip inline-block align-bottom';
    const inner = document.createElement('span');
    inner.className = 'inline-block will-change-transform';
    inner.appendChild(child);
    mask.appendChild(inner);
    return { mask, inner };
  };

  const frag = document.createDocumentFragment();
  const targets = [];

  if (type === 'lines') {
    for (const line of original.split('\n')) {
      const wrap = document.createElement('span');
      wrap.className = 'reveal-clip block';
      const inner = document.createElement('span');
      inner.className = 'block will-change-transform';
      inner.textContent = line;
      wrap.appendChild(inner);
      frag.appendChild(wrap);
      targets.push(inner);
    }
  } else {
    const words = original.split(' ');
    words.forEach((word, i) => {
      if (type === 'chars') {
        const mask = document.createElement('span');
        mask.className = 'reveal-clip inline-block align-bottom';
        [...word].forEach((ch) => {
          const span = document.createElement('span');
          span.className = 'inline-block will-change-transform';
          span.textContent = ch;
          mask.appendChild(span);
          targets.push(span);
        });
        frag.appendChild(mask);
      } else {
        const { mask, inner } = makeMask(document.createTextNode(word));
        frag.appendChild(mask);
        targets.push(inner);
      }
      if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });
  }

  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  visual.appendChild(frag);

  el.textContent = '';

  /*
    `srOnly: false` is for callers that already render their own accessible
    copy — the hero splits two line elements that sit inside one aria-hidden
    wrapper, so adding a screen-reader span per line would announce the
    headline twice more.
  */
  if (srOnly) {
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = original;
    el.appendChild(sr);
  }

  el.appendChild(visual);

  return {
    targets,
    revert: () => {
      el.innerHTML = html;
      delete el.dataset.splitOriginal;
    },
  };
}

/** Masked upward reveal of split text, on scroll. */
export function textReveal(el, { type = 'words', trigger, delay = 0, stagger = GAP.normal } = {}) {
  if (!el) return null;
  if (prefersReducedMotion()) return null;

  const { targets } = splitText(el, { type });
  if (!targets.length) return null;

  return gsap.fromTo(
    targets,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: DUR.cine,
      ease: EASE.cine,
      delay,
      stagger,
      scrollTrigger: trigger === null ? undefined : { trigger: trigger || el, ...TRIGGER.reveal },
    }
  );
}

/**
 * Scroll-scrubbed typography: the heading keeps moving with the scroll rather
 * than playing once. Reserved for section transitions where the text is meant
 * to feel attached to the page rather than placed on it.
 */
export function textScrub(el, { yFrom = 40, yTo = -40 } = {}) {
  if (!el || prefersReducedMotion()) return null;
  return gsap.fromTo(
    el,
    { y: yFrom },
    { y: yTo, ease: EASE.linear, scrollTrigger: { trigger: el, ...TRIGGER.pass } }
  );
}

/* ----------------------------------------------------------------- block */

/** Reveal A — fade and translate. The default, used where nothing else fits. */
export function reveal(el, { y = DIST.md, delay = 0, trigger } = {}) {
  if (!el) return null;
  if (prefersReducedMotion()) {
    gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform' });
    return null;
  }
  return gsap.fromTo(
    el,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration: DUR.slow,
      ease: EASE.organic,
      delay,
      scrollTrigger: { trigger: trigger || el, ...TRIGGER.reveal },
    }
  );
}

/** Reveal D — stagger a set of children. */
export function staggerReveal(els, { y = DIST.md, stagger = GAP.loose, trigger } = {}) {
  const list = Array.from(els || []);
  if (!list.length) return null;
  if (prefersReducedMotion()) {
    gsap.set(list, { opacity: 1, y: 0, clearProps: 'transform' });
    return null;
  }
  return gsap.fromTo(
    list,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration: DUR.slow,
      ease: EASE.organic,
      stagger,
      scrollTrigger: { trigger: trigger || list[0].parentElement, ...TRIGGER.reveal },
    }
  );
}

/**
 * Reveal E — image clip reveal with counter-scale.
 *
 * `el` is the frame; its first element child is the picture. The picture
 * starts oversized and settles to 1 while the frame's clip opens, so the image
 * appears to come to rest rather than to slide in.
 */
export function imageReveal(el, { from = 'down', delay = 0 } = {}) {
  if (!el) return null;
  const inner = el.firstElementChild;
  if (prefersReducedMotion()) {
    gsap.set(el, { clipPath: CLIP.shown, opacity: 1 });
    if (inner) gsap.set(inner, { scale: 1 });
    return null;
  }

  const hidden =
    from === 'left' ? CLIP.hiddenLeft : from === 'right' ? CLIP.hiddenRight : CLIP.hiddenDown;

  const tl = gsap.timeline({
    delay,
    scrollTrigger: { trigger: el, ...TRIGGER.reveal },
  });

  tl.fromTo(el, { clipPath: hidden }, { clipPath: CLIP.shown, duration: DUR.cine, ease: EASE.cine }, 0);
  if (inner) {
    tl.fromTo(inner, { scale: SCALE.imageFrom }, { scale: 1, duration: DUR.epic, ease: EASE.cine }, 0);
  }
  return tl;
}

/** Reveal C — scale up into place. */
export function scaleReveal(el, { from = 0.92, delay = 0 } = {}) {
  if (!el) return null;
  if (prefersReducedMotion()) {
    gsap.set(el, { opacity: 1, scale: 1 });
    return null;
  }
  return gsap.fromTo(
    el,
    { opacity: 0, scale: from },
    {
      opacity: 1,
      scale: 1,
      duration: DUR.cine,
      ease: EASE.cine,
      delay,
      scrollTrigger: { trigger: el, ...TRIGGER.reveal },
    }
  );
}

/* ----------------------------------------------------------------- depth */

/**
 * Reveal G — parallax. `speed` is a fraction of the element's scroll pass, so
 * the values in `DEPTH` read as plane distances rather than pixel amounts.
 */
export function parallax(el, { speed = 0.12, axis = 'y' } = {}) {
  if (!el || prefersReducedMotion()) return null;
  const travel = () => el.offsetHeight * speed;
  return gsap.fromTo(
    el,
    { [axis]: () => travel() },
    {
      [axis]: () => -travel(),
      ease: EASE.linear,
      scrollTrigger: { trigger: el.parentElement || el, ...TRIGGER.pass, invalidateOnRefresh: true },
    }
  );
}

/** Scales an element across its scroll pass — used for oversized visuals. */
export function scaleOnScroll(el, { from = 1, to = 1.12 } = {}) {
  if (!el || prefersReducedMotion()) return null;
  return gsap.fromTo(
    el,
    { scale: from },
    { scale: to, ease: EASE.linear, scrollTrigger: { trigger: el, ...TRIGGER.pass } }
  );
}

/* ------------------------------------------------------------------- pin */

/**
 * Pins a section and returns a scrubbed timeline for its choreography.
 *
 * `end` is expressed in viewport heights so the runway scales with the screen
 * rather than being a fixed pixel figure that is generous on a laptop and
 * endless on a tall monitor.
 *
 * Under reduced motion nothing is pinned at all — a pin is a scroll behaviour,
 * and holding the page still is exactly what someone with vestibular
 * sensitivity asked not to happen.
 */
export function pinSection(el, { screens = 1.5, onUpdate } = {}) {
  if (!el || prefersReducedMotion()) return null;
  return gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top top',
      end: () => `+=${window.innerHeight * screens}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: onUpdate ? (self) => onUpdate(self.progress) : undefined,
    },
  });
}

/**
 * Horizontal scroll: vertical scrolling drives a track sideways.
 *
 * The distance is measured from the DOM on every refresh rather than assumed.
 * Track width depends on webfont loading and image sizing, so a hard-coded
 * figure leaves either dead scroll at the end or content that never reaches
 * the left edge.
 */
export function horizontalScroll(container, track, { extra = 0.2 } = {}) {
  if (!container || !track || prefersReducedMotion()) return null;

  const distance = () => Math.max(0, track.scrollWidth - container.offsetWidth);

  return gsap.to(track, {
    x: () => -distance(),
    ease: EASE.linear,
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: () => `+=${distance() + window.innerHeight * extra}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
}

/** Refreshes ScrollTrigger once layout has settled (fonts, images, routes). */
export function refresh() {
  ScrollTrigger.refresh();
}

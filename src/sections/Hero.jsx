import { useEffect, useRef, useState } from 'react';
import { hero, stats } from '../data/site';
import { useI18n } from '../lib/i18n';
import {
  CLIP,
  DEPTH,
  DUR,
  EASE,
  GAP,
  gsap,
  prefersReducedMotion,
  splitText,
  useGsap,
  usePointerDepth,
} from '../lib/motion';
import { HERO_SCENES } from '../components/HeroScenes';
import MagneticButton from '../components/MagneticButton';
import Icon from '../components/Icon';

const ROTATE_MS = 6500;

/**
 * Hero — the opening scene.
 *
 * Content is unchanged and is the client's: their headline (typo and all),
 * their sub-line, their Shop Now CTA, and three figures drawn from the same data as the stats band.
 *
 * Five layers, as the brief specifies:
 *
 *   1  designed backdrop, drawn in CSS          data-depth 0.05
 *   2  illustrated banner scenes (HeroScenes)    data-depth 0.08
 *   3  the headline and copy                    data-depth 0.02
 *   4  scroll-driven camera push and veil
 *   5  pointer parallax across all of the above
 *
 * The entrance is one GSAP timeline rather than a dozen independent delays, so
 * the choreography is readable in one place and can be retimed by moving a
 * single position parameter. The scroll response is a separate scrubbed
 * timeline — the intro plays once, the camera keeps working for as long as the
 * hero is on screen.
 *
 * Everything animated here is a transform, an opacity or a clip-path, so the
 * whole scene composites on the GPU and never touches layout.
 */
export default function Hero({ onCta }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  // One ref per headline line: each is split separately so the accent colour
  // on the second line survives, which a single-string split cannot preserve.
  const lineRefs = useRef([]);

  // Layer 5: pointer parallax. Reads `data-depth` off descendants.
  const depthRef = usePointerDepth({ strength: 1 });

  // The CMS cover posters are packshots with their own headlines, so the
  // slider uses illustrated scenes made for this slot instead.
  const images = HERO_SCENES;

  // Keyed on `index`, so picking a slide by hand restarts its full dwell time.
  useEffect(() => {
    if (images.length < 2) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % images.length), ROTATE_MS);
    return () => clearTimeout(id);
  }, [index, images.length]);

  const scope = useGsap((ctx, root) => {
    const q = gsap.utils.selector(root);

    /*
      Reduced motion: put everything in its final state and stop. Not a faster
      intro — no intro, no camera, no veil.
    */
    if (prefersReducedMotion()) {
      gsap.set(q('[data-intro]'), { opacity: 1, y: 0, clipPath: CLIP.shown });
      return;
    }

    // ---------------------------------------------------- entrance timeline
    /*
      Split per line and concatenate, so the two lines share one continuous
      stagger while keeping their own colour. Splitting the whole headline as
      one string would flatten the second line back to the body colour.
    */
    const chars = lineRefs.current
      .filter(Boolean)
      .flatMap((node) => splitText(node, { type: 'chars', srOnly: false }).targets);

    /*
      `fromTo` throughout, never `from`.

      `gsap.from()` reads the element's *current* value as the animation's end
      state. That is fine once, and a trap on any re-run: this effect re-fires
      when the slide data resolves, `ctx.revert()` kills the in-flight
      timeline, and the replacement `from()` then reads the leftover
      `opacity: 0` as its destination — so it dutifully animated 0 to 0 and the
      hero CTAs never appeared. `fromTo` states both ends explicitly and is
      therefore idempotent no matter what the DOM was left holding.
    */
    const tl = gsap.timeline({ defaults: { ease: EASE.cine } });

    tl.fromTo(
      q('[data-intro="backdrop"]'),
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1, duration: DUR.epic },
      0
    )
      .fromTo(
        q('[data-intro="eyebrow"]'),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: DUR.slow },
        0.15
      )
      // The headline assembles from its own masks — the loudest moment, and
      // the only character-level reveal in the system.
      .fromTo(
        chars,
        { yPercent: 115 },
        { yPercent: 0, duration: DUR.cine, stagger: GAP.tight },
        0.25
      )
      .fromTo(
        q('[data-intro="cta"]'),
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: DUR.slow, stagger: GAP.normal },
        0.75
      )
      .fromTo(
        q('[data-intro="stats"]'),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: DUR.slow },
        0.9
      )
      .fromTo(q('[data-intro="index"]'), { opacity: 0 }, { opacity: 1, duration: DUR.slow }, 1.0)
      .fromTo(q('[data-intro="cue"]'), { opacity: 0 }, { opacity: 1, duration: DUR.slow }, 1.1);

    // ------------------------------------------------------- scroll camera
    gsap
      .timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      })
      // The plate pushes in and drifts down as the hero leaves.
      .to(q('[data-camera]'), { scale: 1.16, yPercent: 14, ease: 'none' }, 0)
      // A veil closes over it, so the hero hands off rather than scrolling away.
      .to(q('[data-veil]'), { opacity: 0.8, ease: 'none' }, 0)
      .to(q('[data-copy]'), { y: -70, opacity: 0, ease: 'none' }, 0);
    /*
      Deps are empty on purpose. The camera animates the wrapper, not the
      individual slides, so nothing here depends on the carousel data — and
      re-running the whole context every time the API resolves is what created
      the `from()` problem above in the first place.
    */
  }, []);

  return (
    <section
      ref={(node) => {
        scope.current = node;
        depthRef.current = node;
      }}
      className="band-void relative isolate flex min-h-[clamp(38rem,100svh,60rem)] flex-col justify-end overflow-hidden"
      aria-label="Soil Charger Technology"
    >
      {/*
        Layers 1 and 2 share one transformed wrapper so the backdrop, the
        photographs and the grain push in together as a single plane.
        Animating them apart reads as parallax between things that are meant to
        be the same distance away.
      */}
      <div aria-hidden="true" data-camera className="absolute inset-0 -z-30">
        <div data-intro="backdrop" data-depth={DEPTH.background} className="absolute inset-[-4%]">
          {/*
            Designed backdrop, drawn in CSS. It sits beneath the cover photos
            and shows through whenever one fails to load — at the time of
            writing every CMS upload on the API host returns 404, so without
            this the hero would be a flat dark band. It is abstract
            soil-and-field colour, not a photograph, so it makes no claim about
            any particular farm.
          */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b4a32] via-[#12301f] to-[#2b1f16]" />
          <div
            className="absolute inset-x-0 top-[28%] h-[44%] blur-2xl"
            style={{
              background:
                'radial-gradient(48% 90% at 68% 100%, rgb(var(--c-accent) / 0.5), transparent 72%)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[42%]"
            style={{
              background:
                'linear-gradient(180deg, transparent, rgb(var(--c-soil) / 0.7) 42%, rgb(var(--c-soil) / 0.92))',
            }}
          />
          {/* Field rows, receding toward the horizon. */}
          <div
            className="absolute inset-x-[-20%] bottom-0 h-[34%] opacity-15"
            style={{
              backgroundImage:
                'repeating-linear-gradient(97deg, rgb(var(--c-cream)) 0 2px, transparent 2px 58px)',
              transform: 'perspective(340px) rotateX(58deg)',
              transformOrigin: 'bottom',
            }}
          />
        </div>

        {/* Layer 2 — the illustrated scenes, on a nearer plane. */}
        <div data-depth={DEPTH.content} className="absolute inset-[-3%]">
          {images.map(({ id, Scene }, i) => (
            <div
              key={id}
              className={`absolute inset-0 transition-[opacity,transform] ease-in-out ${
                i === index ? 'scale-105 opacity-100 duration-[1600ms,7000ms]' : 'scale-100 opacity-0 duration-[1600ms]'
              }`}
            >
              <Scene />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 grain opacity-55" />
      </div>

      {/* Legibility wash — dense where the copy sits, opening up to the right. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-gradient-to-r from-void/95 via-void/65 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-20 h-2/5 bg-gradient-to-t from-void/90 via-void/40 to-transparent"
      />
      
      {/* The closing veil: the scene dims as it hands off to the next section. */}
      <div aria-hidden="true" data-veil className="absolute inset-0 -z-10 bg-void opacity-0" />

      <div data-copy className="shell relative w-full pb-20 pt-36 sm:pb-24 sm:pt-44">
        <div className="max-w-5xl" data-depth="0.02">
          <p
            data-intro="eyebrow"
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-cream/25 bg-cream/8
                       px-4 py-2 text-fluid-xs font-semibold uppercase tracking-[0.16em] text-cream/90 backdrop-blur-md"
          >
            <Icon name="leaf" size={15} className="text-leaf" />
            {hero.subtitle}
          </p>

          {/*
            Split into characters by the motion system at run time rather than
            in markup, so the source stays one readable string and a translated
            headline splits correctly too. `splitText` keeps the original in an
            sr-only span and hides the pieces from assistive tech.
          */}
          <h1
            data-intro="headline"
            className="display text-[clamp(2.4rem,1.5rem+3vw,4.25rem)] font-semibold text-cream"
          >
            {/*
              The accessible copy is the whole headline as one string. The
              visible lines are aria-hidden because `splitText` replaces each
              with per-character spans, and a headline split into 69 nodes is
              announced by some screen readers as 69 separate items.
            */}
            <span className="sr-only">{hero.titleLines.join(' ')}</span>
            <span aria-hidden="true">
              {hero.titleLines.map((line, i) => (
                <span
                  key={line}
                  ref={(node) => {
                    lineRefs.current[i] = node;
                  }}
                  className={`block ${i === 1 ? 'text-sun' : ''}`}
                >
                  {line}
                </span>
              ))}
            </span>
          </h1>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton
              data-intro="cta"
              data-cursor="cta"
              onClick={onCta}
              className="btn-accent btn-sweep !px-8 !py-4 text-fluid-base"
            >
              {t('cta.shopNow')}
              <Icon name="arrowRight" size={18} />
            </MagneticButton>
            <MagneticButton
              data-intro="cta"
              to="/products"
              strength={7}
              className="btn !px-8 !py-4 border border-cream/30 text-cream hover:border-sun hover:bg-cream/10"
            >
              {t('nav.products')}
            </MagneticButton>
          </div>

          {/*
            Two columns on a phone, three from `sm`. At 390px a three-column
            rail leaves about 85px of content per cell and "10,00,000+" needs
            roughly 120px, so the widest figure on the site was having its "+"
            sliced off. The last cell spans the full width on phones so the row
            does not end on a hole.
          */}
          <dl
            data-intro="stats"
            className="mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl bg-cream/15 sm:grid-cols-3"
          >
            {stats.slice(0, 3).map((s) => (
              <div
                key={s.key}
                className="bg-void/60 px-4 py-4 backdrop-blur-sm last:col-span-2 sm:px-5 sm:last:col-span-1"
              >
                <dd className="display text-fluid-xl font-semibold tabular-nums text-cream">
                  {s.value.toLocaleString('en-IN')}
                  {s.suffix}
                </dd>
                {/* `break-words`, not `wrap-anywhere`: anywhere-breaking split
                    "SUBSCRIBER" mid-word. */}
                <dt className="mt-1 break-words text-fluid-xs uppercase tracking-[0.14em] text-cream/55">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/*
          Slide index. A numbered rail rather than dots: it names where you are
          in a way dots cannot, and the fill doubles as the rotation timer.
        */}
        {images.length > 1 && (
          <div
            data-intro="index"
            role="tablist"
            aria-label="Hero slides"
            className="mt-12 flex items-center gap-1"
          >
            {images.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1} of ${images.length}`}
                onClick={() => setIndex(i)}
                className="group flex min-h-[44px] items-center gap-2.5 px-2"
              >
                <span
                  aria-hidden="true"
                  className={`micro transition-colors duration-500 ${
                    i === index ? 'text-sun' : 'text-cream/40 group-hover:text-cream/70'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  aria-hidden="true"
                  className={`block h-px transition-all duration-cine ease-cine ${
                    i === index ? 'w-12 bg-sun' : 'w-4 bg-cream/30 group-hover:bg-cream/55'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/*
        Scroll cue, desktop only, and that is measured rather than an oversight.
        On phones the hero content is 925px against a 640-915px viewport, so it
        is already visibly cut off — a stronger "there is more" signal than a
        label. A cue below that content lands at ~845px, under the fold on
        every handset except the tallest.
      */}
      <div
        aria-hidden="true"
        data-intro="cue"
        className="pointer-events-none absolute right-gutter top-1/2 hidden -translate-y-1/2
                   flex-col items-center gap-4 text-cream/45 lg:flex"
      >
        <span className="micro [writing-mode:vertical-rl]">{t('a11y.scroll')}</span>
        <span className="relative block h-16 w-px overflow-hidden bg-cream/20">
          <span className="absolute inset-x-0 top-0 block h-1/2 animate-cue bg-sun" />
        </span>
      </div>
    </section>
  );
}

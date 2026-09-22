import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import staticSlides from '../data/slides.json';
import { getSlides } from '../lib/api';
import { useApiData } from '../hooks';
import { hero, stats } from '../data/site';
import { useI18n } from '../lib/i18n';
import { EASE, useParallax } from '../lib/motion';
import { SmartImage } from '../components/ui';
import { hasLocalCopy } from '../lib/images';
import Icon from '../components/Icon';

const ROTATE_MS = 6500;

/** Keeps only slides whose image the mirror or the server can actually serve. */
function mapSlides(rows) {
  const usable = (rows || [])
    .filter((r) => r.photo_one && r.photopath && !r.photopath.endsWith('/'))
    .map((r) => ({ id: r.id, image: r.photopath }))
    .filter((s) => hasLocalCopy(s.image));
  return usable.length ? usable : null;
}

/**
 * Hero. Keeps the existing headline, sub-line and Shop Now CTA, and reuses the
 * cover images the CMS already serves — the two records with a null photo are
 * filtered out upstream, so no blank slide can appear.
 */
export default function Hero({ onCta }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const { ref, y } = useParallax(50);

  // Live cover slides; the API already filters records with no photo.
  const { data: slides } = useApiData(getSlides, staticSlides, mapSlides);
  const images = slides?.length ? slides : [];

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[clamp(34rem,88svh,52rem)] items-end overflow-hidden bg-deep"
      aria-label="Soil Charger Technology"
    >
      {/*
        Designed backdrop, drawn in CSS. It sits beneath the cover photos and
        shows through whenever a cover fails to load — at the time of writing
        every CMS upload on the API host returns 404, so without this the hero
        would be a flat dark band. It is abstract soil-and-field colour, not a
        photograph, so it makes no claim about any particular farm.
      */}
      <div aria-hidden="true" className="absolute inset-0 -z-30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#20563a] via-[#17402b] to-[#33251a]" />
        {/* Low sun on the horizon. */}
        <div
          className="absolute inset-x-0 top-[30%] h-[42%] blur-2xl"
          style={{
            background:
              'radial-gradient(48% 90% at 68% 100%, rgb(var(--c-accent) / 0.5), transparent 72%)',
          }}
        />
        {/* Soil strata across the lower third. */}
        <div
          className="absolute inset-x-0 bottom-0 h-[42%]"
          style={{
            background:
              'linear-gradient(180deg, transparent, rgb(var(--c-soil) / 0.7) 42%, rgb(var(--c-soil) / 0.92))',
          }}
        />
        {/* Field rows, receding toward the horizon. */}
        <div
          className="absolute inset-x-[-20%] bottom-0 h-[34%] opacity-[0.16]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(97deg, rgb(var(--c-cream)) 0 2px, transparent 2px 58px)',
            transform: 'perspective(340px) rotateX(58deg)',
            transformOrigin: 'bottom',
          }}
        />
        <div className="absolute inset-0 grain opacity-[0.5]" />
      </div>

      {/* Slow cross-fade between the existing cover photos. */}
      <div className="absolute inset-0 -z-20">
        {images.map((s, i) => (
          <motion.div
            key={s.id}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === index ? 1 : 0 }}
            transition={{ duration: reduce ? 0.3 : 1.5, ease: 'easeInOut' }}
            aria-hidden={i !== index}
          >
            <motion.div
              className="h-full w-full"
              initial={{ scale: 1.08 }}
              animate={{ scale: i === index && !reduce ? 1 : 1.08 }}
              transition={{ duration: 9, ease: 'linear' }}
            >
              <SmartImage
                src={s.image}
                alt=""
                ratio="auto"
                loading={i === 0 ? 'eager' : 'lazy'}
                fallback="none"
                className="!h-full"
                imgClassName="object-cover"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Legibility wash — dark at the bottom where the copy sits. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-deep via-deep/80 to-deep/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-deep/85 to-transparent"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 grain opacity-60" />

      {/* Drifting organic shapes — deliberately faint. */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden="true"
            style={{ y }}
            className="parallax-layer pointer-events-none absolute -left-20 top-24 -z-10 h-64 w-64 blob bg-leaf/12 blur-2xl"
          />
          <motion.div
            aria-hidden="true"
            style={{ y }}
            className="parallax-layer pointer-events-none absolute -right-16 top-1/3 -z-10 h-80 w-80 blob bg-sun/8 blur-3xl animate-drift"
          />
        </>
      )}

      <div className="shell relative w-full pb-14 pt-36 sm:pb-20 sm:pt-44">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-cream/25 bg-cream/10
                       px-4 py-2 text-fluid-xs font-semibold uppercase tracking-[0.16em] text-cream/90 backdrop-blur-md"
          >
            <Icon name="leaf" size={15} className="text-leaf" />
            {hero.subtitle}
          </motion.p>

          {/* Headline reveals line by line. The exact wording is the client's. */}
          <h1 className="font-display text-fluid-4xl font-semibold leading-[1.05] text-cream">
            <span className="sr-only">{hero.titleLines.join(' ')}</span>
            <span aria-hidden="true">
              {hero.titleLines.map((line, i) => (
                <span key={line} className="reveal-clip block">
                  <motion.span
                    className="block"
                    initial={reduce ? { opacity: 0 } : { y: '106%' }}
                    animate={reduce ? { opacity: 1 } : { y: 0 }}
                    transition={{ duration: 0.95, delay: 0.25 + i * 0.13, ease: EASE }}
                  >
                    {i === 1 ? (
                      <span className="text-sun">{line}</span>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button type="button" onClick={onCta} className="btn-accent !px-7 !py-3.5 text-fluid-base">
              {t('cta.shopNow')}
              <Icon name="arrowRight" size={18} />
            </button>
            <Link to="/products" className="btn !px-7 !py-3.5 border border-cream/30 text-cream hover:bg-cream/10">
              {t('nav.products')}
            </Link>
          </motion.div>

          {/* Two strongest figures, pulled from the same data as the stats band. */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-cream/15 pt-7"
          >
            {stats.slice(0, 3).map((s) => (
              <div key={s.key}>
                <dt className="text-fluid-xs uppercase tracking-[0.14em] text-cream/55">{s.label}</dt>
                <dd className="font-display text-fluid-xl font-semibold text-cream">
                  {s.value.toLocaleString('en-IN')}
                  {s.suffix}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Slide dots */}
        {images.length > 1 && (
          <div className="mt-7 flex gap-1" role="tablist" aria-label="Hero slides">
            {images.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className="group flex h-11 items-center px-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-500 ease-organic
                              ${i === index ? 'w-10 bg-sun' : 'w-4 bg-cream/35 group-hover:bg-cream/60'}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Organic ground edge into the next section. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-10 w-full text-canvas sm:h-16"
      >
        <path
          fill="currentColor"
          d="M0 80h1440V34c-160 26-330 38-520 26S560 22 380 30 120 52 0 34z"
        />
      </svg>
    </section>
  );
}

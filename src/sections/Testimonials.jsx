import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import staticTestimonials from '../data/testimonials.json';
import { featuredVideo } from '../data/site';
import { getTestimonials } from '../lib/api';
import { useAsync } from '../hooks';
import { htmlToText } from '../lib/cms-html';
import { useI18n } from '../lib/i18n';
import { DUR, EASE_CINE, Reveal, motion, useReducedMotion } from '../lib/motion-react';
import { SmartImage } from '../components/ui';
import Icon from '../components/Icon';

const AUTO_MS = 8000;

/** Splits the CMS title, which packs "Name, place, place  phone" into one field. */
function normalise(row) {
  const title = htmlToText(row.title);
  const phone = (title.match(/(\d[\d\s-]{8,})\s*$/) || [])[1];
  const withoutPhone = phone ? title.slice(0, title.lastIndexOf(phone)).trim() : title;
  const parts = withoutPhone.split(',').map((s) => s.trim()).filter(Boolean);

  return {
    id: row.id,
    name: parts[0] || withoutPhone,
    location: parts.slice(1).join(', ') || null,
    quote: htmlToText(row.content),
    image: row.photopath || null,
    language: String(row.language || '').toLowerCase().startsWith('mar') ? 'mr' : 'en',
  };
}

/**
 * Voices from the field.
 *
 * Presentation change: this was a portrait beside a quote, both the same
 * weight, in a card-shaped block like everything else. A testimonial is the one
 * place on a site where someone else is speaking, and it should read that way —
 * so the quote is now set as a full-measure pull quote at display size, and the
 * attribution sits underneath as a small, quiet line with the portrait.
 *
 * The rotation keeps every guard the previous version had: it pauses on hover
 * and on focus, it stops entirely under reduced motion, and the arrows stay
 * available regardless.
 */
export default function Testimonials() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const { data } = useAsync(getTestimonials, []);
  const items = data?.length ? data.map(normalise) : staticTestimonials;

  const go = useCallback(
    (dir) => setIndex((i) => (i + dir + items.length) % items.length),
    [items.length]
  );

  useEffect(() => {
    if (paused || reduce || items.length < 2) return;
    const id = setInterval(() => go(1), AUTO_MS);
    return () => clearInterval(id);
  }, [paused, reduce, items.length, go]);

  if (!items.length) return null;
  const current = items[Math.min(index, items.length - 1)];

  return (
    <section
      className="section relative bg-cream/55"
      aria-labelledby="testimonials-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 bottom-0 h-[22rem] w-[22rem] blob bg-primary/6" />
      </div>

      <div className="shell relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal as="p" className="eyebrow" duration={0.5}>
            {t('section.testimonials')}
          </Reveal>

          <Reveal delay={0.05}>
            <a
              href={featuredVideo.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 text-fluid-sm font-semibold text-primary
                         transition-colors hover:text-deep"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-full border border-line pl-0.5
                           transition-all duration-slow ease-organic group-hover:border-primary group-hover:bg-primary
                           group-hover:text-cream"
              >
                <Icon name="play" size={15} />
              </span>
              {t('gallery.watchOnYoutube')}
            </a>
          </Reveal>
        </div>

        <h2 id="testimonials-title" className="sr-only">
          {t('section.testimonials')}
        </h2>

        {/*
          Fixed on the container, not the quote: without a minimum the whole
          section jumps every time the rotation swaps a short quote for a long
          one, which is a layout shift the user did not ask for.
        */}
        <div className="relative mt-10 min-h-[22rem] sm:min-h-[20rem]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={current.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -18 }}
              transition={{ duration: reduce ? 0.2 : DUR.slow, ease: EASE_CINE }}
            >
              <Icon
                name="quote"
                size={44}
                className="mb-6 text-leaf/40"
                aria-hidden="true"
              />

              <blockquote lang={current.language}>
                <p className="display max-w-4xl text-fluid-2xl font-normal leading-[1.35] text-deep wrap-anywhere">
                  {current.quote}
                </p>
              </blockquote>

              <figcaption className="mt-9 flex items-center gap-4">
                {/*
                  The portrait is a 56px circle, not a half-column image. Most
                  of these rows have no photo the server will serve, and at this
                  size the placeholder reads as an avatar rather than as a hole.
                */}
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-line">
                  <SmartImage
                    src={current.image}
                    alt=""
                    ratio="1 / 1"
                    className="!h-full !bg-cream"
                  />
                </span>

                <span>
                  <span className="block font-display text-fluid-lg font-semibold text-primary wrap-anywhere">
                    {current.name}
                  </span>
                  {current.location && (
                    <span className="mt-0.5 flex items-start gap-1.5 text-fluid-sm text-muted wrap-anywhere">
                      <Icon name="pin" size={14} className="mt-1 shrink-0" />
                      {current.location}
                    </span>
                  )}
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <div className="mt-8 flex items-center gap-5 border-t border-line pt-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={t('testimonial.previous')}
                className="grid h-11 w-11 place-items-center rounded-full border border-line
                           text-ink transition-colors hover:border-primary hover:bg-primary hover:text-cream"
              >
                <Icon name="chevronLeft" size={19} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={t('testimonial.next')}
                className="grid h-11 w-11 place-items-center rounded-full border border-line
                           text-ink transition-colors hover:border-primary hover:bg-primary hover:text-cream"
              >
                <Icon name="chevronRight" size={19} />
              </button>
            </div>

            <span aria-hidden="true" className="micro text-muted">
              {String(index + 1).padStart(2, '0')}
              <span className="mx-2 opacity-50">/</span>
              {String(items.length).padStart(2, '0')}
            </span>

            {/* Progress rail doubles as the rotation timer. */}
            <span aria-hidden="true" className="h-px flex-1 overflow-hidden bg-line">
              <motion.span
                className="block h-full origin-left bg-primary"
                initial={false}
                animate={{ scaleX: (index + 1) / items.length }}
                transition={{ duration: reduce ? 0 : DUR.slow, ease: EASE_CINE }}
              />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

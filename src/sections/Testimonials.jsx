import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import staticTestimonials from '../data/testimonials.json';
import { featuredVideo } from '../data/site';
import { getTestimonials } from '../lib/api';
import { useAsync } from '../hooks';
import { useI18n } from '../lib/i18n';
import { EASE, Reveal, motion, useReducedMotion } from '../lib/motion';
import { SectionHeading, SmartImage } from '../components/ui';
import Icon from '../components/Icon';

const AUTO_MS = 8000;

/** Splits the CMS title, which packs "Name, place, place  phone" into one field. */
function normalise(row) {
  const title = String(row.title || '').trim();
  const phone = (title.match(/(\d[\d\s-]{8,})\s*$/) || [])[1];
  const withoutPhone = phone ? title.slice(0, title.lastIndexOf(phone)).trim() : title;
  const parts = withoutPhone.split(',').map((s) => s.trim()).filter(Boolean);

  return {
    id: row.id,
    name: parts[0] || withoutPhone,
    location: parts.slice(1).join(', ') || null,
    quote: String(row.content || '').trim(),
    image: row.photopath || null,
    language: String(row.language || '').toLowerCase().startsWith('mar') ? 'mr' : 'en',
  };
}

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
      className="section relative overflow-hidden bg-cream/55"
      aria-labelledby="testimonials-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 bottom-0 h-[22rem] w-[22rem] blob bg-primary/6"
      />

      <div className="shell">
        <SectionHeading
          id="testimonials-title"
          eyebrow={t('section.testimonials')}
          title="Voices from the field"
        />

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Portrait */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
                  transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE }}
                  className="overflow-hidden rounded-leaf shadow-lift"
                >
                  <SmartImage
                    src={current.image}
                    alt={current.name}
                    ratio="4 / 5"
                    className="!bg-cream"
                  />
                </motion.div>
              </AnimatePresence>

              <span
                aria-hidden="true"
                className="absolute -right-3 -top-3 grid h-14 w-14 place-items-center rounded-full
                           bg-sun text-deep shadow-lift"
              >
                <Icon name="quote" size={24} />
              </span>
            </div>
          </div>

          {/* Quote */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={current.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: reduce ? 0.2 : 0.5, ease: EASE }}
                lang={current.language}
              >
                <p className="font-display text-fluid-2xl leading-[1.5] text-deep wrap-anywhere">
                  {current.quote}
                </p>

                <footer className="mt-7 border-t border-line pt-5">
                  <p className="font-display text-fluid-lg font-semibold text-primary wrap-anywhere">
                    {current.name}
                  </p>
                  {current.location && (
                    <p className="mt-1 flex items-start gap-1.5 text-fluid-sm text-muted wrap-anywhere">
                      <Icon name="pin" size={15} className="mt-0.5 shrink-0" />
                      {current.location}
                    </p>
                  )}
                </footer>
              </motion.blockquote>
            </AnimatePresence>

            {/* Controls */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {items.length > 1 && (
                <>
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

                  <div className="flex gap-1.5" aria-hidden="true">
                    {items.map((item, i) => (
                      <button
                        key={item.id}
                        type="button"
                        tabIndex={-1}
                        onClick={() => setIndex(i)}
                        className="group flex h-11 items-center px-1"
                      >
                        <span
                          className={`block h-1.5 rounded-full transition-all duration-500 ease-organic
                                      ${i === index ? 'w-8 bg-primary' : 'w-3 bg-line group-hover:bg-leaf'}`}
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}

              <a
                href={featuredVideo.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost ml-auto !px-5 text-fluid-xs"
              >
                <Icon name="play" size={15} />
                {t('gallery.watchOnYoutube')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { pillars } from '../data/site';
import { useI18n } from '../lib/i18n';
import { EASE, EASE_CINE, Reveal, motion, useReducedMotion } from '../lib/motion-react';

/**
 * The four pillars.
 *
 * The statements are exactly the ones on the live site. What changed is the
 * form: they were four equal cards in a row, which flattened a philosophy into
 * a feature grid and read as filler. They are now a numbered editorial index —
 * one statement per full-width row, set large, separated by hairlines, with a
 * sticky title holding the left column.
 *
 * That shape does two things a card row cannot. It gives the page its first
 * asymmetric layout after a symmetrical hero, and it lets each statement be
 * read as a line of argument rather than scanned as a tile.
 *
 * No icon art: the four images this had been paired with were unrelated stock
 * clip-art (a dry-fruit basket for "nourishment", a watermarked stock tree for
 * "leaf and roots"), served from nothing the CMS knows about. The number
 * carries the row instead.
 */
export default function Pillars() {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section className="section lift-edge relative bg-canvas" aria-labelledby="pillars-title">
      {/*
        Clipping lives on this layer, not on the section: `overflow: hidden` up
        there would break the sticky title column below, because an overflow
        container becomes the sticky element's scrollport and one that never
        scrolls gives sticky nothing to stick to. The rounded top corner of
        `.lift-edge` still needs the clip, so it is applied here with the same
        radius.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden
                   [border-start-end-radius:inherit] [border-start-start-radius:inherit]"
      >
        <div className="absolute -left-40 top-1/3 h-[26rem] w-[26rem] blob bg-leaf/6" />
      </div>

      <div className="shell relative grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/*
          The title column stays put while the statements scroll past it, so the
          four lines are read as belonging to one heading rather than as four
          independent blocks.
        */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal as="p" className="eyebrow mb-5" duration={0.5}>
              {t('section.pillars')}
            </Reveal>
            <Reveal delay={0.05}>
              <h2
                id="pillars-title"
                className="display text-fluid-3xl font-semibold text-deep"
              >
                Soil Charger Technology
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <span
                aria-hidden="true"
                className="mt-7 block h-px w-20 bg-gradient-to-r from-leaf to-transparent"
              />
            </Reveal>
          </div>
        </div>

        <ol className="lg:col-span-8">
          {pillars.map((p, i) => (
            <li key={p.n} className="group relative">
              {/* The rule draws itself as the row arrives, left to right. */}
              <motion.span
                aria-hidden="true"
                className="block h-px origin-left bg-line"
                initial={reduce ? { opacity: 0 } : { scaleX: 0 }}
                whileInView={reduce ? { opacity: 1 } : { scaleX: 1 }}
                viewport={{ once: true, margin: '0px 0px -18% 0px' }}
                transition={{ duration: reduce ? 0.25 : 0.9, delay: 0.05, ease: EASE_CINE }}
              />

              <div
                className="flex items-baseline gap-5 py-7 transition-transform duration-slow ease-organic
                           motion-safe:group-hover:translate-x-2 sm:gap-8 sm:py-9"
              >
                <span
                  aria-hidden="true"
                  className="micro shrink-0 pt-2 text-muted transition-colors duration-slow group-hover:text-leaf"
                >
                  {p.n}
                </span>

                {/* The statement rises out of its own mask. */}
                <span className="reveal-clip block">
                  <motion.span
                    className="block font-display text-fluid-xl font-semibold leading-snug text-deep wrap-anywhere
                               transition-colors duration-slow group-hover:text-primary sm:text-fluid-2xl"
                    initial={reduce ? { opacity: 0 } : { y: '105%' }}
                    whileInView={reduce ? { opacity: 1 } : { y: 0 }}
                    viewport={{ once: true, margin: '0px 0px -18% 0px' }}
                    transition={{ duration: reduce ? 0.25 : 0.8, delay: 0.12, ease: EASE }}
                  >
                    {p.text}
                  </motion.span>
                </span>
              </div>

              {/* Closing rule under the last row, so the set reads as bounded. */}
              {i === pillars.length - 1 && (
                <motion.span
                  aria-hidden="true"
                  className="block h-px origin-left bg-line"
                  initial={reduce ? { opacity: 0 } : { scaleX: 0 }}
                  whileInView={reduce ? { opacity: 1 } : { scaleX: 1 }}
                  viewport={{ once: true, margin: '0px 0px -18% 0px' }}
                  transition={{ duration: reduce ? 0.25 : 0.9, ease: EASE_CINE }}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

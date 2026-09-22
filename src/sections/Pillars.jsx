import { pillars } from '../data/site';
import { useI18n } from '../lib/i18n';
import { Reveal, motion } from '../lib/motion';
import { SectionHeading } from '../components/ui';

/**
 * The four pillars. The statements are exactly the ones on the live site; the
 * presentation becomes numbered cards linked by a growing rule so the set reads
 * as one philosophy rather than four loose tiles.
 *
 * No icon art: the four images the rebuild had been pairing these with were
 * unrelated stock clip-art (a dry-fruit basket for "nourishment", a watermarked
 * stock tree for "leaf and roots"), served from nothing the CMS knows about.
 * The number carries the medallion instead.
 */
export default function Pillars() {
  const { t } = useI18n();

  return (
    <section className="section relative overflow-hidden" aria-labelledby="pillars-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 blob bg-leaf/6"
      />

      <div className="shell">
        <SectionHeading
          id="pillars-title"
          eyebrow={t('section.pillars')}
          title="Soil Charger Technology"
        />

        <div className="relative mt-14 sm:mt-20">
          {/* Connecting line, drawn as the row enters view. */}
          <motion.div
            aria-hidden="true"
            className="absolute left-0 right-0 top-[4.5rem] hidden h-px origin-left bg-gradient-to-r
                       from-transparent via-leaf/45 to-transparent lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          />

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {pillars.map((p, i) => (
              <Reveal
                as="li"
                key={p.n}
                delay={i * 0.11}
                className="group relative flex flex-col items-center rounded-[1.75rem] border border-line/70
                           bg-surface px-6 pb-8 pt-0 text-center shadow-soft
                           transition-all duration-500 ease-organic hover:-translate-y-2
                           hover:border-primary/25 hover:shadow-lift"
              >
                {/* Numbered medallion straddles the connecting line. */}
                <div
                  className="relative -mt-10 mb-5 grid h-[5.5rem] w-[5.5rem] place-items-center rounded-full
                             border border-line bg-canvas shadow-soft transition-transform duration-500
                             ease-organic group-hover:scale-105 group-hover:border-leaf/50"
                >
                  <span
                    aria-hidden="true"
                    className="font-display text-fluid-2xl font-semibold text-primary transition-transform
                               duration-500 ease-organic group-hover:scale-110"
                  >
                    {p.n}
                  </span>
                </div>

                <p className="text-fluid-base font-medium leading-snug text-ink wrap-anywhere">
                  {p.text}
                </p>

                <span
                  aria-hidden="true"
                  className="mt-5 h-0.5 w-8 rounded-full bg-leaf/40 transition-all duration-500
                             ease-organic group-hover:w-14 group-hover:bg-sun"
                />
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

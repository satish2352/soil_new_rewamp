import Icon from '../components/Icon';
import { pillars } from '../data/site';
import { useI18n } from '../lib/i18n';
import { EASE_CINE, Reveal, motion, useReducedMotion } from '../lib/motion-react';

/**
 * Every pillar reads "Work on X not on Y". Splitting it lets the pillar lead
 * with what to focus on and demote what to avoid. Anything that does not fit
 * that shape falls back to the plain sentence.
 */
function splitPillar(text) {
  const m = /^work on (.+?)\s+(not\s.+?)\.?$/i.exec(text.trim());
  return m ? { focus: m[1], against: m[2] } : {};
}

/*
  One drawn icon per pillar, in the same 1.7 stroke as the icon set. The stock
  set has nothing for humus or roots, and repeating a leaf four times would
  make the pillars indistinguishable.
*/
const PILLAR_ICONS = [
  // Nourishment: a drop feeding a seedling.
  <>
    <path d="M12 3.5c0 0-5 5.6-5 9.2a5 5 0 0 0 10 0c0-3.6-5-9.2-5-9.2z" />
    <path d="M12 16.5v-4" />
    <path d="M12 13.5c-1.6 0-2.6-1-2.8-2.4 1.6 0 2.6.9 2.8 2.4zM12 13c1.3 0 2.2-.8 2.4-2 -1.3 0-2.2.8-2.4 2z" />
  </>,
  // Soil: strata beneath a sprout.
  <>
    <path d="M3 13c3-1.2 6-1.2 9 0s6 1.2 9 0" />
    <path d="M3 17c3-1.2 6-1.2 9 0s6 1.2 9 0" />
    <path d="M3 21c3-1.2 6-1.2 9 0s6 1.2 9 0" />
    <path d="M12 11.5V6" />
    <path d="M12 7.5c-2 0-3.3-1.2-3.5-3 2 0 3.3 1.2 3.5 3zM12 7c1.8 0 3-1 3.2-2.7-1.8 0-3 1-3.2 2.7z" />
  </>,
  // Humus: a living mound, rich with organic matter.
  <>
    <path d="M2.5 19.5c2.2-6 5.6-9 9.5-9s7.3 3 9.5 9z" />
    <path d="M2 19.5h20" />
    <circle cx="9" cy="16" r=".6" fill="currentColor" />
    <circle cx="13" cy="14.5" r=".6" fill="currentColor" />
    <circle cx="15.5" cy="17" r=".6" fill="currentColor" />
    <circle cx="11" cy="18" r=".6" fill="currentColor" />
    <path d="M12 10.5V7" />
    <path d="M12 8c-1.5 0-2.5-.9-2.6-2.2 1.5 0 2.5.9 2.6 2.2z" />
  </>,
  // Leaf and roots: growth above, anchorage below.
  <>
    <path d="M3 12.5h18" />
    <path d="M12 12.5V4.5" />
    <path d="M12 8.5c-2.6 0-4.3-1.6-4.5-4 2.6 0 4.3 1.6 4.5 4zM12 7.5c2.3 0 3.8-1.4 4-3.5-2.3 0-3.8 1.4-4 3.5z" />
    <path d="M12 12.5v8M12 15.5l-3 3M12 15l3.2 2.6M12 18l-1.8 2.2M9 18.5l-1.6.9M15.2 17.6l1.4 1.3" />
  </>,
];

function PillarIcon({ index }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PILLAR_ICONS[index % PILLAR_ICONS.length]}
    </svg>
  );
}

/**
 * The four pillars, drawn as pillars.
 *
 * The statements are exactly the ones on the live site. The section is built
 * as the structure its name describes: a beam carrying the company, four
 * upright columns holding it, and a band of soil they stand on. Each column
 * leads with what to work on and sets what to avoid underneath, crossed out.
 *
 * On a phone each pillar becomes a compact row (icon beside text) so the four
 * do not stack into a tall tower; the beam and the soil band still frame them.
 */
export default function Pillars() {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section className="section lift-edge relative overflow-hidden bg-canvas" aria-labelledby="pillars-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/4 h-[26rem] w-[26rem] blob bg-leaf/6" />
        <div className="absolute -right-32 bottom-0 h-[22rem] w-[22rem] blob bg-sun/6" />
      </div>

      <div className="shell relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal as="p" className="eyebrow mb-4 justify-center" duration={0.5}>
            {t('section.pillars')}
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="pillars-title" className="display text-fluid-3xl font-semibold text-deep">
              Soil Charger Technology
            </h2>
          </Reveal>
        </div>

        <div className="relative mx-auto mt-10 max-w-5xl lg:mt-12">
          {/* The beam the pillars carry. */}
          <motion.div
            aria-hidden="true"
            className="relative h-3 origin-center rounded-full bg-gradient-to-r from-deep via-primary to-deep shadow-soft"
            initial={reduce ? { opacity: 0 } : { scaleX: 0 }}
            whileInView={reduce ? { opacity: 1 } : { scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: reduce ? 0.25 : 0.9, ease: EASE_CINE }}
          >
            <span
              className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center
                         rounded-full bg-sun text-deep ring-4 ring-[rgb(var(--c-bg))]"
            >
              <Icon name="leaf" size={16} />
            </span>
          </motion.div>

          <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {pillars.map((p, i) => {
              const { focus, against } = splitPillar(p.text);
              return (
                <motion.li
                  key={p.n}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-surface
                             p-4 text-left shadow-soft sm:flex-col sm:gap-0 sm:rounded-b-xl sm:rounded-t-[1.75rem]
                             sm:px-5 sm:pb-6 sm:pt-7 sm:text-center
                             transition-[border-color,box-shadow,transform] duration-slow ease-organic
                             hover:border-leaf/60 hover:shadow-lift motion-safe:hover:-translate-y-1.5"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  transition={{ duration: reduce ? 0.25 : 0.75, delay: reduce ? 0 : 0.15 + i * 0.1, ease: EASE_CINE }}
                >
                  {/* Fluting: faint vertical grooves, fading out toward the base. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-60
                               [background-image:repeating-linear-gradient(90deg,transparent_0_26px,rgb(var(--c-line)/0.45)_26px_27px)]
                               [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
                  />
                  {/* Capital: a rule across the top that fills on hover. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-leaf to-sun
                               transition-transform duration-slow ease-organic group-hover:scale-x-100"
                  />

                  <span
                    className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary
                               transition-all duration-slow ease-organic
                               group-hover:rotate-[-4deg] group-hover:bg-primary group-hover:text-cream"
                  >
                    <PillarIcon index={i} />
                  </span>

                  <div className="relative flex min-w-0 grow flex-col items-start sm:items-center">
                  <span aria-hidden="true" className="micro text-sun sm:mt-4">
                    {p.n}
                  </span>

                  {focus ? (
                    <p className="relative mt-1 flex grow flex-col items-start sm:mt-3 sm:items-center">
                      <span className="text-fluid-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        Work on
                      </span>
                      <span className="mt-1.5 block font-display text-fluid-xl font-semibold leading-tight text-deep first-letter:uppercase wrap-anywhere">
                        {focus}
                      </span>
                      <span aria-hidden="true" className="my-4 hidden h-px w-10 bg-line sm:block" />
                      <span
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-earth/10 px-3 py-1.5 sm:mt-auto
                                   text-fluid-xs font-medium text-earth"
                      >
                        <Icon name="close" size={13} strokeWidth={2.2} />
                        <span className="line-through decoration-earth/50 first-letter:uppercase">{against}</span>
                      </span>
                    </p>
                  ) : (
                    <p className="relative mt-3 font-display text-fluid-lg font-semibold leading-snug text-deep wrap-anywhere">
                      {p.text}
                    </p>
                  )}
                  </div>
                </motion.li>
              );
            })}
          </ol>

          {/* The ground they stand on. */}
          <motion.div
            aria-hidden="true"
            className="mt-4 h-4 rounded-full bg-gradient-to-r from-soil via-earth to-soil"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scaleX: 0.6 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: reduce ? 0.25 : 0.9, delay: reduce ? 0 : 0.5, ease: EASE_CINE }}
          />
        </div>
      </div>
    </section>
  );
}

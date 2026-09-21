import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { principles } from '../data/site';
import { useI18n } from '../lib/i18n';
import { EASE, Reveal, motion } from '../lib/motion';
import { SectionHeading } from '../components/ui';
import Icon from '../components/Icon';

/**
 * The three principles as a vertical timeline. Each step shows its short list;
 * the longer "Important / More Important" text the live site hides in modals is
 * available behind a disclosure, so nothing is lost and nothing is a wall of text.
 */
export default function Principles() {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(null);

  return (
    <section
      className="band-dark section relative overflow-hidden"
      aria-labelledby="principles-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 blob bg-earth/6"
      />

      <div className="shell">
        <SectionHeading
          id="principles-title"
          eyebrow={t('section.principles')}
          title="Soil Charger Technology"
        />

        <ol className="relative mt-14 sm:mt-20">
          {/* Timeline spine. */}
          <motion.span
            aria-hidden="true"
            className="absolute bottom-6 left-[1.35rem] top-6 w-px origin-top bg-gradient-to-b
                       from-leaf/55 via-primary/35 to-transparent sm:left-[1.6rem]"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '0px 0px -20% 0px' }}
            transition={{ duration: 1.4, ease: EASE }}
          />

          {principles.map((p, i) => {
            const open = expanded === p.key;
            const panelId = `principle-panel-${p.key}`;

            return (
              <Reveal
                as="li"
                key={p.key}
                delay={i * 0.12}
                className="relative pb-10 pl-14 last:pb-0 sm:pl-20"
              >
                {/* Node */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1 grid h-11 w-11 place-items-center rounded-full
                             border border-line bg-canvas font-display text-fluid-sm font-semibold
                             text-primary shadow-soft sm:h-[3.25rem] sm:w-[3.25rem] sm:text-fluid-base"
                >
                  {i + 1}
                </span>

                <article
                  className="card card-hover overflow-hidden p-6 sm:p-8"
                >
                  <header className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h3 className="font-display text-fluid-xl font-semibold text-deep">
                      <span className="text-muted">{p.label}</span>{' '}
                      <span>{p.title}</span>
                    </h3>
                    <span
                      className="rounded-full bg-sun/20 px-3 py-1 text-fluid-xs font-semibold
                                 uppercase tracking-wide text-sun"
                    >
                      {p.badge}
                    </span>
                  </header>

                  <p className="mb-5 flex items-start gap-2 text-fluid-sm font-medium text-primary">
                    <Icon name="sprout" size={17} className="mt-0.5 shrink-0" />
                    <span>{p.kicker} — {p.lead}</span>
                  </p>

                  <ul className="space-y-3">
                    {p.points.map((point) => (
                      <li key={point} className="flex gap-3 text-fluid-sm leading-relaxed text-ink/85">
                        <Icon name="check" size={17} className="mt-1 shrink-0 text-leaf" />
                        <span className="wrap-anywhere">{point}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : p.key)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-fluid-sm
                               font-semibold text-primary transition-colors hover:text-deep"
                  >
                    {open ? t('cta.close') : t('cta.readMore')}
                    <Icon
                      name="chevronDown"
                      size={16}
                      className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={panelId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.38, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 space-y-3 rounded-2xl border border-line bg-[rgb(var(--c-bg))]/60 p-5">
                          {p.detail.map((d) => (
                            <p
                              key={d}
                              className="text-fluid-sm leading-relaxed text-ink/80 wrap-anywhere"
                            >
                              {d}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { principles } from '../data/site';
import { useI18n } from '../lib/i18n';
import {
  DUR,
  EASE,
  EASE_CINE,
  Reveal,
  motion,
  useSceneIndex,
  useSceneProgress,
  useReducedMotion,
} from '../lib/motion-react';
import Icon from '../components/Icon';
import FluidBackdrop from '../components/FluidBackdrop';

/**
 * The method, as a pinned scene.
 *
 * This is the section that most needed the change. Three principles were
 * stacked as three identical cards on a timeline — the same weight as every
 * other card on the page, for the content that actually explains what the
 * company does.
 *
 * Now the left column pins while the three steps scroll past it, and the pinned
 * panel reports which step you are reading: the numeral swaps, the title
 * changes, the rail fills. That is the storytelling pattern the brief asks for,
 * and it is built on `position: sticky` plus one scroll progress value — no
 * scroll-jacking, no pinning library, no interference with the page's own
 * scroll. The user can flick past the whole thing at any speed and nothing
 * fights them.
 *
 * Under reduced motion the pin still holds (sticky is layout, not animation)
 * but the swaps become instant and nothing translates.
 */
export default function Principles() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(null);

  // Progress across the scene: 0 as its top reaches the viewport top, 1 as its
  // bottom reaches the viewport bottom — i.e. exactly the pinned pass.
  const { ref, progress } = useSceneProgress(['start start', 'end end']);
  const active = useSceneIndex(principles.length, progress);
  const current = principles[active];

  return (
    <section ref={ref} className="band-void scene relative" aria-labelledby="principles-title">
      {/*
        The backdrop clips itself. `overflow: hidden` on the section would
        silently break the sticky panel below — an overflow container becomes
        the sticky element's scrollport, and one that never scrolls gives
        sticky nothing to stick to.
      */}
      <FluidBackdrop tone="leaf" intensity={0.9} />

      <div className="shell relative grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* ------------------------------------------------ the pinned panel */}
        <div className="lg:col-span-5">
          {/*
            The underscores are load-bearing: Tailwind turns `_` into a space,
            and `calc(var(--header-h)+4rem)` without spaces around the `+` is
            invalid CSS. The declaration is dropped, `top` falls back to `auto`,
            and the panel silently stops sticking — it still updates, so it
            looks like it works until you scroll past it.
          */}
          <div className="lg:sticky lg:top-[calc(var(--header-h)_+_3rem)]">
            <Reveal as="p" className="eyebrow mb-5" duration={0.5}>
              {t('section.principles')}
            </Reveal>

            <Reveal delay={0.05}>
              <h2 id="principles-title" className="display text-fluid-3xl font-semibold text-cream">
                Three rules the method rests on
              </h2>
            </Reveal>

            {/*
              The numeral is the scene's clock. It is aria-hidden and mirrored
              by a live region below, so a screen reader is told the step
              changed instead of being handed a bare digit.
            */}
            <div className="relative mt-12 hidden h-60 lg:block" aria-hidden="true">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.key}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -26 }}
                  transition={{ duration: reduce ? 0.2 : DUR.slow, ease: EASE_CINE }}
                  className="absolute inset-0"
                >
                  <span className="display block text-[6rem] font-semibold leading-none text-sun/25">
                    {String(active + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-3 font-display text-fluid-2xl font-semibold text-cream">
                    <span className="text-muted">{current.label}</span> {current.title}
                  </p>
                  <p className="mt-2 text-fluid-sm text-sun">{current.kicker}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress rail — one segment per step, filling as you read. */}
            <div className="mt-10 hidden gap-2 lg:flex" aria-hidden="true">
              {principles.map((p, i) => (
                <span key={p.key} className="h-px flex-1 overflow-hidden bg-cream/15">
                  <motion.span
                    className="block h-full origin-left bg-sun"
                    initial={false}
                    animate={{ scaleX: i <= active ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : DUR.slow, ease: EASE_CINE }}
                  />
                </span>
              ))}
            </div>

            <p className="sr-only" aria-live="polite">
              {`Step ${active + 1} of ${principles.length}: ${current.label} ${current.title}`}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------- the scrolling steps */}
        <ol className="lg:col-span-7">
          {principles.map((p, i) => {
            const open = expanded === p.key;
            const panelId = `principle-panel-${p.key}`;

            return (
              <li
                key={p.key}
                className="border-t border-line py-10 first:border-t-0 first:pt-0 sm:py-14"
              >
                <Reveal y={36}>
                  <header className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span aria-hidden="true" className="micro text-sun">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display text-fluid-xl font-semibold text-cream">
                      <span className="text-muted">{p.label}</span> {p.title}
                    </h3>
                    <span
                      className="rounded-full border border-sun/35 px-3 py-1 text-fluid-xs
                                 font-semibold uppercase tracking-wide text-sun"
                    >
                      {p.badge}
                    </span>
                  </header>

                  <p className="mb-7 flex items-start gap-2.5 text-fluid-lg font-medium leading-snug text-cream/90">
                    <Icon name="sprout" size={19} className="mt-1.5 shrink-0 text-leaf" />
                    <span className="wrap-anywhere">
                      {p.kicker} — {p.lead}
                    </span>
                  </p>

                  <ul className="space-y-4">
                    {p.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-3.5 text-fluid-sm leading-relaxed text-muted"
                      >
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
                    className="group mt-6 inline-flex min-h-[44px] items-center gap-2 text-fluid-sm
                               font-semibold text-sun transition-colors hover:text-cream"
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
                        <div className="mt-6 space-y-3 border-l-2 border-sun/40 pl-5">
                          {p.detail.map((d) => (
                            <p
                              key={d}
                              className="text-fluid-sm leading-relaxed text-muted wrap-anywhere"
                            >
                              {d}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

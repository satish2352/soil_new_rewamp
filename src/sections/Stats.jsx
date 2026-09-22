import { stats } from '../data/site';
import { useCountUp } from '../hooks';
import { EASE_CINE, motion, useReducedMotion } from '../lib/motion-react';
import Icon from '../components/Icon';
import FluidBackdrop from '../components/FluidBackdrop';

const ICONS = {
  farmer: 'users',
  youtube: 'youtube',
  app: 'download',
  seminar: 'handshake',
  distributor: 'grid',
};

/**
 * Community reach.
 *
 * The figures are the `data-max` values the existing markup already carries —
 * 1,000,000 farmers, 155,000 subscribers, 5,000 app downloads, 50,000 seminar
 * meetings, 460 distributors. Nothing here was invented or rounded.
 *
 * Presentation change: these were five small centred tiles with icon
 * medallions, which made the single most quantitative thing on the page look
 * like decoration. They are now set as figures — large, tabular, divided by
 * hairlines — because a number is the strongest object a page can show and it
 * should be allowed to be the loudest thing in its own band.
 *
 * `tabular-nums` matters here: proportional digits change width as the count-up
 * runs, so each figure would jitter sideways for the whole two seconds.
 */
function Stat({ stat, index }) {
  const [ref, value] = useCountUp(stat.value);
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="group relative flex flex-col justify-end px-4 py-6 sm:px-5 sm:py-8"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: reduce ? 0.25 : 0.7, delay: reduce ? 0 : index * 0.07, ease: EASE_CINE }}
    >
      {/*
        The size is capped to the *widest* figure, not chosen by eye. The
        longest string here is "10,00,000+" — eleven glyphs, about 5.5em in
        Fraunces — and a five-column cell inside the 82rem shell gives roughly
        230px of content width. At the `fluid-3xl` this started on, that figure
        rendered ~330px wide and ran straight over the next column. This clamp
        keeps it inside the cell at every breakpoint the grid uses, including
        the 2-column phone layout where the cell is narrowest.
      */}
      <span
        ref={ref}
        className="display block text-[clamp(1.35rem,2.2vw,2.1rem)] font-semibold tabular-nums text-cream"
      >
        {value.toLocaleString('en-IN')}
        {stat.suffix}
      </span>

      {/* `break-words`, not `wrap-anywhere` — see the note in Hero.jsx. */}
      <span className="mt-3 flex items-center gap-2 break-words text-fluid-xs font-semibold uppercase tracking-[0.16em] text-cream/55">
        <Icon
          name={ICONS[stat.key] || 'leaf'}
          size={15}
          className="shrink-0 text-leaf transition-colors duration-slow group-hover:text-sun"
        />
        {stat.label}
      </span>

      {/* Underline grows on hover — the only interaction this band needs. */}
      <span
        aria-hidden="true"
        className="mt-4 block h-px w-8 bg-sun/50 transition-all duration-slow ease-organic group-hover:w-full group-hover:bg-sun"
      />
    </motion.div>
  );
}

export default function Stats() {
  return (
    <section className="band-void relative py-16 sm:py-20" aria-label="Our reach">
      <FluidBackdrop tone="sun" intensity={0.85} />

      <div className="shell relative">
        {/*
          The 1px gap plus a tinted parent is what draws the dividing hairlines:
          one rule per gap, automatically correct at every breakpoint, with no
          border-on-every-child-except-the-last arithmetic to get wrong when the
          grid rewraps from 5 columns to 2.
        */}
        <div className="grid grid-cols-2 gap-px bg-cream/12 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s, i) => (
            <div key={s.key} className="bg-[rgb(var(--c-bg))]">
              <Stat stat={s} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

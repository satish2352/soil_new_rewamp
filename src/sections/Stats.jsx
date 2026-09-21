import { stats } from '../data/site';
import { useCountUp } from '../hooks';
import { Reveal } from '../lib/motion';
import Icon from '../components/Icon';

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
 */
function Stat({ stat, index }) {
  const [ref, value] = useCountUp(stat.value);

  return (
    <Reveal
      delay={index * 0.08}
      className="group flex flex-col items-center gap-2 px-2 text-center"
    >
      <span
        className="mb-1 grid h-12 w-12 place-items-center rounded-full border border-cream/20
                   text-leaf transition-all duration-500 ease-organic group-hover:border-sun/50 group-hover:text-sun"
      >
        <Icon name={ICONS[stat.key] || 'leaf'} size={22} />
      </span>

      <span ref={ref} className="font-display text-fluid-2xl font-semibold text-cream tabular-nums">
        {value.toLocaleString('en-IN')}
        {stat.suffix}
      </span>

      <span className="text-fluid-xs font-medium uppercase tracking-[0.14em] text-cream/60 wrap-anywhere">
        {stat.label}
      </span>
    </Reveal>
  );
}

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-deep py-16 sm:py-20" aria-label="Our reach">
      <div aria-hidden="true" className="absolute inset-0 grain opacity-40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 blob bg-leaf/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 blob bg-sun/8 blur-3xl"
      />

      <div className="shell relative">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {stats.map((s, i) => (
            <Stat key={s.key} stat={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { Reveal } from '../lib/motion-react';
import { SectionHeading } from '../components/ui';
import Icon from '../components/Icon';

/** The three career tracks the live site offers, linking into the careers page. */
const TRACKS = [
  { key: 'internship', hash: '#internship', icon: 'sprout' },
  { key: 'business', hash: '#business', icon: 'handshake' },
  { key: 'job', hash: '#job', icon: 'briefcase' },
];

export default function CareerTeaser() {
  const { t } = useI18n();

  return (
    <section className="section relative overflow-hidden bg-cream/55" aria-labelledby="career-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 bottom-0 h-[20rem] w-[20rem] blob bg-earth/7"
      />

      <div className="shell relative">
        <SectionHeading
          id="career-title"
          eyebrow={t('section.career')}
          title="Grow with Soil Charger Technology"
          action={
            <Link to="/careers" className="btn-ghost btn-sweep hover:text-cream">
              {t('cta.viewAll')}
              <Icon name="arrowRight" size={17} />
            </Link>
          }
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-3 lg:gap-6">
          {TRACKS.map((track, i) => (
            <Reveal
              as="li"
              key={track.key}
              delay={i * 0.09}
              className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border
                         border-line/70 bg-surface p-8 shadow-soft transition-all duration-500
                         ease-organic hover:-translate-y-2 hover:border-primary/30 hover:shadow-cine"
            >
              {/*
                An index and an icon rather than an icon alone: the number tells
                the reader these are three of a set, which a floating icon does
                not, and it costs nothing to render.
              */}
              <div className="mb-8 flex items-start justify-between">
                <span aria-hidden="true" className="micro text-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary
                             transition-all duration-slow ease-organic group-hover:bg-primary group-hover:text-cream"
                >
                  <Icon name={track.icon} size={22} />
                </span>
              </div>

              <h3 className="font-display text-fluid-xl font-semibold leading-snug text-deep wrap-anywhere">
                <Link to={`/careers${track.hash}`} className="after:absolute after:inset-0">
                  {t(`career.${track.key}`)}
                </Link>
              </h3>

              <span className="mt-auto inline-flex items-center gap-2 pt-8 text-fluid-sm font-semibold text-primary">
                {t('cta.apply')}
                <Icon
                  name="arrowRight"
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-2"
                />
              </span>

              {/* Underline sweeps the full card width on hover. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-8 bottom-6 h-px origin-left scale-x-0 bg-primary/40
                           transition-transform duration-slow ease-cine group-hover:scale-x-100"
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

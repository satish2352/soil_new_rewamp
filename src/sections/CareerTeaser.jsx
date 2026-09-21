import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { Reveal } from '../lib/motion';
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

      <div className="shell">
        <SectionHeading
          id="career-title"
          eyebrow={t('section.career')}
          title="Grow with Soil Charger Technology"
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-3 lg:gap-6">
          {TRACKS.map((track, i) => (
            <Reveal
              as="li"
              key={track.key}
              delay={i * 0.09}
              className="group relative overflow-hidden rounded-[1.5rem] border border-line/70 bg-surface
                         p-7 shadow-soft backdrop-blur-sm transition-all duration-500 ease-organic
                         hover:-translate-y-2 hover:border-primary/25 hover:shadow-lift"
            >
              <span
                className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary
                           transition-all duration-500 ease-organic group-hover:bg-primary group-hover:text-cream"
              >
                <Icon name={track.icon} size={25} />
              </span>

              <h3 className="font-display text-fluid-lg font-semibold text-deep wrap-anywhere">
                <Link to={`/careers${track.hash}`} className="after:absolute after:inset-0">
                  {t(`career.${track.key}`)}
                </Link>
              </h3>

              <span className="mt-4 inline-flex items-center gap-1.5 text-fluid-sm font-semibold text-primary">
                {t('cta.apply')}
                <Icon
                  name="arrowRight"
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

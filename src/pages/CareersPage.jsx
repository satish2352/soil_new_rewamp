import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import InternshipForm from '../sections/forms/InternshipForm';
import DistributorForm from '../sections/forms/DistributorForm';
import JobVacancyForm from '../sections/forms/JobVacancyForm';
import { useI18n } from '../lib/i18n';
import { Reveal } from '../lib/motion-react';
import Icon from '../components/Icon';

const TRACKS = [
  { key: 'internship', hash: 'internship', icon: 'sprout', Form: InternshipForm },
  { key: 'business', hash: 'business', icon: 'handshake', Form: DistributorForm },
  { key: 'job', hash: 'job', icon: 'briefcase', Form: JobVacancyForm },
];

/**
 * Careers. The three tracks the live site offers as modals become a tabbed page
 * — same fields, same endpoints, but linkable (`/careers#business`) and workable
 * on a phone.
 */
export default function CareersPage() {
  const { t } = useI18n();
  const { hash } = useLocation();
  const [active, setActive] = useState('internship');

  useEffect(() => {
    const target = hash.replace('#', '');
    if (TRACKS.some((x) => x.hash === target)) setActive(target);
  }, [hash]);

  const current = TRACKS.find((x) => x.hash === active) || TRACKS[0];
  const { Form } = current;

  return (
    <>
      <Seo
        title={t('nav.career')}
        description="Internship, SCT Business Recruitment and Job Vacancy openings at Soil Charger Technology, Nashik."
        path="/careers"
      />

      <PageHero
        eyebrow={t('section.career')}
        title={t('nav.career')}
        crumbs={[{ label: t('nav.career') }]}
      />

      <section className="section">
        <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Track selector — a rail on desktop, a scroller on mobile. */}
          <nav aria-label={t('nav.career')} className="min-w-0 lg:col-span-4">
            <ul className="no-scrollbar -mx-gutter flex gap-3 overflow-x-auto px-gutter pb-2 lg:mx-0 lg:flex-col lg:px-0 lg:pb-0">
              {TRACKS.map((track, i) => {
                const isActive = track.hash === active;
                return (
                  <Reveal as="li" key={track.key} delay={i * 0.07} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => setActive(track.hash)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`flex w-full min-w-[15rem] items-center gap-4 rounded-2xl border p-5 text-left
                                  transition-all duration-500 ease-organic lg:min-w-0
                                  ${
                                    isActive
                                      ? 'border-primary/30 bg-primary/8 shadow-soft'
                                      : 'border-line bg-surface hover:border-primary/25 hover:bg-cream'
                                  }`}
                    >
                      <span
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors duration-300
                                    ${isActive ? 'bg-primary text-cream' : 'bg-primary/10 text-primary'}`}
                      >
                        <Icon name={track.icon} size={22} />
                      </span>
                      <span
                        className={`font-display text-fluid-base font-semibold wrap-anywhere
                                    ${isActive ? 'text-deep' : 'text-ink/80'}`}
                      >
                        {t(`career.${track.key}`)}
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </ul>
          </nav>

          {/* Active form */}
          <div className="min-w-0 lg:col-span-8">
            <Reveal
              key={active}
              id={current.hash}
              className="card scroll-mt-28 p-6 sm:p-8"
            >
              <h2 className="mb-6 font-display text-fluid-2xl font-semibold text-deep">
                {t(`career.${current.key}`)}
              </h2>
              <Form />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

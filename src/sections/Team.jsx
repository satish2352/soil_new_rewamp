import { team } from '../data/site';
import { useI18n } from '../lib/i18n';
import { Reveal } from '../lib/motion';
import { SectionHeading, SmartImage } from '../components/ui';

/**
 * The five team members and their roles, exactly as listed on the live site —
 * including the spelling of "Devlopment Director", which is the client's own.
 */
export default function Team() {
  const { t } = useI18n();

  return (
    <section className="band-dark section relative overflow-hidden" aria-labelledby="team-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 top-16 h-[24rem] w-[24rem] blob bg-leaf/6"
      />

      <div className="shell">
        <SectionHeading id="team-title" eyebrow={t('section.team')} title="The people behind SCT" />

        <ul className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
          {team.map((member, i) => (
            <Reveal
              as="li"
              key={member.name}
              delay={i * 0.08}
              className="group relative overflow-hidden rounded-[1.5rem] border border-line/70 bg-surface
                         shadow-soft backdrop-blur-sm transition-all duration-500 ease-organic
                         hover:-translate-y-2 hover:border-primary/25 hover:shadow-lift"
            >
              <div className="relative overflow-hidden">
                <SmartImage
                  src={member.image}
                  alt={`${member.name}, ${member.role}`}
                  ratio="3 / 4"
                  className="!bg-[#E8F0E4]"
                  imgClassName="transition-transform duration-700 ease-organic group-hover:scale-[1.06]"
                />
                {/*
                  The portraits are shot on a pale backdrop, so the lower third
                  needs a genuinely opaque scrim for the name to hold contrast —
                  a light wash leaves the role text unreadable.
                */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background:
                      'linear-gradient(to top, rgb(var(--c-deep)) 0%, rgb(var(--c-deep) / 0.92) 18%, rgb(var(--c-deep) / 0.55) 34%, transparent 52%)',
                  }}
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-display text-fluid-base font-semibold leading-tight text-cream wrap-anywhere">
                  {member.name}
                </h3>
                <p className="mt-0.5 text-fluid-xs font-semibold text-sun wrap-anywhere">
                  {member.role}
                </p>
                <span
                  aria-hidden="true"
                  className="mt-2 block h-0.5 w-6 rounded-full bg-sun/70 transition-all duration-500
                             ease-organic group-hover:w-12"
                />
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

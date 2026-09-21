import vm from '../data/vision-mission.json';
import { useI18n } from '../lib/i18n';
import { ImageReveal, Reveal } from '../lib/motion';
import { SmartImage } from '../components/ui';
import Icon from '../components/Icon';

/**
 * Vision and Mission, side by side. The bullet text is exactly what the API
 * returns; only the arrangement is new. Vision leans on the soil image the CMS
 * stores for it, Mission on the field image — both already in the data.
 */
function Panel({ data, tone, icon, delay, label }) {
  if (!data) return null;

  const isVision = tone === 'vision';

  return (
    <Reveal
      delay={delay}
      className={`group relative flex flex-col overflow-hidden rounded-[2rem] border shadow-soft
                  transition-all duration-500 ease-organic hover:-translate-y-1.5 hover:shadow-lift
                  ${isVision ? 'border-leaf/30 bg-[rgb(var(--c-surface))]' : 'border-sun/30 bg-[rgb(var(--c-surface))]'}`}
    >
      <ImageReveal className="h-52 sm:h-60">
        <SmartImage
          src={data.image}
          alt=""
          ratio="auto"
          className="!h-full"
          imgClassName="transition-transform duration-700 ease-organic group-hover:scale-105"
        />
      </ImageReveal>

      <div className="relative flex grow flex-col p-7 sm:p-9">
        {/* Icon medallion overlapping the image edge. */}
        <span
          className={`absolute -top-7 right-7 grid h-14 w-14 place-items-center rounded-full
                      border border-line bg-canvas shadow-soft
                      ${isVision ? 'text-leaf' : 'text-sun'}`}
        >
          <Icon name={icon} size={24} />
        </span>

        <h3
          className={`mb-5 font-display text-fluid-2xl font-semibold
                      ${isVision ? 'text-leaf' : 'text-sun'}`}
        >
          {label}
        </h3>

        <ul className="space-y-3.5">
          {data.points.map((point) => (
            <li key={point} className="flex gap-3 text-fluid-base leading-relaxed text-ink/85">
              <span
                aria-hidden="true"
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full
                            ${isVision ? 'bg-leaf' : 'bg-sun'}`}
              />
              <span className="wrap-anywhere">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export default function VisionMission() {
  const { t } = useI18n();

  return (
    <section className="band-dark section relative overflow-hidden" aria-labelledby="vm-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 h-[22rem] w-[22rem] blob bg-sun/7"
      />

      <div className="shell">
        <Reveal className="mb-12 flex flex-col items-center gap-4 text-center sm:mb-16">
          <p className="eyebrow">{t('section.vision')} &amp; {t('section.mission')}</p>
          <h2 id="vm-title" className="font-display text-fluid-3xl font-semibold text-deep">
            Where we are going, and how we get there
          </h2>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Panel
            data={vm.vision}
            tone="vision"
            icon="sprout"
            delay={0}
            label={t('section.vision')}
          />
          <Panel
            data={vm.mission}
            tone="mission"
            icon="users"
            delay={0.12}
            label={t('section.mission')}
          />
        </div>
      </div>
    </section>
  );
}

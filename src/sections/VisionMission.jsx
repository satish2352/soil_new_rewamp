import staticVm from '../data/vision-mission.json';
import { getVisionMission } from '../lib/api';
import { useApiData } from '../hooks';
import { htmlToText } from '../lib/cms-html';
import { useI18n } from '../lib/i18n';
import { Reveal, TextReveal } from '../lib/motion-react';
import { SmartImage } from '../components/ui';
import Icon from '../components/Icon';
import FluidBackdrop from '../components/FluidBackdrop';

/**
 * Vision and Mission.
 *
 * The bullet text is exactly what the API returns; only the arrangement is new.
 *
 * The image handling is the substantive change. Each panel used to open with a
 * fixed 15rem image block — but both of the files the CMS points at here are
 * among the four that could not be recovered and still 404 on the server, so
 * every visitor got two large empty rectangles above the actual content.
 *
 * Now the image is a *backdrop* rather than a block: it sits behind the copy at
 * low opacity with `fallback="none"`, so when the uploads are restored the
 * panels gain atmosphere on their own, and until then the panel is simply a
 * clean typographic card with no hole in it. Neither state looks like a
 * mistake, and no code has to change when the server is fixed.
 */
function Panel({ data, tone, icon, delay, label }) {
  if (!data) return null;

  const isVision = tone === 'vision';
  const accent = isVision ? 'text-leaf' : 'text-sun';

  return (
    <Reveal
      delay={delay}
      className={`group relative isolate flex flex-col overflow-hidden rounded-[2rem] border
                  bg-[rgb(var(--c-surface))] p-8 shadow-soft transition-all duration-500 ease-organic
                  hover:-translate-y-1.5 hover:shadow-cine sm:p-10
                  ${isVision ? 'border-leaf/25 hover:border-leaf/50' : 'border-sun/25 hover:border-sun/50'}`}
    >
      {/* Backdrop. Absent unless the CMS actually serves the file. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <SmartImage
          src={data.image}
          alt=""
          ratio="auto"
          fallback="none"
          className="!h-full opacity-15"
          imgClassName="object-cover transition-transform duration-[1200ms] ease-organic group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--c-surface))] via-[rgb(var(--c-surface))]/85 to-[rgb(var(--c-surface))]/60" />
      </div>

      <div className="mb-7 flex items-center justify-between gap-4">
        <h3 className={`display text-fluid-2xl font-semibold ${accent}`}>{label}</h3>
        <span
          aria-hidden="true"
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line ${accent}
                      transition-transform duration-slow ease-organic group-hover:scale-110`}
        >
          <Icon name={icon} size={22} />
        </span>
      </div>

      <ol className="space-y-5">
        {data.points.map((point, i) => (
          <li key={point} className="flex gap-4 text-fluid-base leading-relaxed text-ink/85">
            <span aria-hidden="true" className={`micro shrink-0 pt-1 opacity-60 ${accent}`}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="wrap-anywhere">{point}</span>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

/**
 * The API returns both records in one list keyed by `record_for`; the bullets
 * live as <li> inside an HTML blob.
 */
function mapVisionMission(rows) {
  const pick = (kind) => {
    const r = (rows || []).find((x) => String(x.record_for || '').toLowerCase() === kind);
    if (!r) return null;

    // `htmlToText` rather than a bare tag strip: this text is rendered as text,
    // so entities have to be decoded here or the reader sees "farmers&#39;".
    const points = [...String(r.content || '').matchAll(/<li>([\s\S]*?)<\/li>/g)]
      .map((m) => htmlToText(m[1]))
      .filter(Boolean);

    if (!points.length) return null;
    return {
      title: r.title || staticVm[kind]?.title,
      points,
      image: r.photopath || null,
    };
  };

  const vision = pick('vision');
  const mission = pick('mission');
  return vision || mission ? { vision, mission } : null;
}

export default function VisionMission() {
  const { t } = useI18n();

  // Live vision/mission, falling back to the extracted snapshot.
  const { data: vm } = useApiData(getVisionMission, staticVm, mapVisionMission);

  return (
    <section className="band-dark section relative" aria-labelledby="vm-title">
      <FluidBackdrop tone="sun" intensity={0.6} />

      <div className="shell relative">
        <div className="max-w-3xl">
          <Reveal as="p" className="eyebrow mb-5" duration={0.5}>
            {t('section.vision')} &amp; {t('section.mission')}
          </Reveal>
          <TextReveal
            as="h2"
            id="vm-title"
            text="Where we are going, and how we get there"
            className="display text-fluid-3xl font-semibold text-cream"
          />
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
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

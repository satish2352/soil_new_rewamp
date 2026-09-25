import { Link } from 'react-router-dom';
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
 * The two lists are deliberately unequal — Vision has four short aims, Mission
 * two long statements — so the panels are not drawn as twins. Vision takes the
 * wider column and lays its aims out as a grid of tiles; Mission takes the
 * narrower one, sets its statements larger, and closes on a call to action.
 * With identical cards the Mission panel was half empty; this way both panels
 * fill their height with content rather than padding.
 *
 * The image is a *backdrop* rather than a block: both files the CMS points at
 * still 404 on the server, so it sits behind the copy at low opacity with
 * `fallback="none"`. When the uploads are restored the panels gain atmosphere
 * on their own, and until then they are clean typographic cards.
 */
function PanelShell({ data, tone, delay, className = '', children }) {
  const isVision = tone === 'vision';

  return (
    <Reveal
      delay={delay}
      className={`group relative isolate flex flex-col overflow-hidden rounded-[2rem] border
                  bg-[rgb(var(--c-surface))] p-7 shadow-soft transition-all duration-500 ease-organic
                  hover:-translate-y-1.5 hover:shadow-cine sm:p-10
                  ${isVision ? 'border-leaf/25 hover:border-leaf/50' : 'border-sun/25 hover:border-sun/50'}
                  ${className}`}
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

      {/* A soft glow in the panel's own accent, so the two read as a pair of different colours. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-24 -top-24 -z-10 h-64 w-64 rounded-full blur-3xl
                    transition-opacity duration-700 ease-organic group-hover:opacity-100
                    ${isVision ? 'bg-leaf/20 opacity-70' : 'bg-sun/15 opacity-70'}`}
      />

      {children}
    </Reveal>
  );
}

function PanelHeader({ label, tag, icon, accent, ring }) {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div>
        <p className={`micro mb-2 ${accent}`}>{tag}</p>
        <h3 className="display text-fluid-2xl font-semibold">{label}</h3>
      </div>
      <span
        aria-hidden="true"
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border ${ring} ${accent}
                    transition-transform duration-slow ease-organic group-hover:rotate-6 group-hover:scale-110`}
      >
        <Icon name={icon} size={24} />
      </span>
    </header>
  );
}

function VisionPanel({ data, label, tag }) {
  if (!data) return null;

  return (
    <PanelShell data={data} tone="vision" delay={0} className="lg:col-span-7">
      <PanelHeader label={label} tag={tag} icon="sprout" accent="text-sun" ring="border-leaf/40 bg-leaf/10" />

      <ol className="grid flex-1 gap-4 sm:grid-cols-2">
        {data.points.map((point, i) => (
          <li
            key={point}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-[rgb(var(--c-bg))]/40 p-5
                       transition-colors duration-300 ease-organic hover:border-leaf/50 hover:bg-leaf/[0.07]"
          >
            <span aria-hidden="true" className="display text-fluid-xl font-semibold leading-none text-leaf">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="wrap-anywhere text-fluid-base leading-relaxed text-ink/90">{point}</span>
          </li>
        ))}
      </ol>
    </PanelShell>
  );
}

function MissionPanel({ data, label, tag, cta }) {
  if (!data) return null;

  return (
    <PanelShell data={data} tone="mission" delay={0.12} className="lg:col-span-5">
      <PanelHeader label={label} tag={tag} icon="users" accent="text-sun" ring="border-sun/40 bg-sun/10" />

      <ol className="flex-1 divide-y divide-line">
        {data.points.map((point) => (
          <li key={point} className="flex gap-4 py-5 first:pt-0">
            <span
              aria-hidden="true"
              className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sun/15 text-sun"
            >
              <Icon name="check" size={15} />
            </span>
            <span className="wrap-anywhere text-fluid-lg leading-snug text-ink">{point}</span>
          </li>
        ))}
      </ol>

      <Link
        to="/contact"
        className="group/cta mt-8 inline-flex items-center gap-2 self-start rounded-full text-fluid-sm font-semibold
                   text-sun underline-offset-4 hover:underline focus-visible:underline"
      >
        {cta}
        <Icon
          name="arrowRight"
          size={16}
          className="transition-transform duration-300 ease-organic group-hover/cta:translate-x-1"
        />
      </Link>
    </PanelShell>
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
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal as="p" className="eyebrow mb-5" duration={0.5}>
              {t('section.vision')} &amp; {t('section.mission')}
            </Reveal>
            <TextReveal
              as="h2"
              id="vm-title"
              text={t('vm.title')}
              className="display text-fluid-3xl font-semibold text-cream"
            />
          </div>
          <Reveal as="p" delay={0.2} className="max-w-md text-fluid-base leading-relaxed text-muted lg:col-span-5">
            {t('vm.lead')}
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 lg:mt-14 lg:grid-cols-12 lg:gap-8">
          <VisionPanel data={vm.vision} label={t('section.vision')} tag={t('vm.visionTag')} />
          <MissionPanel
            data={vm.mission}
            label={t('section.mission')}
            tag={t('vm.missionTag')}
            cta={t('vm.cta')}
          />
        </div>
      </div>
    </section>
  );
}

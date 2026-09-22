import { Link } from 'react-router-dom';
import staticAbout from '../data/about.json';
import { getAboutUs } from '../lib/api';
import { useApiData } from '../hooks';
import { cleanCmsHtml } from '../lib/cms-html';
import { useI18n } from '../lib/i18n';
import { EASE_CINE, ImageReveal, Reveal, TextReveal, motion, useParallax } from '../lib/motion-react';
import { RichText, SmartImage } from '../components/ui';
import Icon from '../components/Icon';

/**
 * Founder and company story.
 *
 * The milestones below are not new claims — each one is a moment the existing
 * About text already states, pulled out so the story can be scanned as well as
 * read. The full prose is rendered underneath, unchanged.
 */
const MILESTONES = [
  {
    year: '2015',
    text: 'Recognizing this threat in 2015, SCT gave first priority to increase soil fertility and organic carbon.',
  },
  {
    year: '2015–19',
    text: 'From 2015-19, it was impossible to satisfy his appetite using only SCT, so he had to relay on chemical fertilizers.',
  },
  {
    year: '2021',
    text: 'The management of SCT Saptapadi was born in 2021 after some farmers made management mistakes.',
  },
  { year: 'Today', text: 'Vedic technology has been born through the teachings of SCT and Vedic.' },
];

/** Normalises the /frontaboutuslist row into the shape this section renders. */
function mapAbout(row) {
  if (!row) return null;
  return {
    name: String(row.title || '').trim(),
    role: staticAbout.role,
    location: staticAbout.location,
    image: row.photopath || null,
    html: cleanCmsHtml(row.content),
  };
}

export default function About({ compact = false }) {
  const { t } = useI18n();
  const { ref, y } = useParallax(36);

  // Live founder story, with the extracted snapshot as the offline fallback.
  const { data: about } = useApiData(getAboutUs, staticAbout, mapAbout);

  return (
    <section className="section relative" aria-labelledby="about-title" ref={ref}>
      {/*
        Decoration is clipped here rather than on the section: `overflow: hidden`
        on the section turns it into the sticky portrait's scrollport, and since
        it never scrolls the portrait simply stops pinning and rides away with
        the copy. That had been happening — the column read as empty for most of
        the section's height.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[26rem] w-[26rem] blob bg-primary/5" />
      </div>

      <div className="shell relative grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
        {/* ------------------------------------------------------- portrait */}
        <div className="relative lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <ImageReveal className="rounded-leaf shadow-cine">
            <SmartImage
              src={about.image}
              alt={`${about.name} — ${about.role}`}
              ratio="4 / 5"
              className="!bg-cream"
            />
          </ImageReveal>

          {/* Name plate floats over the portrait's lower edge. */}
          <motion.figcaption
            style={{ y }}
            className="parallax-layer relative z-10 -mt-14 ml-4 mr-10 rounded-2xl border border-line
                       bg-canvas/95 p-6 shadow-lift backdrop-blur-md sm:ml-8"
          >
            <p className="font-display text-fluid-lg font-semibold text-deep wrap-anywhere">
              {about.name}
            </p>
            <p className="text-fluid-sm text-primary">{about.role}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-fluid-xs text-muted">
              <Icon name="pin" size={14} />
              {about.location}
            </p>
          </motion.figcaption>
        </div>

        {/* ---------------------------------------------------------- story */}
        <div className="lg:col-span-7">
          <Reveal as="p" className="eyebrow mb-5" duration={0.5}>
            {t('section.about')}
          </Reveal>

          <TextReveal
            as="h2"
            id="about-title"
            text="From depleted soil back to living ground"
            className="display mb-8 text-fluid-3xl font-semibold text-deep"
          />

          <Reveal delay={0.1}>
            <RichText html={about.html} className="max-w-prose" />
          </Reveal>

          {/*
            Milestone rail. The year is set as a micro-label and the spine is a
            hairline rather than a bordered list, so the timeline reads as part
            of the prose column instead of as another component dropped into it.
          */}
          <div className="mt-14">
            <Reveal as="p" className="micro mb-6 text-muted" duration={0.5}>
              {t('section.milestones')}
            </Reveal>

            <ol className="relative space-y-8 border-l border-line pl-8">
              {MILESTONES.map((m, i) => (
                <motion.li
                  key={m.year}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  transition={{ duration: 0.6, delay: i * 0.09, ease: EASE_CINE }}
                  className="group relative"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.3rem] top-2 h-2.5 w-2.5 rounded-full bg-leaf
                               ring-4 ring-[rgb(var(--c-bg))] transition-all duration-slow
                               ease-organic group-hover:scale-125 group-hover:bg-primary"
                  />
                  <p className="display text-fluid-lg font-semibold text-primary">{m.year}</p>
                  <p className="mt-1.5 max-w-prose text-fluid-sm leading-relaxed text-muted wrap-anywhere">
                    {m.text}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>

          {compact && (
            <Reveal delay={0.2} className="mt-10">
              <Link to="/about-us" className="btn-ghost btn-sweep hover:text-cream">
                {t('cta.readMore')}
                <Icon name="arrowRight" size={17} />
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

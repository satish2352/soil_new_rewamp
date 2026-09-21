import { Link } from 'react-router-dom';
import about from '../data/about.json';
import { useI18n } from '../lib/i18n';
import { ImageReveal, Reveal, motion, useParallax } from '../lib/motion';
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
  { year: '2015', text: 'Recognizing this threat in 2015, SCT gave first priority to increase soil fertility and organic carbon.' },
  { year: '2015–19', text: 'From 2015-19, it was impossible to satisfy his appetite using only SCT, so he had to relay on chemical fertilizers.' },
  { year: '2021', text: 'The management of SCT Saptapadi was born in 2021 after some farmers made management mistakes.' },
  { year: 'Today', text: 'Vedic technology has been born through the teachings of SCT and Vedic.' },
];

export default function About({ compact = false }) {
  const { t } = useI18n();
  const { ref, y } = useParallax(36);

  return (
    <section className="section relative overflow-hidden" aria-labelledby="about-title" ref={ref}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-[26rem] w-[26rem] blob bg-primary/5"
      />

      <div className="shell grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Portrait */}
        <div className="relative lg:col-span-5 lg:sticky lg:top-28">
          <ImageReveal className="rounded-leaf shadow-lift">
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
            className="parallax-layer relative z-10 -mt-12 ml-4 mr-8 rounded-2xl border border-line
                       bg-canvas/95 p-5 shadow-lift backdrop-blur-md sm:ml-8"
          >
            <p className="font-display text-fluid-lg font-semibold text-deep">{about.name}</p>
            <p className="text-fluid-sm text-primary">{about.role}</p>
            <p className="mt-1 flex items-center gap-1.5 text-fluid-xs text-muted">
              <Icon name="pin" size={14} />
              {about.location}
            </p>
          </motion.figcaption>
        </div>

        {/* Story */}
        <div className="lg:col-span-7">
          <Reveal as="p" className="eyebrow mb-4">
            {t('section.about')}
          </Reveal>

          <Reveal delay={0.05}>
            <h2
              id="about-title"
              className="mb-6 font-display text-fluid-3xl font-semibold text-deep"
            >
              From depleted soil back to living ground
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <RichText html={about.html} className="max-w-prose" />
          </Reveal>

          {/* Milestone rail */}
          <Reveal delay={0.15} className="mt-10">
            <ol className="relative space-y-5 border-l border-line pl-7">
              {MILESTONES.map((m, i) => (
                <motion.li
                  key={m.year}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  transition={{ duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.05rem] top-1.5 h-3 w-3 rounded-full border-2 border-canvas bg-leaf"
                  />
                  <p className="font-display text-fluid-base font-semibold text-primary">{m.year}</p>
                  <p className="mt-0.5 text-fluid-sm leading-relaxed text-ink/80 wrap-anywhere">
                    {m.text}
                  </p>
                </motion.li>
              ))}
            </ol>
          </Reveal>

          {compact && (
            <Reveal delay={0.2} className="mt-8">
              <Link to="/about-us" className="btn-ghost">
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

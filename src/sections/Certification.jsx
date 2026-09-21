import { iso } from '../data/site';
import { useI18n } from '../lib/i18n';
import { ImageReveal, Reveal } from '../lib/motion';
import Icon from '../components/Icon';

/**
 * Trust band. The certification wording and the two-paragraph company statement
 * are reproduced exactly as the live site states them.
 */
export default function Certification({ onEnquiry }) {
  const { t } = useI18n();

  return (
    <section className="band-dark section relative overflow-hidden" aria-labelledby="iso-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-20 h-[22rem] w-[22rem] blob bg-sun/8"
      />

      <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <ImageReveal className="mx-auto max-w-[18rem] lg:col-span-4 lg:max-w-none">
          <img
            src={iso.image}
            alt="ISO 9001:2008 certification mark"
            loading="lazy"
            decoding="async"
            className="mx-auto h-auto w-full max-w-[20rem] object-contain drop-shadow-lg"
          />
        </ImageReveal>

        <div className="lg:col-span-8">
          <Reveal as="p" className="eyebrow mb-4">
            <Icon name="award" size={15} />
            Certification
          </Reveal>

          <Reveal delay={0.05}>
            <h2 id="iso-title" className="font-display text-fluid-3xl font-semibold text-deep">
              {iso.heading}
              <span className="mt-1 block text-fluid-xl font-normal tracking-[0.1em] text-primary">
                {iso.subheading}
              </span>
            </h2>
          </Reveal>

          <div className="mt-7 max-w-prose space-y-4">
            {iso.paragraphs.map((p, i) => (
              <Reveal key={p} delay={0.1 + i * 0.06}>
                <p className="text-fluid-base leading-relaxed text-ink/80 wrap-anywhere">{p}</p>
              </Reveal>
            ))}
          </div>

          {onEnquiry && (
            <Reveal delay={0.25} className="mt-8">
              <button type="button" onClick={onEnquiry} className="btn-primary">
                {t('cta.sendEnquiry')}
                <Icon name="arrowRight" size={18} />
              </button>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

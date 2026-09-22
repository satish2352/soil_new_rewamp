import { iso } from '../data/site';
import { useI18n } from '../lib/i18n';
import { ImageReveal, LineReveal, Reveal } from '../lib/motion-react';
import MagneticButton from '../components/MagneticButton';
import Icon from '../components/Icon';
import FluidBackdrop from '../components/FluidBackdrop';

/**
 * Trust band. The certification wording and the two-paragraph company statement
 * are reproduced exactly as the live site states them.
 *
 * The certification line is the one claim on the page a prospective distributor
 * actually checks, so it is set as a display line rather than as a section
 * title in a card — and the mark sits beside it at size instead of shrunk into
 * a column. The CTA is the closing action of the whole page, which is why it
 * gets the magnetic treatment.
 */
export default function Certification({ onEnquiry }) {
  const { t } = useI18n();

  return (
    <section className="band-void section relative overflow-hidden" aria-labelledby="iso-title">
      <FluidBackdrop tone="earth" intensity={0.8} />

      <div className="shell relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <ImageReveal className="mx-auto max-w-[16rem] lg:col-span-4 lg:max-w-none" from="left">
          <img
            src={iso.image}
            alt="ISO 9001:2008 certification mark"
            loading="lazy"
            decoding="async"
            className="mx-auto h-auto w-full max-w-[20rem] object-contain drop-shadow-lg"
          />
        </ImageReveal>

        <div className="lg:col-span-8">
          <Reveal as="p" className="eyebrow mb-5" duration={0.5}>
            <Icon name="award" size={15} />
            Certification
          </Reveal>

          {/*
            Split across two lines so the certification number lands on its own
            line at display size — it is the part that carries the weight, and
            wrapped into a paragraph it reads as fine print.
          */}
          <LineReveal
            as="h2"
            id="iso-title"
            lines={[iso.heading, iso.subheading]}
            className="display text-fluid-3xl font-semibold text-cream"
            lineClassName="wrap-anywhere"
            accentIndex={1}
            accentClassName="text-sun font-normal tracking-[0.06em]"
          />

          <div className="mt-8 max-w-prose space-y-5">
            {iso.paragraphs.map((p, i) => (
              <Reveal key={p} delay={0.1 + i * 0.06}>
                <p className="text-fluid-base leading-relaxed text-muted wrap-anywhere">{p}</p>
              </Reveal>
            ))}
          </div>

          {onEnquiry && (
            <Reveal delay={0.25} className="mt-10">
              <MagneticButton onClick={onEnquiry} className="btn-primary btn-sweep !px-8 !py-4">
                {t('cta.sendEnquiry')}
                <Icon name="arrowRight" size={18} />
              </MagneticButton>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

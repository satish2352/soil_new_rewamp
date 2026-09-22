import { contact } from '../data/site';
import { useI18n } from '../lib/i18n';
import { Reveal, TextReveal } from '../lib/motion-react';
import MagneticButton from '../components/MagneticButton';
import Icon from '../components/Icon';

/**
 * Contact block. Address, both phone numbers, all three email addresses and the
 * existing Google Maps embed — all exactly as published on the live site.
 *
 * Presentation change: these were four separate cards in a column beside the
 * map, so the page's closing moment was a stack of boxes. The details are now
 * one continuous panel divided by hairlines, which reads as a single contact
 * card rather than four unrelated ones, and lets the map run full height beside
 * it. Nothing was removed — every number, address line and labelled address is
 * still here.
 */

function Row({ icon, title, children, delay = 0 }) {
  return (
    <Reveal delay={delay} className="flex gap-5 py-7 first:pt-0 last:pb-0">
      <span
        aria-hidden="true"
        className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
      >
        <Icon name={icon} size={19} />
      </span>
      <div className="min-w-0">
        <h3 className="mb-2 font-display text-fluid-lg text-deep">{title}</h3>
        {children}
      </div>
    </Reveal>
  );
}

export default function ContactSection({ onEnquiry }) {
  const { t } = useI18n();

  return (
    <section className="section relative overflow-hidden" aria-labelledby="contact-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-10 h-[22rem] w-[22rem] blob bg-leaf/6"
      />

      <div className="shell relative">
        <div className="max-w-3xl">
          <Reveal as="p" className="eyebrow mb-5" duration={0.5}>
            {t('cta.getInTouch')}
          </Reveal>
          <TextReveal
            as="h2"
            id="contact-title"
            text={t('section.contact')}
            className="display text-fluid-3xl font-semibold text-deep"
          />
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Details — one panel, divided, not four cards. */}
          <div className="lg:col-span-5">
            <div className="divide-y divide-line rounded-[1.5rem] border border-line/70 bg-surface p-7 shadow-soft sm:p-9">
              <Row icon="pin" title={t('section.address')}>
                <address className="not-italic text-fluid-sm leading-relaxed text-muted wrap-anywhere">
                  {contact.address.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </Row>

              <Row icon="phone" title={t('section.mobile')} delay={0.07}>
                <ul className="space-y-1">
                  {contact.phones.map((p) => (
                    <li key={p.tel}>
                      <a
                        href={`tel:${p.tel}`}
                        className="group inline-flex min-h-[40px] items-center gap-2 text-fluid-sm
                                   text-muted transition-colors hover:text-primary"
                      >
                        <span
                          aria-hidden="true"
                          className="h-px w-0 bg-primary transition-all duration-slow ease-organic group-hover:w-4"
                        />
                        {p.display}
                      </a>
                    </li>
                  ))}
                </ul>
              </Row>

              <Row icon="mail" title={t('section.mails')} delay={0.14}>
                <ul className="space-y-3">
                  {contact.emails.map((e) => (
                    <li key={e.address}>
                      <span className="micro block text-muted/70">{e.label}</span>
                      <a
                        href={`mailto:${e.address}`}
                        className="inline-flex min-h-[38px] items-center text-fluid-sm text-ink/85
                                   transition-colors hover:text-primary wrap-anywhere"
                      >
                        {e.address}
                      </a>
                    </li>
                  ))}
                </ul>
              </Row>
            </div>

            {onEnquiry && (
              <Reveal delay={0.2} className="mt-6">
                <MagneticButton
                  onClick={onEnquiry}
                  className="btn-primary btn-sweep w-full !py-4"
                >
                  {t('cta.sendEnquiry')}
                  <Icon name="arrowRight" size={18} />
                </MagneticButton>
              </Reveal>
            )}
          </div>

          {/* Map — the same embed the live site uses. */}
          <Reveal
            delay={0.1}
            className="overflow-hidden rounded-[1.5rem] border border-line shadow-soft lg:col-span-7"
          >
            <iframe
              src={contact.mapEmbed}
              title="Soil Charger Technology on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-[22rem] w-full border-0 lg:h-full lg:min-h-[32rem]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import { contact } from '../data/site';
import { useI18n } from '../lib/i18n';
import { Reveal } from '../lib/motion';
import Icon from '../components/Icon';

/**
 * Contact block. Address, both phone numbers, all three email addresses and the
 * existing Google Maps embed — all exactly as published on the live site.
 */
export default function ContactSection({ onEnquiry }) {
  const { t } = useI18n();

  return (
    <section className="section relative overflow-hidden" aria-labelledby="contact-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-10 h-[22rem] w-[22rem] blob bg-leaf/6"
      />

      <div className="shell">
        <Reveal className="mb-12 flex flex-col items-center gap-4 text-center">
          <p className="eyebrow">{t('cta.getInTouch')}</p>
          <h2 id="contact-title" className="font-display text-fluid-3xl font-semibold text-deep">
            {t('section.contact')}
          </h2>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Details */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <Reveal className="card p-6">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon name="pin" size={20} />
              </span>
              <h3 className="mb-2 font-display text-fluid-lg text-deep">{t('section.address')}</h3>
              <address className="not-italic text-fluid-sm leading-relaxed text-muted wrap-anywhere">
                {contact.address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </Reveal>

            <Reveal delay={0.07} className="card p-6">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon name="phone" size={19} />
              </span>
              <h3 className="mb-2 font-display text-fluid-lg text-deep">{t('section.mobile')}</h3>
              <ul className="space-y-1.5">
                {contact.phones.map((p) => (
                  <li key={p.tel}>
                    <a
                      href={`tel:${p.tel}`}
                      className="inline-flex min-h-[40px] items-center text-fluid-sm text-muted transition-colors hover:text-primary"
                    >
                      {p.display}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.14} className="card p-6 sm:col-span-2 lg:col-span-1">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon name="mail" size={19} />
              </span>
              <h3 className="mb-3 font-display text-fluid-lg text-deep">{t('section.mails')}</h3>
              <ul className="space-y-2.5">
                {contact.emails.map((e) => (
                  <li key={e.address}>
                    <span className="block text-fluid-xs uppercase tracking-wide text-muted/70">
                      {e.label} :
                    </span>
                    <a
                      href={`mailto:${e.address}`}
                      className="inline-flex min-h-[38px] items-center text-fluid-sm text-ink/85 transition-colors hover:text-primary wrap-anywhere"
                    >
                      {e.address}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>

            {onEnquiry && (
              <Reveal delay={0.2} className="sm:col-span-2 lg:col-span-1">
                <button type="button" onClick={onEnquiry} className="btn-primary w-full">
                  {t('cta.sendEnquiry')}
                  <Icon name="arrowRight" size={18} />
                </button>
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
              className="h-[22rem] w-full border-0 lg:h-full lg:min-h-[28rem]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

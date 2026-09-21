import { Link } from 'react-router-dom';
import { company, contact, socials } from '../data/site';
import { useI18n } from '../lib/i18n';
import { Reveal } from '../lib/motion';
import Icon from './Icon';

/** Footer link columns — the legacy "Usefull Links" list, kept as-is. */
const LINKS = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.gallery', to: '/gallery' },
  { key: 'nav.career', to: '/careers' },
  { key: 'nav.blog', to: '/blogs' },
  { key: 'nav.company', to: '/about-us' },
  { key: 'nav.products', to: '/products' },
];

export default function Footer({ onEnquiry }) {
  const { t } = useI18n();

  return (
    <footer className="relative mt-auto overflow-hidden bg-deep text-cream/85">
      {/* Soil-layer edge: the ground the whole site has been standing on. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-leaf/40 to-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 blob bg-leaf/10"
      />

      <div className="shell relative grid gap-10 py-section sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        {/* Brand + address */}
        <Reveal className="lg:col-span-4">
          <Link to="/" className="mb-5 inline-flex items-center gap-3">
            <img
              src="/img/brand/logo-mark.png"
              alt=""
              width="48"
              height="48"
              loading="lazy"
              className="h-12 w-12 rounded-full bg-white/95 object-contain p-1.5"
            />
            <span className="font-display text-fluid-lg font-semibold text-cream">
              {company.name}
            </span>
          </Link>

          <p className="mb-2 text-fluid-xs font-semibold uppercase tracking-[0.16em] text-sun">
            {company.certification}
          </p>

          <h2 className="mb-2 mt-6 font-display text-fluid-lg text-cream">{t("section.address")}</h2>
          <address className="not-italic text-fluid-sm leading-relaxed text-cream/75 wrap-anywhere">
            {contact.address.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>

          <div className="mt-5 flex flex-wrap gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/20
                           transition-all duration-300 hover:border-sun hover:bg-sun/15 hover:text-sun"
              >
                <Icon name={s.icon} size={18} />
              </a>
            ))}
          </div>
        </Reveal>

        {/* Phones */}
        <Reveal delay={0.06} className="lg:col-span-3">
          <h2 className="mb-4 font-display text-fluid-lg text-cream">{t('section.mobile')}</h2>
          <ul className="space-y-2.5">
            {contact.phones.map((p) => (
              <li key={p.tel}>
                <a
                  href={`tel:${p.tel}`}
                  className="inline-flex min-h-[40px] items-center gap-2.5 text-fluid-sm text-cream/80 transition-colors hover:text-sun"
                >
                  <Icon name="phone" size={16} className="shrink-0 text-leaf" />
                  {p.display}
                </a>
              </li>
            ))}
          </ul>

          <h2 className="mb-4 mt-8 font-display text-fluid-lg text-cream">{t('section.mails')}</h2>
          <ul className="space-y-3">
            {contact.emails.map((e) => (
              <li key={e.address}>
                <span className="block text-fluid-xs uppercase tracking-wide text-cream/50">
                  {e.label} :
                </span>
                <a
                  href={`mailto:${e.address}`}
                  className="inline-flex min-h-[38px] items-center text-fluid-sm text-cream/85 transition-colors hover:text-sun wrap-anywhere"
                >
                  {e.address}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Links */}
        <Reveal delay={0.12} className="lg:col-span-3">
          <h2 className="mb-4 font-display text-fluid-lg text-cream">{t('section.usefulLinks')}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 lg:grid-cols-1">
            {LINKS.map((l) => (
              <li key={l.to + l.key}>
                <Link
                  to={l.to}
                  className="group inline-flex min-h-[40px] items-center gap-2 text-fluid-sm text-cream/80 transition-colors hover:text-sun"
                >
                  <span className="h-px w-3 bg-leaf/60 transition-all duration-300 group-hover:w-5 group-hover:bg-sun" />
                  {t(l.key)}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={onEnquiry}
                className="group inline-flex min-h-[40px] items-center gap-2 text-fluid-sm text-cream/80 transition-colors hover:text-sun"
              >
                <span className="h-px w-3 bg-leaf/60 transition-all duration-300 group-hover:w-5 group-hover:bg-sun" />
                {t('cta.sendEnquiry')}
              </button>
            </li>
          </ul>
        </Reveal>

        {/* Website + CTA */}
        <Reveal delay={0.18} className="lg:col-span-2">
          <h2 className="mb-4 font-display text-fluid-lg text-cream">{t('section.website')}</h2>
          <a
            href={company.legacyOrigin}
            className="inline-flex min-h-[40px] items-center text-fluid-sm text-cream/80 transition-colors hover:text-sun wrap-anywhere"
          >
            {company.website}
          </a>

          <button type="button" onClick={onEnquiry} className="btn-accent mt-6 w-full !px-4 text-fluid-xs">
            {t('cta.getInTouch')}
          </button>
        </Reveal>
      </div>

      <div className="border-t border-cream/12">
        <div className="shell flex flex-col items-center justify-between gap-3 py-5 text-fluid-xs text-cream/60 sm:flex-row">
          <p>{company.copyright}</p>
          <p className="flex items-center gap-2">
            <Icon name="leaf" size={14} className="text-leaf" />
            {company.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}

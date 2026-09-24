import { Link } from 'react-router-dom';
import { company, contact, socials } from '../data/site';
import { useI18n } from '../lib/i18n';
import { LineReveal, Reveal } from '../lib/motion-react';
import MagneticButton from './MagneticButton';
import Icon from './Icon';
import FluidBackdrop from './FluidBackdrop';

/** Footer link columns — the legacy "Usefull Links" list, kept as-is. */
const LINKS = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.gallery', to: '/gallery' },
  { key: 'nav.career', to: '/careers' },
  { key: 'nav.blog', to: '/blogs' },
  { key: 'nav.company', to: '/about-us' },
  { key: 'nav.products', to: '/products' },
];

/**
 * Footer.
 *
 * It opens with the company's own tagline set at display size. That is the last
 * thing a visitor reads, and on the live site it was a 12px line squeezed next
 * to the copyright — giving it the closing position costs nothing and makes the
 * page end on a statement rather than on small print.
 *
 * Every address, number, email and social link is unchanged.
 */
export default function Footer({ onEnquiry }) {
  const { t } = useI18n();

  return (
    <footer className="band-void relative mt-auto overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-leaf/40 to-transparent"
      />
      <FluidBackdrop tone="leaf" intensity={0.7} />

      {/* ------------------------------------------------------- sign-off */}
      <div className="shell relative border-b border-line/60 py-10 lg:py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <LineReveal
            as="p"
            lines={[company.tagline]}
            className="display max-w-3xl text-fluid-2xl font-semibold text-cream"
            lineClassName="wrap-anywhere"
          />

          <Reveal delay={0.12} className="shrink-0">
            <MagneticButton onClick={onEnquiry} className="btn-primary btn-sweep !px-8 !py-4">
              {t('cta.getInTouch')}
              <Icon name="arrowRight" size={18} />
            </MagneticButton>
          </Reveal>
        </div>
      </div>

      {/* --------------------------------------------------------- columns */}
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

          <p className="micro mb-6 text-sun">{company.certification}</p>

          <h2 className="mb-2 font-display text-fluid-lg text-cream">{t('section.address')}</h2>
          <address className="not-italic text-fluid-sm leading-relaxed text-muted wrap-anywhere">
            {contact.address.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>

          <div className="mt-6 flex flex-wrap gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-11 w-11 place-items-center rounded-full border border-line
                           transition-all duration-300 ease-organic hover:-translate-y-0.5
                           hover:border-sun hover:bg-sun/15 hover:text-sun"
              >
                <Icon name={s.icon} size={18} />
              </a>
            ))}
          </div>
        </Reveal>

        {/* Phones + emails */}
        <Reveal delay={0.06} className="lg:col-span-3">
          <h2 className="mb-4 font-display text-fluid-lg text-cream">{t('section.mobile')}</h2>
          <ul className="space-y-2">
            {contact.phones.map((p) => (
              <li key={p.tel}>
                <a
                  href={`tel:${p.tel}`}
                  className="group inline-flex min-h-[40px] items-center gap-2.5 text-fluid-sm
                             text-muted transition-colors hover:text-sun"
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
                <span className="micro block text-muted/70">{e.label}</span>
                <a
                  href={`mailto:${e.address}`}
                  className="inline-flex min-h-[38px] items-center text-fluid-sm text-cream/85
                             transition-colors hover:text-sun wrap-anywhere"
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
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 lg:grid-cols-1">
            {LINKS.map((l) => (
              <li key={l.to + l.key}>
                <Link
                  to={l.to}
                  className="group inline-flex min-h-[40px] items-center gap-2 text-fluid-sm
                             text-muted transition-colors hover:text-sun"
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
                className="group inline-flex min-h-[40px] items-center gap-2 text-fluid-sm
                           text-muted transition-colors hover:text-sun"
              >
                <span className="h-px w-3 bg-leaf/60 transition-all duration-300 group-hover:w-5 group-hover:bg-sun" />
                {t('cta.sendEnquiry')}
              </button>
            </li>
          </ul>
        </Reveal>

        {/* Website */}
        <Reveal delay={0.18} className="lg:col-span-2">
          <h2 className="mb-4 font-display text-fluid-lg text-cream">{t('section.website')}</h2>
          <a
            href={company.legacyOrigin}
            className="inline-flex min-h-[40px] items-center text-fluid-sm text-muted
                       transition-colors hover:text-sun wrap-anywhere"
          >
            {company.website}
          </a>
        </Reveal>
      </div>

      <div className="relative border-t border-line/60">
        <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-fluid-xs text-muted sm:flex-row">
          <p>{company.copyright}</p>
          <p className="flex items-center gap-2">
            <Icon name="leaf" size={14} className="text-leaf" />
            {company.website}
          </p>
        </div>
      </div>
    </footer>
  );
}

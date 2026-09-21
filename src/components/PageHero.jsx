import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { motion } from '../lib/motion';
import { EASE } from '../lib/motion';
import Icon from './Icon';

/**
 * Compact hero for inner pages. Keeps the breadcrumb the legacy templates had,
 * on a soil-toned band so the sticky header stays legible over it.
 */
export default function PageHero({ title, eyebrow, lead, crumbs = [] }) {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-deep pb-14 pt-32 sm:pb-20 sm:pt-40">
      <div aria-hidden="true" className="absolute inset-0 grain opacity-50" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 blob bg-leaf/12 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 blob bg-sun/8 blur-3xl"
      />

      <div className="shell relative">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="-my-2 flex flex-wrap items-center gap-x-1.5 text-fluid-xs text-cream/60">
            <li>
              <Link to="/" className="inline-flex min-h-[40px] items-center transition-colors hover:text-sun">
                {t('nav.home')}
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <Icon name="chevronRight" size={13} className="opacity-50" />
                {c.to ? (
                  <Link
                    to={c.to}
                    className="inline-flex min-h-[40px] items-center transition-colors hover:text-sun"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className="inline-flex min-h-[40px] items-center text-cream/85 wrap-anywhere">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mb-3 inline-flex items-center gap-2 text-fluid-xs font-semibold uppercase tracking-[0.18em] text-sun"
          >
            <Icon name="leaf" size={14} />
            {eyebrow}
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
          className="max-w-4xl font-display text-fluid-3xl font-semibold text-cream wrap-anywhere"
        >
          {title}
        </motion.h1>

        {lead && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
            className="mt-4 max-w-prose text-fluid-base leading-relaxed text-cream/75"
          >
            {lead}
          </motion.p>
        )}
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-8 w-full text-canvas sm:h-12"
      >
        <path fill="currentColor" d="M0 60h1440V22c-150 22-320 32-520 22S540 14 360 22 110 40 0 24z" />
      </svg>
    </section>
  );
}

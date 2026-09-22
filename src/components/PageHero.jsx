import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { DUR, EASE, EASE_CINE, LineReveal, motion } from '../lib/motion-react';
import Icon from './Icon';

/**
 * Hero for inner pages.
 *
 * It has to do two jobs that the homepage hero does not: give the sticky header
 * something dark to sit on from the very first pixel, and name where you are.
 * So it keeps the legacy breadcrumb and sets the title on the same `display`
 * ramp the homepage uses, on the deepest band — which makes arriving on any
 * route feel like the same site rather than a different template.
 *
 * The wave SVG that used to close this band is gone. A scalloped divider is the
 * single most dated shape a 2015 template had, and the section below now
 * overlaps it with `.lift-edge` instead — the same transition every other band
 * boundary on the site uses.
 */
export default function PageHero({ title, eyebrow, lead, crumbs = [] }) {
  const { t } = useI18n();

  return (
    <section className="page-hero band-void relative overflow-hidden pb-24 pt-32 sm:pb-28 sm:pt-44">
      <div aria-hidden="true" className="absolute inset-0 grain opacity-50" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 blob bg-leaf/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 blob bg-sun/8 blur-3xl"
      />

      <div className="shell relative">
        <nav aria-label="Breadcrumb" className="mb-7">
          <ol className="-my-2 flex flex-wrap items-center gap-x-1.5 text-fluid-xs text-cream/55">
            <li>
              <Link
                to="/"
                className="inline-flex min-h-[40px] items-center transition-colors hover:text-sun"
              >
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
            className="mb-4 inline-flex items-center gap-2 text-fluid-xs font-semibold uppercase tracking-[0.18em] text-sun"
          >
            <Icon name="leaf" size={14} />
            {eyebrow}
          </motion.p>
        )}

        {/*
          One line, masked. Product and article titles arrive here as arbitrary
          CMS strings of any length, so they are not split into fixed lines —
          the string wraps naturally inside a single mask.
        */}
        <LineReveal
          as="h1"
          lines={[title]}
          className="display max-w-5xl text-fluid-4xl font-semibold text-cream"
          lineClassName="wrap-anywhere"
          delay={0.08}
        />

        {lead && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, delay: 0.22, ease: EASE_CINE }}
            className="mt-6 max-w-prose text-fluid-lg leading-relaxed text-muted"
          >
            {lead}
          </motion.p>
        )}
      </div>
    </section>
  );
}

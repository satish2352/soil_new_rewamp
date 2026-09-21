import { useState } from 'react';
import { Reveal, TextReveal } from '../lib/motion';
import { useI18n } from '../lib/i18n';
import Icon from './Icon';

/** Section heading with an eyebrow line and a two-tone title. */
export function SectionHeading({
  eyebrow,
  lead,
  title,
  align = 'center',
  className = '',
  id,
  tone = 'light',
}) {
  const alignment =
    align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left';
  const dark = tone === 'dark';

  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignment} ${className}`}>
      {eyebrow && (
        <Reveal as="p" className={dark ? 'eyebrow eyebrow-dark' : 'eyebrow'} duration={0.5}>
          {eyebrow}
        </Reveal>
      )}
      <TextReveal
        as="h2"
        id={id}
        text={lead ? `${lead} ${title}` : title}
        className={`font-display text-fluid-3xl font-semibold ${dark ? 'text-cream' : 'text-deep'}`}
      />
    </div>
  );
}

/**
 * Image with a graceful failure path. The legacy CMS has dead media rows, so a
 * broken URL must degrade to a soil-toned placeholder rather than a broken icon.
 */
export function SmartImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  ratio = '4 / 3',
  loading = 'lazy',
  sizes,
  /** 'placeholder' draws the soil-toned stand-in; 'none' stays transparent so
   *  whatever sits behind the image (e.g. the hero backdrop) shows through. */
  fallback = 'placeholder',
  ...rest
}) {
  const [status, setStatus] = useState(src ? 'loading' : 'error');
  const bare = fallback === 'none';

  return (
    <div
      className={`relative overflow-hidden ${bare ? '' : 'bg-cream'} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {status !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          sizes={sizes}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
          className={`h-full w-full object-cover transition-opacity duration-700
                      ${status === 'ready' ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          {...rest}
        />
      )}

      {status !== 'ready' && !bare && (
        <div
          className="absolute inset-0 grid place-items-center bg-gradient-to-br from-cream to-[rgb(var(--c-line))]"
          aria-hidden="true"
        >
          <Icon name="sprout" size={30} className="text-leaf/40" />
        </div>
      )}
    </div>
  );
}

/** Small pill used for categories and filters. `tone` matches the band behind it. */
export function Chip({ active, children, className = '', tone = 'light', ...rest }) {
  const dark = tone === 'dark';

  const styles = dark
    ? active
      ? 'border-sun bg-sun text-deep shadow-soft'
      : 'border-cream/30 bg-cream/8 text-cream/85 hover:border-sun/60 hover:text-sun'
    : active
      ? 'border-primary bg-primary text-cream shadow-soft'
      : 'border-line bg-surface text-ink/75 hover:border-primary/40 hover:text-primary';

  return (
    <button
      type="button"
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-fluid-xs font-semibold
                  transition-all duration-300 ease-organic min-h-[40px] ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Inline loading state that keeps layout height stable. */
export function Loading({ rows = 3, className = '' }) {
  const { t } = useI18n();
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-live="polite">
      <span className="sr-only">{t('a11y.loading')}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-full bg-line/60"
          style={{ width: `${88 - i * 14}%` }}
        />
      ))}
    </div>
  );
}

/** Error state with a retry, used whenever a live API call fails. */
export function ErrorState({ onRetry, message, className = '' }) {
  const { t } = useI18n();
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border border-line bg-cream/60 px-6 py-8 text-center ${className}`}
      role="alert"
    >
      <Icon name="alert" size={26} className="text-earth" />
      <p className="text-fluid-sm text-muted">{message || t('a11y.error')}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost">
          {t('a11y.retry')}
        </button>
      )}
    </div>
  );
}

/** Decorative organic blob. Purely visual, hidden from assistive tech. */
export function Blob({ className = '', style }) {
  return (
    <div
      aria-hidden="true"
      className={`blob pointer-events-none absolute -z-10 ${className}`}
      style={style}
    />
  );
}

/** Renders CMS HTML from the existing API inside the .rich type scale. */
export function RichText({ html, className = '' }) {
  if (!html) return null;
  return (
    <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

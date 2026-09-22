import { useEffect, useMemo, useState } from 'react';
import { Reveal, TextReveal } from '../lib/motion-react';
import { imageChain } from '../lib/images';
import { useI18n } from '../lib/i18n';
import Icon from './Icon';

/**
 * Section heading: eyebrow, title, and an optional trailing action.
 *
 * The default alignment is left, not centre. Centring every heading on a page
 * is one of the strongest tells that a layout came from a template — it removes
 * the only axis the reader can use to tell one section from another, and it
 * fights the natural reading edge that every paragraph beneath it uses anyway.
 * `align="center"` is still available for the few places that earn it.
 *
 * `action` renders opposite the title on wide screens, so "view all" style
 * links belong to the heading rather than floating at the foot of the section.
 */
export function SectionHeading({
  eyebrow,
  lead,
  title,
  action,
  align = 'left',
  className = '',
  id,
  tone = 'light',
}) {
  const centred = align === 'center';
  const dark = tone === 'dark';

  return (
    <div
      className={`flex flex-col gap-6 ${
        centred ? 'items-center text-center' : 'lg:flex-row lg:items-end lg:justify-between'
      } ${className}`}
    >
      <div className={`flex max-w-3xl flex-col gap-4 ${centred ? 'items-center' : 'items-start'}`}>
        {/* No tone variant: `.eyebrow` reads `--c-primary`, which each band already remaps. */}
        {eyebrow && (
          <Reveal as="p" className="eyebrow" duration={0.5}>
            {eyebrow}
          </Reveal>
        )}
        <TextReveal
          as="h2"
          id={id}
          text={lead ? `${lead} ${title}` : title}
          className={`display text-fluid-3xl font-semibold ${dark ? 'text-cream' : 'text-deep'}`}
        />
      </div>

      {action && (
        <Reveal delay={0.1} className="shrink-0">
          {action}
        </Reveal>
      )}
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
  /*
    Candidate urls to try, in order, from lib/images: by default the live API
    url first and the local mirror only as a fallback. `VITE_IMAGE_SOURCE`
    changes that policy in one place; see lib/images.js.
  */
  const chain = useMemo(() => imageChain(src), [src]);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState(chain.length ? 'loading' : 'error');
  const bare = fallback === 'none';
  const source = chain[step] || null;

  // A new `src` (filter change, carousel step) restarts the chain.
  useEffect(() => {
    setStep(0);
    setStatus(chain.length ? 'loading' : 'error');
  }, [chain]);

  const handleError = () => {
    // Try the next candidate; the placeholder is only for when all of them fail.
    if (step + 1 < chain.length) {
      setStep(step + 1);
      setStatus('loading');
      return;
    }
    setStatus('error');
  };

  return (
    <div
      className={`relative overflow-hidden ${bare ? '' : 'bg-[rgb(var(--c-surface))]'} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {status !== 'error' && source && (
        <img
          src={source}
          alt={alt}
          loading={loading}
          decoding="async"
          sizes={sizes}
          onLoad={() => setStatus('ready')}
          onError={handleError}
          className={`h-full w-full object-cover transition-opacity duration-700
                      ${status === 'ready' ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          {...rest}
        />
      )}

      {status !== 'ready' && !bare && (
        <div
          className="absolute inset-0 grid place-items-center bg-gradient-to-br
                     from-[rgb(var(--c-surface))] to-[rgb(var(--c-line))]"
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

/**
 * Renders CMS HTML from the existing API inside the .rich type scale.
 * `lang` matters: the stylesheet justifies Latin copy but leaves Devanagari
 * ragged-right, since browsers cannot hyphenate it.
 */
export function RichText({ html, className = '', lang }) {
  if (!html) return null;
  return (
    <div
      className={`rich ${className}`}
      lang={lang}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

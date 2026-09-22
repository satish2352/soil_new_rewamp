import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import staticProducts from '../data/products.json';
import { productsIntro } from '../data/site';
import { getProducts } from '../lib/api';
import { useAsync } from '../hooks';
import { useI18n } from '../lib/i18n';
import { Reveal, TextReveal } from '../lib/motion-react';
import { useTilt } from '../lib/motion';
import { Chip, SmartImage } from '../components/ui';
import Icon from '../components/Icon';
import HorizontalScene from '../components/HorizontalScene';

/**
 * Product families. The live catalogue splits cleanly into the two ranges the
 * names already declare — no category was invented; the grouping is read off the
 * product names themselves.
 */
const FAMILIES = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'vedic', label: 'SCT VEDIC', match: (n) => n.startsWith('SCT VEDIC') },
  { key: 'super', label: 'SUPER', match: (n) => n.startsWith('SUPER') },
  { key: 'other', label: 'VEDIC', match: (n) => n.startsWith('VEDIC') },
];

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Normalises an API row into the same shape the extracted JSON uses. */
function fromApi(row) {
  const name = String(row.title || '').trim().replace(/\s+/g, ' ');
  return {
    id: row.id,
    slug: slugify(name),
    name,
    shortDescription: row.short_description || '',
    image: row.productphotopath || null,
  };
}

/**
 * Product card. Carries `band-light` so it keeps the light palette even when the
 * section around it is a deep-green band — the packshots are transparent PNGs
 * that need a pale backdrop to read.
 */
export function ProductCard({ product, index = 0, showDescription = true, className = '' }) {
  const { t } = useI18n();
  /*
    Restrained 3D tilt, capped at ±5deg by `useTilt`. Past that the packshot
    and the product name start to keystone visibly and the effect stops
    reading as depth. Desktop pointers only, and off under reduced motion.
  */
  const tiltRef = useTilt({ max: 5 });

  return (
    /*
      The tilt lives on a wrapper, not on the card itself, and that separation
      is load-bearing: `Reveal` is a framer-motion component that owns the
      card's `transform` for its fade-up, and GSAP writing `rotationX` to the
      same element would have the two engines overwriting each other's matrix
      every frame. One element per engine, nested — framer-motion animates the
      inner card, GSAP rotates the outer box. `Reveal` also does not forward
      refs, so the ref could not have gone there in any case.
    */
    <div ref={tiltRef} data-scene-item="" className={`persp ${className}`}>
      <Reveal
        as="article"
        delay={Math.min(index, 7) * 0.06}
        className="band-light group relative flex h-full flex-col overflow-hidden rounded-[1.5rem]
                   border border-line/70 bg-surface shadow-soft transition-all duration-500 ease-organic
                   hover:-translate-y-2 hover:border-primary/25 hover:shadow-cine"
      >
      <Link
        to={`/products/${product.id}`}
        className="flex h-full flex-col focus-visible:outline-none"
        aria-label={product.name}
      >
        <div className="relative overflow-hidden bg-cream">
          {/* A soft wash rises behind the packshot on hover — light, not a scrim. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-leaf/20 to-transparent opacity-0
                       transition-opacity duration-slow ease-organic group-hover:opacity-100"
          />
          <SmartImage
            src={product.image}
            alt={product.name}
            ratio="1 / 1"
            className="!bg-transparent"
            imgClassName="object-contain p-5 transition-transform duration-700 ease-organic
                          group-hover:-translate-y-2 group-hover:scale-[1.06]"
          />
        </div>

        <div className="flex grow flex-col p-5">
          <h3 className="font-display text-fluid-base font-semibold leading-snug text-deep wrap-anywhere">
            {product.name}
          </h3>

          {showDescription && product.shortDescription && (
            <p className="mt-2 line-clamp-3 text-fluid-sm leading-relaxed text-muted">
              {product.shortDescription}
            </p>
          )}

          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-fluid-xs font-semibold text-primary">
            {t('cta.readMore')}
            <Icon
              name="arrowRight"
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1.5"
            />
          </span>
        </div>
      </Link>
      </Reveal>
    </div>
  );
}

/**
 * The catalogue.
 *
 * `layout` is the one real decision here. On the homepage the section is a
 * *taste* of the range, and a horizontal rail suits that: it shows the set is
 * larger than the frame, it costs one row of vertical space instead of two, and
 * flicking sideways is the natural gesture for browsing a shelf.
 *
 * On /products it stays a grid, because there the job is comparing 21 items,
 * and a grid is the only layout that lets you see them all at once. Horizontal
 * scrolling a full catalogue would be the trend applied against the task.
 *
 * The rail is a native overflow scroller with snap points — not a translated
 * track — so the keyboard, the trackpad, a touch flick and a screen reader all
 * work without any of it being reimplemented.
 */
export default function Products({
  limit,
  showIntro = true,
  heading = true,
  tone = 'light',
  layout = 'grid',
}) {
  const dark = tone === 'dark';
  const { t } = useI18n();
  const [family, setFamily] = useState('all');
  const railRef = useRef(null);

  // Prefer the live catalogue; the extracted copy is the offline fallback so the
  // section never renders empty if the API is unreachable.
  const { data } = useAsync(getProducts, []);
  const products = useMemo(() => (data?.length ? data.map(fromApi) : staticProducts), [data]);

  const filtered = useMemo(() => {
    const f = FAMILIES.find((x) => x.key === family) || FAMILIES[0];
    const list = products.filter((p) => f.match(p.name.toUpperCase()));
    return limit ? list.slice(0, limit) : list;
  }, [products, family, limit]);

  // Scrolls by one viewport-width of the rail, so a nudge always lands on a
  // card boundary rather than part-way through one.
  const nudge = useCallback((dir) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }, []);

  const isScene = layout === 'scene';
  const isRail = layout === 'rail';

  /*
    The card track, shared by the rail and the pinned scene. Building it once
    keeps the two presentations from drifting apart — the terminal "view all"
    card in particular was easy to forget in one of them.
  */
  const track = (
    <>
      {filtered.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          index={i}
          className="w-[15rem] sm:w-[17rem] lg:w-[19rem]"
        />
      ))}

      {limit && products.length > limit && (
        <Link
          to="/products"
          data-scene-item=""
          className="group flex w-[15rem] shrink-0 flex-col justify-end rounded-[1.5rem] border
                     border-dashed border-line p-6 transition-colors duration-slow hover:border-sun
                     sm:w-[17rem] lg:w-[19rem]"
        >
          <span className="display text-fluid-2xl font-semibold text-sun">{products.length}</span>
          <span className="mt-1 text-fluid-sm text-muted">{t('section.products')}</span>
          <span className="mt-6 inline-flex items-center gap-2 text-fluid-sm font-semibold text-sun">
            {t('cta.viewAll')}
            <Icon
              name="arrowRight"
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1.5"
            />
          </span>
        </Link>
      )}
    </>
  );

  return (
    <section className={`section relative ${dark ? 'band-dark' : ''}`} aria-labelledby="products-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {dark && <div className="absolute inset-0 grain opacity-40" />}
        <div
          className={`absolute -left-36 bottom-10 h-[24rem] w-[24rem] blob ${
            dark ? 'bg-leaf/12 blur-3xl' : 'bg-leaf/6'
          }`}
        />
      </div>

      <div className="relative">
        <div className="shell">
          {heading ? (
            <div className="max-w-2xl">
              <Reveal as="p" className="eyebrow mb-5" duration={0.5}>
                {t('section.products')}
              </Reveal>
              <TextReveal
                as="h2"
                id="products-title"
                text="Built for the soil, not against it"
                className={`display text-fluid-3xl font-semibold ${dark ? 'text-cream' : 'text-deep'}`}
              />
            </div>
          ) : (
            // The page <h1> already names this section; a hidden <h2> keeps the
            // card <h3>s from jumping a level.
            <h2 id="products-title" className="sr-only">
              {t('section.products')}
            </h2>
          )}

          {showIntro && (
            <Reveal delay={0.06} className="mt-7 max-w-prose">
              <p className={`text-fluid-base leading-relaxed ${dark ? 'text-cream/70' : 'text-muted'}`}>
                {productsIntro}
              </p>
            </Reveal>
          )}

          {/*
            Filter and rail arrows share one control row. They act on the same
            set, so separating them — chips here, arrows up by the heading —
            made the arrows read as unrelated page furniture.
          */}
          <Reveal delay={0.1} className="mt-10 flex items-center gap-4">
            <div
              role="group"
              aria-label={t('products.filter')}
              className="no-scrollbar -mx-gutter flex grow gap-2 overflow-x-auto px-gutter pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {FAMILIES.map((f) => (
                <Chip key={f.key} tone={tone} active={family === f.key} onClick={() => setFamily(f.key)}>
                  {f.key === 'all' ? t('products.all') : f.label}
                </Chip>
              ))}
            </div>

            {/*
              Hidden from assistive tech and removed from the tab order on
              purpose: the rail itself is a focusable scroll region, so a
              keyboard user already has arrow keys on it, and exposing these
              would add two stops that do exactly the same thing.
            */}
            {isRail && (
              <div className="hidden shrink-0 gap-2 lg:flex" aria-hidden="true">
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => nudge(-1)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-line
                             text-ink transition-colors duration-normal hover:border-sun hover:text-sun"
                >
                  <Icon name="chevronLeft" size={19} />
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => nudge(1)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-line
                             text-ink transition-colors duration-normal hover:border-sun hover:text-sun"
                >
                  <Icon name="chevronRight" size={19} />
                </button>
              </div>
            )}
          </Reveal>
        </div>

        {isScene ? (
          <>
            {/*
              The pinned scene. Vertical scroll drives the track sideways; on
              touch and under reduced motion `HorizontalScene` renders itself as
              an ordinary swipeable rail instead, which is the better
              interaction on a phone anyway.

              It sits outside `.shell` because a pinned scene wants the whole
              viewport — the leading padding below re-establishes the shell's
              left edge so the first card still lines up with the heading.
            */}
            <HorizontalScene
              className="mt-10"
              data-cursor="drag"
              trackClassName="pl-[var(--shell-inset)] pr-gutter"
            >
              {track}
            </HorizontalScene>

            <div className="shell">
              <Reveal delay={0.1} className="mt-4 lg:hidden">
                <Link to="/products" className={dark ? 'btn-accent' : 'btn-primary'}>
                  {t('cta.viewAll')}
                  <Icon name="arrowRight" size={18} />
                </Link>
              </Reveal>
            </div>
          </>
        ) : isRail ? (
          <div className="shell">
            <div
              ref={railRef}
              className="rail rail-fade mt-9 gap-4 pb-4 sm:gap-5"
              tabIndex={0}
              role="region"
              aria-label={t('section.products')}
            >
              {track}
            </div>

            <Reveal delay={0.1} className="mt-6 lg:hidden">
              <Link to="/products" className={dark ? 'btn-accent' : 'btn-primary'}>
                {t('cta.viewAll')}
                <Icon name="arrowRight" size={18} />
              </Link>
            </Reveal>
          </div>
        ) : (
          <div className="shell">
            <div className="mt-9 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {limit && products.length > limit && (
              <Reveal delay={0.1} className="mt-12">
                <Link to="/products" className={dark ? 'btn-accent' : 'btn-primary'}>
                  {t('cta.viewAll')}
                  <Icon name="arrowRight" size={18} />
                </Link>
              </Reveal>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

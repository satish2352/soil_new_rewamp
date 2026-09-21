import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import staticProducts from '../data/products.json';
import { productsIntro } from '../data/site';
import { getProducts } from '../lib/api';
import { useAsync } from '../hooks';
import { useI18n } from '../lib/i18n';
import { Reveal } from '../lib/motion';
import { Chip, SectionHeading, SmartImage } from '../components/ui';
import Icon from '../components/Icon';

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

export function ProductCard({ product, index = 0, showDescription = true }) {
  const { t } = useI18n();

  return (
    <Reveal
      as="article"
      delay={Math.min(index, 7) * 0.06}
      className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-line/70
                 bg-surface shadow-soft transition-all duration-500 ease-organic
                 hover:-translate-y-2 hover:border-primary/25 hover:shadow-lift"
    >
      <Link
        to={`/products/${product.id}`}
        className="flex h-full flex-col focus-visible:outline-none"
        aria-label={product.name}
      >
        <div className="relative overflow-hidden bg-cream">
          <SmartImage
            src={product.image}
            alt={product.name}
            ratio="1 / 1"
            className="!bg-cream"
            imgClassName="object-contain p-5 transition-transform duration-700 ease-organic
                          group-hover:-translate-y-1.5 group-hover:scale-105"
          />
          {/* CTA slides in on hover; always reachable via the card link. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-primary/95
                       px-4 py-2.5 text-center text-fluid-xs font-semibold text-cream opacity-0 shadow-soft
                       backdrop-blur transition-all duration-500 ease-organic
                       group-hover:translate-y-0 group-hover:opacity-100"
          >
            {t('cta.readMore')}
          </span>
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

          <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-fluid-xs font-semibold text-primary">
            {t('cta.readMore')}
            <Icon
              name="arrowRight"
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export default function Products({ limit, showIntro = true, heading = true, tone = 'light' }) {
  const dark = tone === 'dark';
  const { t } = useI18n();
  const [family, setFamily] = useState('all');

  // Prefer the live catalogue; the extracted copy is the offline fallback so the
  // section never renders empty if the API is unreachable.
  const { data } = useAsync(getProducts, []);
  const products = useMemo(
    () => (data?.length ? data.map(fromApi) : staticProducts),
    [data]
  );

  const filtered = useMemo(() => {
    const f = FAMILIES.find((x) => x.key === family) || FAMILIES[0];
    const list = products.filter((p) => f.match(p.name.toUpperCase()));
    return limit ? list.slice(0, limit) : list;
  }, [products, family, limit]);

  return (
    <section
      className={`section relative overflow-hidden ${dark ? 'band-dark' : ''}`}
      aria-labelledby="products-title"
    >
      {dark && <div aria-hidden="true" className="absolute inset-0 grain opacity-40" />}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -left-36 bottom-10 h-[24rem] w-[24rem] blob
                    ${dark ? 'bg-leaf/12 blur-2xl' : 'bg-leaf/6'}`}
      />

      <div className="shell relative">
        {heading ? (
          <SectionHeading
            id="products-title"
            tone={tone}
            eyebrow={t('section.products')}
            title="Built for the soil, not against it"
          />
        ) : (
          // The page <h1> already names this section; a hidden <h2> keeps the
          // card <h3>s from jumping a level.
          <h2 id="products-title" className="sr-only">
            {t('section.products')}
          </h2>
        )}

        {showIntro && (
          <Reveal delay={0.06} className="mx-auto mt-6 max-w-prose text-center">
            <p className={`text-fluid-base leading-relaxed ${dark ? 'text-cream/75' : 'text-muted'}`}>
              {productsIntro}
            </p>
          </Reveal>
        )}

        {/* Family filter — scrolls horizontally on small screens. */}
        <Reveal delay={0.1} className="mt-10">
          <div
            role="group"
            aria-label={t('products.filter')}
            className="no-scrollbar -mx-gutter flex gap-2 overflow-x-auto px-gutter pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
          >
            {FAMILIES.map((f) => (
              <Chip key={f.key} tone={tone} active={family === f.key} onClick={() => setFamily(f.key)}>
                {f.key === 'all' ? t('products.all') : f.label}
              </Chip>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {limit && products.length > limit && (
          <Reveal delay={0.1} className="mt-12 text-center">
            <Link to="/products" className={dark ? 'btn-accent' : 'btn-primary'}>
              {t('cta.viewAll')}
              <Icon name="arrowRight" size={18} />
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}

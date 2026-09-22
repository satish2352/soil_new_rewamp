import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import staticProducts from '../data/products.json';
import { getProducts } from '../lib/api';
import { useAsync } from '../hooks';
import { useI18n } from '../lib/i18n';
import { cleanCmsHtml } from '../lib/cms-html';
import { ImageReveal, Reveal } from '../lib/motion-react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import { ProductCard } from '../sections/Products';
import { RichText, SmartImage } from '../components/ui';
import Icon from '../components/Icon';
import NotFoundPage from './NotFoundPage';

/** Strips CMS markup down to plain text for the meta description. */
const plain = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function fromApi(row) {
  return {
    id: row.id,
    name: String(row.title || '').trim().replace(/\s+/g, ' '),
    shortDescription: row.short_description || '',
    longDescription: cleanCmsHtml(row.long_description),
    additionalInfo: cleanCmsHtml(row.additional_info),
    image: row.productphotopath || null,
    altImage: row.photopath || null,
    review:
      row.review && row.review_person_name
        ? { by: row.review_person_name, text: row.review }
        : null,
  };
}

export default function ProductDetailPage({ onEnquiry }) {
  const { id } = useParams();
  const { t } = useI18n();
  const [tab, setTab] = useState('details');

  const { data } = useAsync(getProducts, []);
  const products = useMemo(
    () => (data?.length ? data.map(fromApi) : staticProducts),
    [data]
  );

  const product = products.find((p) => String(p.id) === String(id));
  const related = products.filter((p) => String(p.id) !== String(id)).slice(0, 4);

  if (!product) {
    // Wait for the live catalogue before deciding the id is genuinely unknown.
    if (!data && staticProducts.every((p) => String(p.id) !== String(id))) {
      return <NotFoundPage />;
    }
    return null;
  }

  const hasAdditional = Boolean(plain(product.additionalInfo));

  return (
    <>
      <Seo
        title={product.name}
        description={product.shortDescription || plain(product.longDescription).slice(0, 180)}
        path={`/products/${product.id}`}
        image={product.image || undefined}
        type="product"
      />

      <PageHero
        eyebrow={t('nav.products')}
        title={product.name}
        crumbs={[{ label: t('nav.products'), to: '/products' }, { label: product.name }]}
      />

      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Visual */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <ImageReveal className="rounded-[2rem] border border-line bg-cream shadow-lift">
              <SmartImage
                src={product.image}
                alt={product.name}
                ratio="1 / 1"
                loading="eager"
                className="!bg-cream"
                imgClassName="object-contain p-8"
              />
            </ImageReveal>

            {product.altImage && product.altImage !== product.image && (
              <Reveal delay={0.1} className="mt-4">
                <SmartImage
                  src={product.altImage}
                  alt=""
                  ratio="16 / 9"
                  className="rounded-2xl border border-line"
                  imgClassName="object-contain p-3"
                />
              </Reveal>
            )}

            <Reveal delay={0.15} className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => onEnquiry?.(product.name)}
                className="btn-primary w-full"
              >
                {t('products.enquire')}
                <Icon name="arrowRight" size={18} />
              </button>
            </Reveal>
          </div>

          {/* Copy */}
          <div className="lg:col-span-7">
            {product.shortDescription && (
              <Reveal>
                <p className="border-l-4 border-leaf/50 bg-cream/60 py-4 pl-5 text-fluid-lg leading-relaxed text-ink/85 wrap-anywhere">
                  {product.shortDescription}
                </p>
              </Reveal>
            )}

            {/* Details / additional info split into tabs so neither becomes a wall. */}
            {hasAdditional && (
              <Reveal delay={0.06} className="mt-8">
                <div
                  role="tablist"
                  aria-label={product.name}
                  className="inline-flex gap-1.5 rounded-full border border-line bg-surface p-1.5"
                >
                  {[
                    { key: 'details', label: t('products.details') },
                    { key: 'additional', label: t('products.additional') },
                  ].map((x) => (
                    <button
                      key={x.key}
                      type="button"
                      role="tab"
                      aria-selected={tab === x.key}
                      onClick={() => setTab(x.key)}
                      className={`min-h-[44px] rounded-full px-5 text-fluid-sm font-semibold transition-all duration-300
                                  ${tab === x.key ? 'bg-primary text-cream shadow-soft' : 'text-ink/70 hover:text-primary'}`}
                    >
                      {x.label}
                    </button>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal delay={0.1} className="mt-6">
              <RichText
                html={tab === 'additional' ? product.additionalInfo : product.longDescription}
              />
            </Reveal>

            {product.review?.text && (
              <Reveal delay={0.14} className="mt-10">
                <figure className="rounded-2xl border border-line bg-cream/60 p-6">
                  <Icon name="quote" size={22} className="mb-3 text-sun" />
                  <blockquote className="text-fluid-base text-ink/85 wrap-anywhere">
                    {product.review.text}
                  </blockquote>
                  <figcaption className="mt-3 text-fluid-sm font-semibold text-primary wrap-anywhere">
                    {product.review.by}
                  </figcaption>
                </figure>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section bg-cream/55">
          <div className="shell">
            <Reveal className="mb-10 flex items-end justify-between gap-4">
              <h2 className="font-display text-fluid-2xl font-semibold text-deep">
                {t('section.products')}
              </h2>
              <Link to="/products" className="btn-ghost shrink-0 !px-5 text-fluid-xs">
                {t('cta.viewAll')}
              </Link>
            </Reveal>

            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} showDescription={false} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

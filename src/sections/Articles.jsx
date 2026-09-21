import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import blogs from '../data/blogs.json';
import { useI18n } from '../lib/i18n';
import { ImageReveal, Reveal } from '../lib/motion';
import { Chip, SectionHeading, SmartImage } from '../components/ui';
import Icon from '../components/Icon';

/**
 * Articles.
 *
 * The existing catalogue is 21 posts, 9 written in English and 12 in Marathi.
 * Language is the only grouping the data actually supports, so that is the only
 * filter offered — no categories were invented.
 */
export function ArticleCard({ post, index = 0, featured = false }) {
  const { t } = useI18n();

  if (featured) {
    return (
      <Reveal
        as="article"
        className="group relative overflow-hidden rounded-[2rem] border border-line/70 bg-surface
                   shadow-soft backdrop-blur-sm transition-all duration-500 ease-organic
                   hover:border-primary/25 hover:shadow-lift lg:grid lg:grid-cols-2"
      >
        <ImageReveal className="h-56 lg:h-full">
          <SmartImage
            src={post.image}
            alt=""
            ratio="auto"
            className="!h-full"
            imgClassName="transition-transform duration-700 ease-organic group-hover:scale-[1.04]"
          />
        </ImageReveal>

        <div className="flex flex-col justify-center p-7 sm:p-10">
          <span className="eyebrow mb-4">{t('section.articles')}</span>
          <h3
            lang={post.language}
            className="font-display text-fluid-2xl font-semibold leading-snug text-deep wrap-anywhere"
          >
            <Link to={`/blogs/${post.id}`} className="after:absolute after:inset-0">
              {post.title}
            </Link>
          </h3>
          {post.excerpt && (
            <p
              lang={post.language}
              className="mt-4 line-clamp-4 text-fluid-base leading-relaxed text-muted wrap-anywhere"
            >
              {post.excerpt}
            </p>
          )}
          <span className="mt-6 inline-flex items-center gap-2 text-fluid-sm font-semibold text-primary">
            {t('cta.readMore')}
            <Icon
              name="arrowRight"
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1.5"
            />
          </span>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal
      as="article"
      delay={Math.min(index, 6) * 0.06}
      className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-line/70
                 bg-surface shadow-soft transition-all duration-500 ease-organic
                 hover:-translate-y-2 hover:border-primary/25 hover:shadow-lift"
    >
      <div className="overflow-hidden">
        <SmartImage
          src={post.image}
          alt=""
          ratio="16 / 10"
          imgClassName="transition-transform duration-700 ease-organic group-hover:scale-[1.07]"
        />
      </div>

      <div className="flex grow flex-col p-5">
        <span className="mb-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-leaf/12 px-2.5 py-1
                         text-[0.68rem] font-semibold uppercase tracking-wide text-primary">
          <Icon name="leaf" size={12} />
          {post.language === 'mr' ? 'मराठी' : 'English'}
        </span>

        <h3
          lang={post.language}
          className="font-display text-fluid-base font-semibold leading-snug text-deep wrap-anywhere"
        >
          <Link to={`/blogs/${post.id}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p
            lang={post.language}
            className="mt-2 line-clamp-3 text-fluid-sm leading-relaxed text-muted wrap-anywhere"
          >
            {post.excerpt}
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
    </Reveal>
  );
}

export default function Articles({ limit, showFilter = false, heading = true }) {
  const { t } = useI18n();
  const [lang, setLang] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = blogs;
    if (lang !== 'all') list = list.filter((b) => b.language === lang);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (b) => b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q)
      );
    }
    return list;
  }, [lang, query]);

  const shown = limit ? filtered.slice(0, limit) : filtered;
  const [featured, ...rest] = shown;

  return (
    <section className="section relative overflow-hidden" aria-labelledby="articles-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-24 h-[22rem] w-[22rem] blob bg-sun/7"
      />

      <div className="shell">
        {heading ? (
          <SectionHeading
            id="articles-title"
            eyebrow={t('section.articles')}
            title="Field notes from our agronomists"
          />
        ) : (
          <h2 id="articles-title" className="sr-only">
            {t('section.articles')}
          </h2>
        )}

        {showFilter && (
          <Reveal delay={0.06} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label={t('blog.allArticles')} className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: t('blog.allArticles') },
                { key: 'en', label: 'English' },
                { key: 'mr', label: 'मराठी' },
              ].map((x) => (
                <Chip key={x.key} active={lang === x.key} onClick={() => setLang(x.key)}>
                  {x.label}
                </Chip>
              ))}
            </div>

            <label className="relative w-full sm:max-w-xs">
              <span className="sr-only">{t('blog.search')}</span>
              <Icon
                name="search"
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('blog.search')}
                className="field !pl-11"
              />
            </label>
          </Reveal>
        )}

        {shown.length === 0 ? (
          <p className="mt-12 text-center text-fluid-base text-muted">{t('blog.noResults')}</p>
        ) : (
          <>
            {featured && (
              <div className="mt-10">
                <ArticleCard post={featured} featured />
              </div>
            )}

            {rest.length > 0 && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {rest.map((post, i) => (
                  <ArticleCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {limit && blogs.length > limit && (
          <Reveal delay={0.1} className="mt-12 text-center">
            <Link to="/blogs" className="btn-primary">
              {t('blog.allArticles')}
              <Icon name="arrowRight" size={18} />
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}

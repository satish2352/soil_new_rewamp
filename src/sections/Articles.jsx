import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import blogs from '../data/blogs.json';
import { useI18n } from '../lib/i18n';
import { ImageReveal, Reveal, motion, useFrameParallax } from '../lib/motion-react';
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
  // Called unconditionally — hooks cannot sit behind the `featured` branch.
  const parallax = useFrameParallax({ distance: 10, scale: 1.2 });

  if (featured) {
    return (
      <Reveal
        as="article"
        className="group relative overflow-hidden rounded-[2rem] border border-line/70 bg-surface
                   shadow-soft transition-all duration-500 ease-organic
                   hover:border-primary/30 hover:shadow-cine lg:grid lg:grid-cols-2"
      >
        <ImageReveal className="h-56 lg:h-full" from="left">
          {/*
            The featured image is the largest on the page, so it is the one
            that most benefits from sitting behind the frame rather than in it.
            The inner layer is scaled past its box to cover the drift.
          */}
          <div ref={parallax.ref} className="h-full w-full overflow-hidden">
            <motion.div style={parallax.style} className="h-full w-full">
              <SmartImage
                src={post.image}
                alt=""
                ratio="auto"
                className="!h-full"
                imgClassName="transition-transform duration-[900ms] ease-organic group-hover:scale-[1.04]"
              />
            </motion.div>
          </div>
        </ImageReveal>

        <div className="flex flex-col justify-center p-7 sm:p-10">
          <span className="eyebrow mb-5">{t('blog.featured')}</span>
          <h3
            lang={post.language}
            className="display text-fluid-2xl font-semibold leading-snug text-deep wrap-anywhere"
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
          <span className="mt-7 inline-flex items-center gap-2 text-fluid-sm font-semibold text-primary">
            {t('cta.readMore')}
            <Icon
              name="arrowRight"
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-2"
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
                 hover:-translate-y-2 hover:border-primary/30 hover:shadow-cine"
    >
      <ImageReveal className="h-44">
        <SmartImage
          src={post.image}
          alt=""
          ratio="auto"
          className="!h-full"
          imgClassName="transition-transform duration-[900ms] ease-organic group-hover:scale-[1.06]"
        />
      </ImageReveal>

      <div className="flex grow flex-col p-6">
        <h3
          lang={post.language}
          className="font-display text-fluid-lg font-semibold leading-snug text-deep wrap-anywhere"
        >
          <Link to={`/blogs/${post.id}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p
            lang={post.language}
            className="mt-3 line-clamp-3 text-fluid-sm leading-relaxed text-muted wrap-anywhere"
          >
            {post.excerpt}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-fluid-xs font-semibold text-primary">
          {t('cta.readMore')}
          <Icon
            name="arrowRight"
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-1.5"
          />
        </span>
      </div>
    </Reveal>
  );
}

/**
 * One article as a row: index, title, language tag, arrow.
 *
 * The homepage uses these rather than a third grid of cards. By that point the
 * page has already shown product cards and career cards, and a third set would
 * read as the same component with different text in it. A hairline list also
 * fits six headlines in the height two rows of cards would need, which matters
 * when the titles are the content.
 */
function ArticleRow({ post, index }) {
  const { t } = useI18n();

  return (
    <Reveal
      as="li"
      delay={Math.min(index, 6) * 0.05}
      className="group relative border-t border-line last:border-b"
    >
      <Link
        to={`/blogs/${post.id}`}
        className="flex items-center gap-5 py-6 transition-transform duration-slow ease-organic
                   motion-safe:group-hover:translate-x-2 sm:gap-8"
      >
        <span aria-hidden="true" className="micro shrink-0 text-muted">
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="min-w-0 grow">
          <span
            lang={post.language}
            className="block font-display text-fluid-lg font-semibold leading-snug text-cream
                       transition-colors duration-slow group-hover:text-sun wrap-anywhere"
          >
            {post.title}
          </span>
          {/*
            No `block` alongside `line-clamp-1`: the clamp works by switching
            the element to `-webkit-box`, and a `display` utility next to it
            wins the cascade and silently turns the clamp off — the row then
            ran to two lines and the rows stopped sharing a height.
          */}
          <span
            lang={post.language}
            className="mt-1.5 line-clamp-1 text-fluid-sm text-muted wrap-anywhere"
          >
            {post.excerpt}
          </span>
        </span>

        <span
          aria-hidden="true"
          className="hidden shrink-0 rounded-full border border-line px-3 py-1 text-fluid-xs
                     font-semibold uppercase tracking-wide text-muted sm:inline-block"
        >
          {post.language === 'mr' ? 'मराठी' : 'EN'}
        </span>

        <Icon
          name="arrowRight"
          size={18}
          className="shrink-0 text-muted transition-all duration-slow ease-organic
                     group-hover:translate-x-1.5 group-hover:text-sun"
        />
        <span className="sr-only">{t('cta.readMore')}</span>
      </Link>
    </Reveal>
  );
}

export default function Articles({ limit, showFilter = false, heading = true, layout }) {
  const { t } = useI18n();
  const [lang, setLang] = useState('all');
  const [query, setQuery] = useState('');

  // The homepage gets the list; the full /blogs catalogue gets the grid.
  const mode = layout || (limit ? 'list' : 'grid');

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
  const dark = mode === 'list';

  return (
    <section
      className={`section relative overflow-hidden ${dark ? 'band-dark' : ''}`}
      aria-labelledby="articles-title"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -left-32 top-24 h-[22rem] w-[22rem] blob ${
          dark ? 'bg-sun/8 blur-3xl' : 'bg-sun/7'
        }`}
      />

      <div className="shell relative">
        {heading ? (
          <SectionHeading
            id="articles-title"
            tone={dark ? 'dark' : 'light'}
            eyebrow={t('section.articles')}
            /*
              Previously "Field notes from our agronomists". That asserted the
              company employs agronomists, which nothing on the site states —
              exactly the kind of invented claim the content rule rules out.
              This says only what is true of the catalogue.
            */
            title="Notes from the field"
            action={
              limit && blogs.length > limit ? (
                <Link to="/blogs" className="btn-ghost btn-sweep hover:text-deep">
                  {t('blog.allArticles')}
                  <Icon name="arrowRight" size={17} />
                </Link>
              ) : null
            }
          />
        ) : (
          <h2 id="articles-title" className="sr-only">
            {t('section.articles')}
          </h2>
        )}

        {showFilter && (
          <Reveal
            delay={0.06}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
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
          <p className="mt-12 text-fluid-base text-muted">{t('blog.noResults')}</p>
        ) : mode === 'list' ? (
          <>
            {featured && (
              <div className="mt-12 band-light">
                <ArticleCard post={featured} featured />
              </div>
            )}

            {rest.length > 0 && (
              <ul className="mt-12">
                {rest.map((post, i) => (
                  <ArticleRow key={post.id} post={post} index={i} />
                ))}
              </ul>
            )}
          </>
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
      </div>
    </section>
  );
}

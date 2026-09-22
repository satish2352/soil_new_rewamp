import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import blogs from '../data/blogs.json';
import { useI18n } from '../lib/i18n';
import { ImageReveal, Reveal } from '../lib/motion-react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import { ArticleCard } from '../sections/Articles';
import { Loading, RichText, SmartImage } from '../components/ui';
import Icon from '../components/Icon';
import NotFoundPage from './NotFoundPage';

export default function BlogDetailPage() {
  const { id } = useParams();
  const { t } = useI18n();

  // Article bodies are a separate chunk so listing pages never download them.
  const [body, setBody] = useState(null);
  useEffect(() => {
    let alive = true;
    import('../data/blog-content.json').then((m) => {
      if (alive) setBody((m.default || m)[id] || '');
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const post = blogs.find((b) => String(b.id) === String(id));
  if (!post) return <NotFoundPage />;

  // Same language first, so a Marathi reader is offered Marathi next.
  const related = blogs
    .filter((b) => b.id !== post.id)
    .sort((a, b) => (a.language === post.language ? -1 : 0) - (b.language === post.language ? -1 : 0))
    .slice(0, 3);

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blogs/${post.id}`}
        image={post.image || undefined}
        type="article"
      />

      <PageHero
        eyebrow={t('section.articles')}
        title={post.title}
        crumbs={[{ label: t('nav.blog'), to: '/blogs' }, { label: post.title }]}
      />

      <article className="section">
        <div className="shell max-w-4xl">
          {post.image && (
            <ImageReveal className="mb-10 rounded-[2rem] shadow-lift">
              <SmartImage src={post.image} alt="" ratio="16 / 9" loading="eager" />
            </ImageReveal>
          )}

          {body === null ? (
            <Loading rows={7} />
          ) : (
            <Reveal>
              <RichText html={body} className="mx-auto" lang={post.language} />
            </Reveal>
          )}

          <Reveal delay={0.1} className="mt-12 border-t border-line pt-8">
            <Link to="/blogs" className="btn-ghost">
              <Icon name="chevronLeft" size={17} />
              {t('blog.backToBlog')}
            </Link>
          </Reveal>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section bg-cream/55" aria-label={t('section.articles')}>
          <div className="shell">
            <Reveal className="mb-10">
              <h2 className="font-display text-fluid-2xl font-semibold text-deep">
                {t('section.articles')}
              </h2>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {related.map((p, i) => (
                <ArticleCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

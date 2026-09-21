import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import Articles from '../sections/Articles';
import blogs from '../data/blogs.json';
import { useI18n } from '../lib/i18n';

export default function BlogsPage() {
  const { t } = useI18n();

  return (
    <>
      <Seo
        title={t('nav.blog')}
        description={`${blogs.length} articles on soil health, organic carbon, crop nutrition and SCT Vedic practice.`}
        path="/blogs"
      />
      <PageHero
        eyebrow={t('section.articles')}
        title={t('section.articles')}
        crumbs={[{ label: t('nav.blog') }]}
      />
      <Articles showFilter heading={false} />
    </>
  );
}

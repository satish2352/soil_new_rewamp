import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import Products from '../sections/Products';
import { productsIntro } from '../data/site';
import { useI18n } from '../lib/i18n';

export default function ProductsPage() {
  const { t } = useI18n();

  return (
    <>
      <Seo title={t('nav.products')} description={productsIntro} path="/products" />
      <PageHero
        eyebrow={t('nav.products')}
        title={t('section.products')}
        lead={productsIntro}
        crumbs={[{ label: t('nav.products') }]}
      />
      <Products heading={false} showIntro={false} />
    </>
  );
}

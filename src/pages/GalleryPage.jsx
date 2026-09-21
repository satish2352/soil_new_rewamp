import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import Gallery from '../sections/Gallery';
import photos from '../data/gallery.json';
import videos from '../data/videos.json';
import { useI18n } from '../lib/i18n';

export default function GalleryPage() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'videos' ? 'videos' : 'photos';

  // The tab lives in the URL so /gallery?tab=videos is linkable, and the legacy
  // /vedio-gallery redirect lands on the right view.
  const setTab = (next) => setParams(next === 'photos' ? {} : { tab: next }, { replace: true });

  return (
    <>
      <Seo
        title={t('nav.gallery')}
        description={`${photos.length} photographs and ${videos.length} videos from Soil Charger Technology farms, seminars and field work.`}
        path={tab === 'videos' ? '/gallery?tab=videos' : '/gallery'}
      />
      <PageHero
        eyebrow={t('nav.gallery')}
        title="your dream gallery"
        crumbs={[{ label: t('nav.gallery') }]}
      />
      <Gallery tab={tab} onTabChange={setTab} heading={false} />
    </>
  );
}

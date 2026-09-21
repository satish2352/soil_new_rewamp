import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import VisionMission from '../sections/VisionMission';
import vm from '../data/vision-mission.json';
import { useI18n } from '../lib/i18n';

export default function VisionMissionPage() {
  const { t } = useI18n();
  const description = [vm.vision?.points?.[0], vm.mission?.points?.[0]].filter(Boolean).join(' ');

  return (
    <>
      <Seo title={t('nav.visionMission')} description={description} path="/vision-mission" />
      <PageHero
        eyebrow={t('nav.company')}
        title={t('nav.visionMission')}
        crumbs={[{ label: t('nav.visionMission') }]}
      />
      <VisionMission />
    </>
  );
}

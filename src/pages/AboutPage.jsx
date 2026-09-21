import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import About from '../sections/About';
import Certification from '../sections/Certification';
import Team from '../sections/Team';
import about from '../data/about.json';
import { useI18n } from '../lib/i18n';

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <>
      <Seo
        title={t('nav.about')}
        description={`${about.name}, ${about.role}, ${about.location}. The story of Soil Charger Technology from 2015 to SCT Vedic.`}
        path="/about-us"
        image={about.image || undefined}
        type="article"
      />
      <PageHero
        eyebrow={t('nav.company')}
        title={t('nav.about')}
        crumbs={[{ label: t('nav.about') }]}
      />
      <About />
      <Certification />
      <Team />
    </>
  );
}

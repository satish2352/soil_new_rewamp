import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import Team from '../sections/Team';
import { team } from '../data/site';
import { useI18n } from '../lib/i18n';

export default function TeamPage() {
  const { t } = useI18n();

  return (
    <>
      <Seo
        title={t('nav.team')}
        description={team.map((m) => `${m.name} — ${m.role}`).join('. ')}
        path="/our-team"
      />
      <PageHero
        eyebrow={t('nav.company')}
        title={t('section.team')}
        crumbs={[{ label: t('nav.team') }]}
      />
      <Team />
    </>
  );
}

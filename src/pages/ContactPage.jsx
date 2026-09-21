import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ContactSection from '../sections/ContactSection';
import { contact } from '../data/site';
import { useI18n } from '../lib/i18n';

export default function ContactPage({ onEnquiry }) {
  const { t } = useI18n();

  return (
    <>
      <Seo
        title={t('nav.contact')}
        description={`${contact.address.single}. ${contact.phones.map((p) => p.display).join(', ')}.`}
        path="/contact"
      />
      <PageHero
        eyebrow={t('cta.getInTouch')}
        title={t('section.contact')}
        lead={contact.address.single}
        crumbs={[{ label: t('nav.contact') }]}
      />
      <ContactSection onEnquiry={onEnquiry} />
    </>
  );
}

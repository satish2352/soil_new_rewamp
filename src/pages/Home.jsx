import Seo from '../components/Seo';
import Hero from '../sections/Hero';
import Pillars from '../sections/Pillars';
import Principles from '../sections/Principles';
import About from '../sections/About';
import VisionMission from '../sections/VisionMission';
import Gallery from '../sections/Gallery';
import Products from '../sections/Products';
import CareerTeaser from '../sections/CareerTeaser';
import Articles from '../sections/Articles';
import Stats from '../sections/Stats';
import Testimonials from '../sections/Testimonials';
import Team from '../sections/Team';
import Certification from '../sections/Certification';
import ContactSection from '../sections/ContactSection';

/**
 * Homepage order follows the site's own story:
 * soil → philosophy → method → founder → future → proof → solutions →
 * people → experience → trust → connection.
 */
export default function Home({ onEnquiry, onExport }) {
  return (
    <>
      <Seo
        title={null}
        description="SOIL Is HEALTHIER, FARMER WALTHIER. Soil Charger Technology is an ISO 9001:2008 certified organic farming group from Nashik, Maharashtra."
        path="/"
      />

      <Hero onCta={onExport} />
      <Pillars />
      <Principles />
      <About compact />
      <VisionMission />
      <Gallery limit={9} />
      {/* Products and Stats form one deep-green block: solutions, then proof. */}
      <Products limit={8} tone="dark" />
      <Stats />
      <CareerTeaser />
      <Articles limit={7} />
      <Testimonials />
      <Team />
      <Certification onEnquiry={onEnquiry} />
      <ContactSection onEnquiry={onEnquiry} />
    </>
  );
}

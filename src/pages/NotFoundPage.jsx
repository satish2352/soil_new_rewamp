import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { useI18n } from '../lib/i18n';
import Icon from '../components/Icon';

export default function NotFoundPage() {
  const { t } = useI18n();

  return (
    <>
      <Seo title="Page not found" description="This page could not be found." />
      <section className="shell flex min-h-[70vh] flex-col items-center justify-center py-section text-center">
        <span className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon name="sprout" size={34} />
        </span>
        <p className="eyebrow mb-3">404</p>
        <h1 className="font-display text-fluid-3xl font-semibold text-deep">
          This ground has not been charged yet
        </h1>
        <p className="mt-4 max-w-prose text-fluid-base text-muted">
          The page you are looking for could not be found.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            {t('nav.home')}
          </Link>
          <Link to="/products" className="btn-ghost">
            {t('nav.products')}
          </Link>
        </div>
      </section>
    </>
  );
}

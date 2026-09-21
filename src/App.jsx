import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import EnquiryModal from './components/EnquiryModal';
import ExportFormModal from './components/ExportFormModal';
import Home from './pages/Home';

// Route-level code splitting keeps the first load to the homepage only.
const AboutPage = lazy(() => import('./pages/AboutPage'));
const VisionMissionPage = lazy(() => import('./pages/VisionMissionPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const BlogsPage = lazy(() => import('./pages/BlogsPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** Restores scroll on navigation, but leaves in-page anchors alone. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [pathname, hash]);

  return null;
}

function RouteFallback() {
  return (
    <div className="shell flex min-h-[60vh] items-center justify-center py-section">
      <span className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-primary" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default function App() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [presetProduct, setPresetProduct] = useState(null);

  const openEnquiry = useCallback((product) => {
    setPresetProduct(typeof product === 'string' ? product : null);
    setEnquiryOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header onEnquiry={openEnquiry} />

      <main id="main" className="grow">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/"
              element={<Home onEnquiry={openEnquiry} onExport={() => setExportOpen(true)} />}
            />

            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/vision-mission" element={<VisionMissionPage />} />
            <Route path="/our-team" element={<TeamPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage onEnquiry={openEnquiry} />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/:id" element={<BlogDetailPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/contact" element={<ContactPage onEnquiry={openEnquiry} />} />

            {/* Legacy URLs kept alive so existing links and search results still land. */}
            <Route path="/index.php" element={<Navigate to="/" replace />} />
            <Route path="/photo-gallery" element={<Navigate to="/gallery?tab=photos" replace />} />
            <Route
              path="/sub-photo-gallery"
              element={<Navigate to="/gallery?tab=photos" replace />}
            />
            <Route path="/vedio-gallery" element={<Navigate to="/gallery?tab=videos" replace />} />
            <Route
              path="/sub-vedio-gallery"
              element={<Navigate to="/gallery?tab=videos" replace />}
            />
            <Route path="/sub-product/:id" element={<LegacyProductRedirect />} />
            <Route path="/sub-blogs" element={<LegacyBlogRedirect />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer onEnquiry={openEnquiry} />
      <WhatsAppWidget />

      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        presetProduct={presetProduct}
      />
      <ExportFormModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}

/** `/sub-product/111` → `/products/111` */
function LegacyProductRedirect() {
  const { pathname } = useLocation();
  const id = pathname.split('/').pop();
  return <Navigate to={`/products/${id}`} replace />;
}

/** `/sub-blogs?id=14` → `/blogs/14` */
function LegacyBlogRedirect() {
  const { search } = useLocation();
  const id = new URLSearchParams(search).get('id');
  return <Navigate to={id ? `/blogs/${id}` : '/blogs'} replace />;
}

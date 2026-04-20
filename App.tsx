import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { MainPage } from './pages/MainPage';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetail';
import { RedirectToProduct } from './pages/RedirectToProduct';
import { CSCenter } from './pages/CSCenter';
import { AsGuidePage } from './pages/AsGuidePage';
import { ProductSearchResult } from './pages/ProductSearchResult';
import { CompanyIntro } from './pages/CompanyIntro';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { NotFound } from './pages/NotFound';
import { InstallationCasesGallery } from './pages/InstallationCasesGallery';
import { InstallationCaseDetail } from './pages/InstallationCaseDetail';
import { QuoteRequestPage } from './pages/QuoteRequestPage';
import { NoticeGallery } from './pages/NoticeGallery';
import { NoticeDetail } from './pages/NoticeDetail';
import { PrerenderDataProvider, type PrerenderData } from './src/prerender/context';
import { AuthProvider } from './src/context/AuthContext';
import { AdminRoute } from './src/components/AdminRoute';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const AdminDashboardHome = lazy(() =>
  import('./pages/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboardHome })),
);
const ProductManager = lazy(() => import('./pages/admin/ProductManager').then((module) => ({ default: module.ProductManager })));
const BookingList = lazy(() => import('./pages/admin/BookingList').then((module) => ({ default: module.BookingList })));
const CMSManager = lazy(() => import('./pages/admin/CMSManager').then((module) => ({ default: module.CMSManager })));
const UserManager = lazy(() => import('./pages/admin/UserManager').then((module) => ({ default: module.UserManager })));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then((module) => ({ default: module.AdminLogin })));
const AdminSignup = lazy(() => import('./pages/admin/AdminSignup').then((module) => ({ default: module.AdminSignup })));
const FAQManager = lazy(() => import('./pages/admin/FAQManager').then((module) => ({ default: module.FAQManager })));
const InquiryManager = lazy(() => import('./pages/admin/InquiryManager').then((module) => ({ default: module.InquiryManager })));
const InstallationCasesManager = lazy(() =>
  import('./pages/admin/InstallationCasesManager').then((module) => ({ default: module.InstallationCasesManager })),
);
const MainReviewCardsManager = lazy(() =>
  import('./pages/admin/MainReviewCardsManager').then((module) => ({ default: module.MainReviewCardsManager })),
);
const PublicVisualsManager = lazy(() =>
  import('./pages/admin/PublicVisualsManager').then((module) => ({ default: module.PublicVisualsManager })),
);
const CompanyContentManager = lazy(() =>
  import('./pages/admin/CompanyContentManager').then((module) => ({ default: module.CompanyContentManager })),
);
const NoticeManager = lazy(() => import('./pages/admin/NoticeManager').then((module) => ({ default: module.NoticeManager })));

const AdminChunkFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center bg-white">
    <Loader2 className="animate-spin text-[#001e45]" size={36} />
  </div>
);

const AdminChunkBoundary = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<AdminChunkFallback />}>{children}</Suspense>
);

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = decodeURIComponent(hash.slice(1));
      window.requestAnimationFrame(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ block: 'start', behavior: 'auto' });
        }
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search, hash]);

  return null;
}

export const AppProviders = ({
  children,
  prerenderData,
}: {
  children: ReactNode;
  prerenderData?: PrerenderData | null;
}) => {
  return (
    <PrerenderDataProvider initialData={prerenderData}>
      {children}
    </PrerenderDataProvider>
  );
};

export function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<AdminRoute><AdminChunkBoundary><AdminDashboard /></AdminChunkBoundary></AdminRoute>}>
          <Route index element={<AdminChunkBoundary><AdminDashboardHome /></AdminChunkBoundary>} />
          <Route path="cms" element={<AdminChunkBoundary><CMSManager /></AdminChunkBoundary>} />
          <Route path="sections" element={<AdminChunkBoundary><CMSManager /></AdminChunkBoundary>} />
          <Route path="products" element={<AdminChunkBoundary><ProductManager /></AdminChunkBoundary>} />
          <Route path="bookings" element={<AdminChunkBoundary><BookingList /></AdminChunkBoundary>} />
          <Route path="users" element={<AdminChunkBoundary><UserManager /></AdminChunkBoundary>} />
          <Route path="cases" element={<AdminChunkBoundary><InstallationCasesManager /></AdminChunkBoundary>} />
          <Route path="main-reviews" element={<AdminChunkBoundary><MainReviewCardsManager /></AdminChunkBoundary>} />
          <Route path="public-visuals" element={<AdminChunkBoundary><PublicVisualsManager /></AdminChunkBoundary>} />
          <Route path="faqs" element={<AdminChunkBoundary><FAQManager /></AdminChunkBoundary>} />
          <Route path="inquiries" element={<AdminChunkBoundary><InquiryManager /></AdminChunkBoundary>} />
          <Route path="company" element={<AdminChunkBoundary><CompanyContentManager /></AdminChunkBoundary>} />
          <Route path="notices" element={<AdminChunkBoundary><NoticeManager /></AdminChunkBoundary>} />
        </Route>

        {/* Admin Login - Separate Route */}
        <Route path="/admin/login" element={<AdminChunkBoundary><AdminLogin /></AdminChunkBoundary>} />
        <Route path="/admin/signup" element={<AdminChunkBoundary><AdminSignup /></AdminChunkBoundary>} />

        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-white">
              <Header />
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/mypage/*" element={<Navigate to="/" replace />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/signup" element={<Navigate to="/" replace />} />
                <Route path="/cs" element={<CSCenter />} />
                <Route path="/cs/as-guide" element={<AsGuidePage />} />
                <Route path="/p/:code" element={<RedirectToProduct />} />
                <Route path="/search" element={<ProductSearchResult />} />
                <Route path="/company" element={<CompanyIntro />} />
                <Route path="/company/overview" element={<Navigate to="/company" replace />} />
                <Route path="/company/business" element={<CompanyIntro />} />
                <Route path="/company/vision" element={<CompanyIntro />} />
                <Route path="/company/location" element={<CompanyIntro />} />
                <Route path="/quote-request" element={<QuoteRequestPage />} />
                <Route path="/notice" element={<NoticeGallery />} />
                <Route path="/notice/:id" element={<NoticeDetail />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/cases" element={<InstallationCasesGallery />} />
                <Route path="/cases/:id" element={<InstallationCaseDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;

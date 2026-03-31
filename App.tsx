import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProductManager } from './pages/admin/ProductManager';
import { BookingList } from './pages/admin/BookingList';
import { CMSManager } from './pages/admin/CMSManager';
import { UserManager } from './pages/admin/UserManager';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminSignup } from './pages/admin/AdminSignup';
import { FAQManager } from './pages/admin/FAQManager';
import { InquiryManager } from './pages/admin/InquiryManager';
import { InstallationCasesManager } from './pages/admin/InstallationCasesManager';
import { MainReviewCardsManager } from './pages/admin/MainReviewCardsManager';
import { CompanyContentManager } from './pages/admin/CompanyContentManager';
import { NoticeManager } from './pages/admin/NoticeManager';
import { AdminRoute } from './src/components/AdminRoute';

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
      <AuthProvider>{children}</AuthProvider>
    </PrerenderDataProvider>
  );
};

export function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
          <Route path="cms" element={<CMSManager />} />
          <Route path="sections" element={<CMSManager />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="bookings" element={<BookingList />} />
          <Route path="users" element={<UserManager />} />
          <Route path="cases" element={<InstallationCasesManager />} />
          <Route path="main-reviews" element={<MainReviewCardsManager />} />
          <Route path="faqs" element={<FAQManager />} />
          <Route path="inquiries" element={<InquiryManager />} />
          <Route path="company" element={<CompanyContentManager />} />
          <Route path="notices" element={<NoticeManager />} />
        </Route>

        {/* Admin Login - Separate Route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />

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
        <AppContent />
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { InstallPromptPopup } from './components/common/InstallPromptPopup';
import { BottomNavbar } from './components/common/BottomNavbar';

// Pages
import { Home } from './pages/Home';
import { FindParking } from './pages/FindParking';
import { FindCharging } from './pages/FindCharging';
import { ListingDetails } from './pages/ListingDetails';
import { BookingCheckout } from './pages/BookingCheckout';
import { PaymentResult } from './pages/PaymentResult';
import { MyBookings } from './pages/MyBookings';
import { NearbyHangouts } from './pages/NearbyHangouts';
import { ValetComingSoon } from './pages/ValetComingSoon';
import { BecomeAHost } from './pages/BecomeAHost';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { CreateListing } from './pages/CreateListing';
import { ProviderPayouts } from './pages/ProviderPayouts';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { UserProfile } from './pages/UserProfile';
import { VehicleManagement } from './pages/VehicleManagement';
import { InstallPWA } from './pages/InstallPWA';
import {
  AboutPage,
  HelpPage,
  ContactPage,
  TermsPage,
  PrivacyPage,
  RefundPolicyPage,
} from './pages/StaticPages';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // The starting page (onboarding walkthrough & login) is full screen without Navbar, Footer, or BottomNavbar
  const searchParams = new URLSearchParams(location.search);
  const isGuestExplore = searchParams.get('explore') === 'guest';
  const isStartingPage = location.pathname === '/' && !isAuthenticated && !isGuestExplore;

  return (
    <div
      className={`flex flex-col min-h-screen bg-white text-neutral-900 selection:bg-yellow-400 selection:text-black ${
        isStartingPage ? '' : 'pb-16'
      }`}
    >
      {!isStartingPage && <Navbar />}

      <main className="flex-1 bg-white">
        <Routes>
          {/* Public Marketplace */}
          <Route path="/" element={<Home />} />
          <Route path="/parking" element={<FindParking />} />
          <Route path="/charging" element={<FindCharging />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/nearby" element={<NearbyHangouts />} />

          {/* Valet Mobility — Section 12 Coming Soon */}
          <Route path="/valet" element={<ValetComingSoon />} />

          {/* Booking & Payments Checkout */}
          <Route path="/checkout/:bookingId" element={<BookingCheckout />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route path="/bookings" element={<MyBookings />} />

          {/* Provider / Host Portal */}
          <Route path="/become-a-host" element={<BecomeAHost />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/listings/new" element={<CreateListing />} />
          <Route path="/provider/payouts" element={<ProviderPayouts />} />

          {/* Master Admin Portal */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Authentication & User Profile */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/vehicles" element={<VehicleManagement />} />

          {/* PWA Installation & Offline */}
          <Route path="/install-pwa" element={<InstallPWA />} />

          {/* Company & Legal */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
                <div className="text-4xl font-black text-neutral-300">404</div>
                <h2 className="text-xl font-black text-neutral-900">Page Not Found</h2>
                <p className="text-xs text-neutral-500">The destination or route you requested could not be located.</p>
                <a
                  href="/"
                  className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  Return to Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer is only visible once the user is logged in */}
      {isAuthenticated && <Footer />}
      <InstallPromptPopup />
      {!isStartingPage && <BottomNavbar />}
    </div>
  );
};

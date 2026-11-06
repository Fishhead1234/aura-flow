import React, { useEffect } from 'react';
import { useAuraStore } from './store/auraStore';
import { Navbar } from './components/Navbar';
import { ClientScheduleView } from './components/ClientScheduleView';
import { ExploreStudiosView } from './components/ExploreStudiosView';
import { BookingDrawer } from './components/BookingDrawer';
import { WaitlistModal } from './components/WaitlistModal';
import { AdminPortal } from './components/AdminPortal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { DevSandboxToolbar } from './components/DevSandboxToolbar';
import { WelcomeModal } from './components/WelcomeModal';
import { StudentOnboardingModal } from './components/StudentOnboardingModal';
import { PaywallModal } from './components/PaywallModal';

export const App: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    syncFromCloud,
    confirmBooking,
    currentUser,
    setWelcomeModalOpen,
    resetToCleanGuestState,
  } = useAuraStore();

  // First-Run & Clean-State Detection (`auraflow_has_launched` and `?reset=true`)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isResetParam = params.get('reset') === 'true';
    const hasLaunched = localStorage.getItem('auraflow_has_launched');

    if (isResetParam) {
      resetToCleanGuestState();
      return;
    }

    if (!hasLaunched) {
      setWelcomeModalOpen(true);
    }
  }, [resetToCleanGuestState, setWelcomeModalOpen]);

  // Real-time multi-device Cloud Sync + Stripe/LINE Pay Redirect Return Handler
  useEffect(() => {
    syncFromCloud();
    const interval = setInterval(() => {
      syncFromCloud();
    }, 6000);

    // Handle Stripe Checkout / LINE Pay return URL (?booking=success&session_id=...&method=...)
    const params = new URLSearchParams(window.location.search);
    const bookingStatus = params.get('booking');
    const returnedSessionId = params.get('session_id');
    const returnedMethod = params.get('method') as any;

    if (bookingStatus === 'success' && returnedSessionId) {
      confirmBooking(
        returnedSessionId,
        returnedMethod || 'STRIPE_CARD',
        currentUser.name,
        currentUser.email
      );
      window.history.replaceState({}, '', window.location.pathname);
    }

    return () => clearInterval(interval);
  }, [syncFromCloud, confirmBooking, currentUser.name, currentUser.email]);

  // Listen to browser forward/back buttons (HTML5 History API)
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname === '/admin' || pathname.startsWith('/admin')) {
        navigateTo({ path: 'admin' });
      } else if (pathname === '/onboarding' || pathname.startsWith('/onboarding')) {
        navigateTo({ path: 'onboarding' });
      } else if (pathname === '/explore' || pathname.startsWith('/explore')) {
        navigateTo({ path: 'explore' });
      } else if (pathname.startsWith('/studio/')) {
        const slug = pathname.replace('/studio/', '').split('/')[0] || 'sol-sanctuary';
        navigateTo({ path: 'public_studio', slug });
      } else if (pathname.startsWith('/s/')) {
        const slug = pathname.replace('/s/', '').split('/')[0] || 'sol-sanctuary';
        navigateTo({ path: 'public_studio', slug });
      } else {
        navigateTo({ path: 'public_studio', slug: 'sol-sanctuary' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateTo]);

  return (
    <div className="min-h-screen bg-aura-bg text-aura-charcoal antialiased selection:bg-aura-clay/20 font-sans">
      {/* Dynamic Navbar: Clean Hamburger on mobile, Desktop controls on >= 768px */}
      <Navbar />

      {/* Route & Role Separation */}
      <main>
        {currentRoute.path === 'admin' && <AdminPortal />}
        {currentRoute.path === 'onboarding' && <OnboardingWizard />}
        {currentRoute.path === 'explore' && <ExploreStudiosView />}
        {currentRoute.path === 'public_studio' && <ClientScheduleView />}
      </main>

      {/* Initial First-Run Welcome & Role Selection Modal */}
      <WelcomeModal />

      {/* Student 2-Choice Coach Referral vs. Explore Onboarding Modal */}
      <StudentOnboardingModal />

      {/* Value-First RevenueCat 14-Day Free Trial Paywall Modal */}
      <PaywallModal />

      {/* Booking Checkout Bottom Sheet Drawer (Public Client Flow) */}
      <BookingDrawer />

      {/* Waitlist Modal (Standard Queue vs VIP Pre-Authorization) */}
      <WaitlistModal />

      {/* Developer Sandbox Toolbar (Floating at Bottom) */}
      <DevSandboxToolbar />
    </div>
  );
};

export default App;

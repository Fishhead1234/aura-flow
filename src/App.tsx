import React, { useEffect } from 'react';
import { useAuraStore } from './store/auraStore';
import { Navbar } from './components/Navbar';
import { ClientScheduleView } from './components/ClientScheduleView';
import { BookingDrawer } from './components/BookingDrawer';
import { WaitlistModal } from './components/WaitlistModal';
import { AdminPortal } from './components/AdminPortal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { DevSandboxToolbar } from './components/DevSandboxToolbar';
import { AppRoute } from './types/aura';

export const App: React.FC = () => {
  const { currentRoute, navigateTo } = useAuraStore();

  // Listen to browser forward/back buttons (HTML5 History API)
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname === '/admin' || pathname.startsWith('/admin')) {
        navigateTo({ path: 'admin' });
      } else if (pathname === '/onboarding' || pathname.startsWith('/onboarding')) {
        navigateTo({ path: 'onboarding' });
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
        {currentRoute.path === 'public_studio' && <ClientScheduleView />}
      </main>

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

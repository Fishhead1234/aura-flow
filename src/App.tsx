import React from 'react';
import { useAuraStore } from './store/auraStore';
import { Navbar } from './components/Navbar';
import { ClientScheduleView } from './components/ClientScheduleView';
import { BookingDrawer } from './components/BookingDrawer';
import { WaitlistModal } from './components/WaitlistModal';
import { AdminPortal } from './components/AdminPortal';

export const App: React.FC = () => {
  const { viewMode } = useAuraStore();

  return (
    <div className="min-h-screen bg-aura-bg text-aura-charcoal antialiased selection:bg-aura-clay/20 font-sans">
      {/* Top Universal Header */}
      <Navbar />

      {/* Main View Mode Switcher: Client Booking vs Studio Admin */}
      <main>
        {viewMode === 'client' ? (
          <ClientScheduleView />
        ) : (
          <AdminPortal />
        )}
      </main>

      {/* Booking Checkout Bottom Sheet Drawer (Dialog Modal with pure CSS scroll containment) */}
      <BookingDrawer />

      {/* Waitlist Modal (Standard Queue vs VIP Pre-Authorization) */}
      <WaitlistModal />
    </div>
  );
};

export default App;

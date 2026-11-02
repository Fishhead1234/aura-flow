import { create } from 'zustand';
import {
  Studio,
  ClassSession,
  ClassPack,
  ClientPass,
  Booking,
  WaitlistEntry,
  CreditLedgerEntry,
  StripeConnectOverview,
  SupportedLocale,
  SupportedCurrency,
  PaymentMethodType,
  WaitlistMode,
} from '../types/aura';

interface AuraState {
  // Locale & Settings
  locale: SupportedLocale;
  currency: SupportedCurrency;
  viewMode: 'client' | 'admin';
  selectedDate: string; // ISO date string YYYY-MM-DD
  activeCategory: string; // 'All' or specific category
  activeAdminTab: 'schedule' | 'packs' | 'rosters' | 'policies';

  // Core Data
  studio: Studio;
  sessions: ClassSession[];
  classPacks: ClassPack[];
  userPass: ClientPass;
  bookings: Booking[];
  waitlist: WaitlistEntry[];
  creditLedger: CreditLedgerEntry[];
  stripeOverview: StripeConnectOverview;

  // Selected for Checkout/Action
  selectedSessionForBooking: ClassSession | null;
  isBookingDrawerOpen: boolean;
  selectedWaitlistSession: ClassSession | null;
  isWaitlistModalOpen: boolean;
  
  // Waterfall Demo Timer State
  activeWaterfallSessionId: string | null;
  activeWaterfallSecondsRemaining: number;

  // Actions
  setLocale: (locale: SupportedLocale) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  setViewMode: (mode: 'client' | 'admin') => void;
  setSelectedDate: (date: string) => void;
  setActiveCategory: (cat: string) => void;
  setActiveAdminTab: (tab: 'schedule' | 'packs' | 'rosters' | 'policies') => void;
  
  openBookingDrawer: (session: ClassSession) => void;
  closeBookingDrawer: () => void;
  openWaitlistModal: (session: ClassSession) => void;
  closeWaitlistModal: () => void;

  // Booking Execution
  confirmBooking: (
    sessionId: string,
    method: PaymentMethodType,
    clientName: string,
    clientEmail: string
  ) => { success: boolean; message: string };

  cancelBooking: (bookingId: string) => void;
  checkInClient: (bookingId: string) => void;

  // Waitlist Execution
  joinWaitlist: (
    sessionId: string,
    clientName: string,
    clientEmail: string,
    clientPhone: string,
    mode: WaitlistMode
  ) => void;

  claimWaitlistOffer: (entryId: string) => void;
  declineWaitlistOffer: (entryId: string) => void;
  triggerWaterfallCascade: (sessionId: string) => void;
  tickWaterfallTimer: () => void;

  // Studio Admin Actions
  updateStudioPolicies: (cancelWindowHrs: number, waitlistMins: number) => void;
  addSession: (session: Omit<ClassSession, 'id' | 'studioId' | 'bookedCount'>) => void;
  updateSessionCapacity: (sessionId: string, newCapacity: number) => void;
  deleteSession: (sessionId: string) => void;
  purchaseClassPack: (packId: string) => void;
}

const INITIAL_STUDIO: Studio = {
  id: 'studio-aura-01',
  slug: 'aura-flow',
  name: 'Aura Flow',
  tagline: 'Mindful Reformer & Dynamic Movement Sanctuary',
  currency: 'USD',
  stripeAccountId: 'acct_aura_fit_8892',
  stripeAccountName: 'Aura Fitaform Loon',
  cancelWindowHrs: 12,
  waitlistMins: 30,
  roomsCount: 2,
  monthlySubscriptionPrice: 29.0,
  platformTakeRate: 0.0,
  logoMark: '🌿',
};

const INITIAL_SESSIONS: ClassSession[] = [
  {
    id: 'sess-01',
    studioId: 'studio-aura-01',
    title: 'Dynamic Pilates',
    category: 'Reformer',
    instructor: 'Lena S.',
    instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-02T08:00:00.000Z',
    endTime: '2026-11-02T08:50:00.000Z',
    durationMins: 50,
    capacity: 8,
    bookedCount: 6, // 2 spots left
    price: 28.0,
    roomName: 'Reformer Studio A',
    level: 'Intermediate',
  },
  {
    id: 'sess-02',
    studioId: 'studio-aura-01',
    title: 'Vinyasa Flow',
    category: 'Flow',
    instructor: 'Marcus K.',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-02T09:15:00.000Z',
    endTime: '2026-11-02T10:15:00.000Z',
    durationMins: 60,
    capacity: 20,
    bookedCount: 15, // 5 spots left
    price: 26.0,
    roomName: 'Zen Bamboo Hall',
    level: 'All Levels',
  },
  {
    id: 'sess-03',
    studioId: 'studio-aura-01',
    title: 'Gentle Yin Yoga',
    category: 'Yin Yoga',
    instructor: 'Chloe M.',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-02T10:30:00.000Z',
    endTime: '2026-11-02T11:30:00.000Z',
    durationMins: 60,
    capacity: 8,
    bookedCount: 8, // Class Full • Join Waitlist
    price: 28.0,
    roomName: 'Warm Cedar Room',
    level: 'Beginner',
  },
  {
    id: 'sess-04',
    studioId: 'studio-aura-01',
    title: 'Morning Reformer Sculpt',
    category: 'Reformer',
    instructor: 'Lena S.',
    instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-03T08:30:00.000Z',
    endTime: '2026-11-03T09:20:00.000Z',
    durationMins: 50,
    capacity: 8,
    bookedCount: 7, // 1 spot left
    price: 28.0,
    roomName: 'Reformer Studio A',
    level: 'All Levels',
  },
  {
    id: 'sess-05',
    studioId: 'studio-aura-01',
    title: 'Restorative Sound Bath',
    category: 'Sound Bath',
    instructor: 'Maya Lin',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-03T18:00:00.000Z',
    endTime: '2026-11-03T19:15:00.000Z',
    durationMins: 75,
    capacity: 12,
    bookedCount: 11, // 1 spot left
    price: 35.0,
    roomName: 'Sound Sanctuary',
    level: 'All Levels',
  },
];

const INITIAL_PACKS: ClassPack[] = [
  {
    id: 'pack-5',
    studioId: 'studio-aura-01',
    name: '5-Class Pack',
    credits: 5,
    price: 115.0,
    originalPrice: 140.0,
    expiryDays: 90,
    popularBadge: true,
    description: 'Save $25 on your journey. Full access to Reformer & Flow sessions.',
  },
  {
    id: 'pack-10',
    studioId: 'studio-aura-01',
    name: '10-Class Committed Pack',
    credits: 10,
    price: 210.0,
    originalPrice: 280.0,
    expiryDays: 120,
    popularBadge: false,
    description: 'Maximum transformation. Includes complimentary guest pass.',
  },
  {
    id: 'pack-dropin',
    studioId: 'studio-aura-01',
    name: 'Single Drop-In Pass',
    credits: 1,
    price: 28.0,
    expiryDays: 30,
    popularBadge: false,
    description: 'Flexible drop-in pass with no long-term commitment.',
  },
];

const INITIAL_USER_PASS: ClientPass = {
  id: 'pass-user-991',
  userId: 'user-alyssa',
  packId: 'pack-5',
  packName: '5-Class Pack',
  creditsTotal: 5,
  creditsLeft: 2, // 2 Credits left as displayed in Screenshot 2!
  expiresAt: '2026-12-31T23:59:59.000Z',
  createdAt: '2026-10-15T10:00:00.000Z',
};

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-01',
    sessionId: 'sess-03',
    sessionTitle: 'Gentle Yin Yoga',
    sessionTime: '10:30 - 11:30 AM',
    clientEmail: 'emma.watson@example.com',
    clientName: 'Emma Watson',
    clientPhone: '+1 (555) 234-5678',
    paymentMethod: 'PASS_CREDIT',
    amountPaid: 0.0,
    creditsDeducted: 1,
    status: 'CONFIRMED',
    createdAt: '2026-10-30T09:00:00.000Z',
  },
  {
    id: 'b-02',
    sessionId: 'sess-03',
    sessionTitle: 'Gentle Yin Yoga',
    sessionTime: '10:30 - 11:30 AM',
    clientEmail: 'lucas.m@example.com',
    clientName: 'Lucas Miller',
    clientPhone: '+1 (555) 345-6789',
    paymentMethod: 'APPLE_PAY',
    amountPaid: 28.0,
    creditsDeducted: 0,
    status: 'CONFIRMED',
    createdAt: '2026-10-31T14:20:00.000Z',
  },
  {
    id: 'b-03',
    sessionId: 'sess-01',
    sessionTitle: 'Dynamic Pilates',
    sessionTime: '08:00 - 08:50 AM',
    clientEmail: 'alyssa.ramsey@example.com',
    clientName: 'Alyssa Ramsey',
    clientPhone: '+1 (555) 887-2341',
    paymentMethod: 'PASS_CREDIT',
    amountPaid: 0.0,
    creditsDeducted: 1,
    status: 'CHECKED_IN',
    createdAt: '2026-11-01T11:00:00.000Z',
  },
];

const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wl-01',
    sessionId: 'sess-03',
    sessionTitle: 'Gentle Yin Yoga',
    clientEmail: 'selina.chen@example.com',
    clientPhone: '+1 (555) 443-8991',
    clientName: 'Selina Chen',
    priorityOrder: 1,
    mode: 'VIP_PREAUTH', // VIP $0 Pre-auth hold
    status: 'WAITING',
    createdAt: '2026-11-01T15:00:00.000Z',
  },
  {
    id: 'wl-02',
    sessionId: 'sess-03',
    sessionTitle: 'Gentle Yin Yoga',
    clientEmail: 'david.lin@example.com',
    clientPhone: '+1 (555) 902-1144',
    clientName: 'David Lin',
    priorityOrder: 2,
    mode: 'STANDARD', // Standard Free Queue
    status: 'WAITING',
    createdAt: '2026-11-01T16:30:00.000Z',
  },
];

const INITIAL_LEDGER: CreditLedgerEntry[] = [
  {
    id: 'led-01',
    userId: 'user-alyssa',
    passId: 'pass-user-991',
    type: 'PURCHASE',
    delta: 5,
    balanceAfter: 5,
    referenceId: 'pack-5',
    note: 'Purchased 5-Class Pack bundle',
    createdAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'led-02',
    userId: 'user-alyssa',
    passId: 'pass-user-991',
    type: 'BOOKING_DEBIT',
    delta: -1,
    balanceAfter: 4,
    referenceId: 'sess-01',
    note: 'Reserved Dynamic Pilates spot',
    createdAt: '2026-10-20T12:00:00.000Z',
  },
  {
    id: 'led-03',
    userId: 'user-alyssa',
    passId: 'pass-user-991',
    type: 'BOOKING_DEBIT',
    delta: -1,
    balanceAfter: 3,
    referenceId: 'sess-02',
    note: 'Reserved Vinyasa Flow spot',
    createdAt: '2026-10-25T15:30:00.000Z',
  },
  {
    id: 'led-04',
    userId: 'user-alyssa',
    passId: 'pass-user-991',
    type: 'BOOKING_DEBIT',
    delta: -1,
    balanceAfter: 2,
    referenceId: 'sess-01',
    note: 'Reserved Dynamic Pilates morning spot',
    createdAt: '2026-11-01T11:00:00.000Z',
  },
];

const INITIAL_STRIPE: StripeConnectOverview = {
  connectedAccountName: 'Aura Fitaform Loon',
  stripeAccountId: 'acct_aura_fit_8892',
  grossVolume: 3593.0,
  platformFeeDeduction: 0.0, // $0.00 (0% take rate)
  stripeCardProcessingFee: 104.2,
  netBalance: 3488.8,
  pendingPayouts: 3593.0, // Matches screenshot 3 ($3,593)
  nextPayoutDate: '2026-12-29',
  currency: 'USD',
  payoutHistory: [
    { id: 'po-1', amount: 2840.0, date: '2026-10-15', status: 'PAID', arrivalDate: '2026-10-17' },
    { id: 'po-2', amount: 3120.0, date: '2026-10-30', status: 'PAID', arrivalDate: '2026-11-01' },
  ],
};

export const useAuraStore = create<AuraState>((set, get) => ({
  locale: (localStorage.getItem('aura_locale') as SupportedLocale) || 'en',
  currency: (localStorage.getItem('aura_currency') as SupportedCurrency) || 'USD',
  viewMode: 'client',
  selectedDate: '2026-11-02',
  activeCategory: 'All',
  activeAdminTab: 'schedule',

  studio: INITIAL_STUDIO,
  sessions: INITIAL_SESSIONS,
  classPacks: INITIAL_PACKS,
  userPass: INITIAL_USER_PASS,
  bookings: INITIAL_BOOKINGS,
  waitlist: INITIAL_WAITLIST,
  creditLedger: INITIAL_LEDGER,
  stripeOverview: INITIAL_STRIPE,

  selectedSessionForBooking: null,
  isBookingDrawerOpen: false,
  selectedWaitlistSession: null,
  isWaitlistModalOpen: false,

  activeWaterfallSessionId: null,
  activeWaterfallSecondsRemaining: 1800, // 30 minutes in seconds

  setLocale: (locale) => {
    localStorage.setItem('aura_locale', locale);
    set({ locale });
  },

  setCurrency: (currency) => {
    localStorage.setItem('aura_currency', currency);
    set({ currency });
  },

  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setActiveAdminTab: (activeAdminTab) => set({ activeAdminTab }),

  openBookingDrawer: (session) => set({ selectedSessionForBooking: session, isBookingDrawerOpen: true }),
  closeBookingDrawer: () => set({ isBookingDrawerOpen: false, selectedSessionForBooking: null }),
  openWaitlistModal: (session) => set({ selectedWaitlistSession: session, isWaitlistModalOpen: true }),
  closeWaitlistModal: () => set({ isWaitlistModalOpen: false, selectedWaitlistSession: null }),

  // Core Booking Engine
  confirmBooking: (sessionId, method, clientName, clientEmail) => {
    const { sessions, userPass, creditLedger, bookings, stripeOverview } = get();
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) return { success: false, message: 'Class session not found.' };
    if (session.bookedCount >= session.capacity) {
      return { success: false, message: 'Class is full. Please join the waitlist.' };
    }

    if (method === 'PASS_CREDIT') {
      if (userPass.creditsLeft <= 0) {
        return { success: false, message: 'Insufficient class pass credits.' };
      }

      const updatedCredits = userPass.creditsLeft - 1;
      const newLedgerEntry: CreditLedgerEntry = {
        id: `led-${Date.now()}`,
        userId: userPass.userId,
        passId: userPass.id,
        type: 'BOOKING_DEBIT',
        delta: -1,
        balanceAfter: updatedCredits,
        referenceId: sessionId,
        note: `Redeemed 1 Pass for ${session.title}`,
        createdAt: new Date().toISOString(),
      };

      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        sessionId,
        sessionTitle: session.title,
        sessionTime: `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`,
        clientEmail: clientEmail || 'alyssa.ramsey@example.com',
        clientName: clientName || 'Alyssa Ramsey',
        paymentMethod: 'PASS_CREDIT',
        amountPaid: 0.0,
        creditsDeducted: 1,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
      };

      set({
        userPass: { ...userPass, creditsLeft: updatedCredits },
        creditLedger: [newLedgerEntry, ...creditLedger],
        bookings: [newBooking, ...bookings],
        sessions: sessions.map((s) => (s.id === sessionId ? { ...s, bookedCount: s.bookedCount + 1 } : s)),
        isBookingDrawerOpen: false,
      });

      return { success: true, message: 'Pass credit redeemed successfully!' };
    }

    // Direct Stripe / Apple Pay Card Flow (0% platform fee)
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      sessionId,
      sessionTitle: session.title,
      sessionTime: `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`,
      clientEmail: clientEmail || 'alyssa.ramsey@example.com',
      clientName: clientName || 'Alyssa Ramsey',
      paymentMethod: method,
      stripePaymentId: `ch_${Date.now()}_direct`,
      amountPaid: session.price,
      creditsDeducted: 0,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    set({
      bookings: [newBooking, ...bookings],
      sessions: sessions.map((s) => (s.id === sessionId ? { ...s, bookedCount: s.bookedCount + 1 } : s)),
      stripeOverview: {
        ...stripeOverview,
        grossVolume: stripeOverview.grossVolume + session.price,
        pendingPayouts: stripeOverview.pendingPayouts + session.price,
      },
      isBookingDrawerOpen: false,
    });

    return { success: true, message: 'Direct payment confirmed via Stripe Connect!' };
  },

  // Cancel Booking & Trigger Automated Waitlist Cascade
  cancelBooking: (bookingId) => {
    const { bookings, sessions, userPass, creditLedger, triggerWaterfallCascade } = get();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Refund credit if pass credit was used
    let updatedPass = userPass;
    let newLedger = creditLedger;

    if (booking.creditsDeducted > 0) {
      const newBalance = userPass.creditsLeft + booking.creditsDeducted;
      updatedPass = { ...userPass, creditsLeft: newBalance };
      newLedger = [
        {
          id: `led-ref-${Date.now()}`,
          userId: userPass.userId,
          passId: userPass.id,
          type: 'CANCELLATION_REFUND',
          delta: booking.creditsDeducted,
          balanceAfter: newBalance,
          referenceId: booking.sessionId,
          note: `Refunded for cancellation of ${booking.sessionTitle}`,
          createdAt: new Date().toISOString(),
        },
        ...creditLedger,
      ];
    }

    const updatedSessions = sessions.map((s) =>
      s.id === booking.sessionId ? { ...s, bookedCount: Math.max(0, s.bookedCount - 1) } : s
    );

    set({
      bookings: bookings.filter((b) => b.id !== bookingId),
      sessions: updatedSessions,
      userPass: updatedPass,
      creditLedger: newLedger,
    });

    // Trigger waitlist waterfall cascade for this opened spot!
    triggerWaterfallCascade(booking.sessionId);
  },

  checkInClient: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, status: 'CHECKED_IN' } : b)),
    }));
  },

  // Waitlist Cascade Engine
  joinWaitlist: (sessionId, clientName, clientEmail, clientPhone, mode) => {
    const { waitlist, sessions } = get();
    const session = sessions.find((s) => s.id === sessionId);
    const existingCount = waitlist.filter((w) => w.sessionId === sessionId).length;

    const newEntry: WaitlistEntry = {
      id: `wl-${Date.now()}`,
      sessionId,
      sessionTitle: session?.title,
      clientName,
      clientEmail,
      clientPhone,
      priorityOrder: existingCount + 1,
      mode,
      status: 'WAITING',
      createdAt: new Date().toISOString(),
    };

    set({
      waitlist: [...waitlist, newEntry],
      isWaitlistModalOpen: false,
    });
  },

  triggerWaterfallCascade: (sessionId) => {
    const { waitlist, sessions, bookings, stripeOverview } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    // Find highest priority waiting person
    const candidates = waitlist
      .filter((w) => w.sessionId === sessionId && (w.status === 'WAITING' || w.status === 'OFFERED'))
      .sort((a, b) => a.priorityOrder - b.priorityOrder);

    if (candidates.length === 0) return;

    const topCandidate = candidates[0];

    // IF VIP PRE-AUTH: Instantly capture payment and claim spot!
    if (topCandidate.mode === 'VIP_PREAUTH') {
      const newBooking: Booking = {
        id: `bk-vip-${Date.now()}`,
        sessionId,
        sessionTitle: session.title,
        sessionTime: `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`,
        clientEmail: topCandidate.clientEmail,
        clientName: topCandidate.clientName,
        clientPhone: topCandidate.clientPhone,
        paymentMethod: 'STRIPE_CARD',
        stripePaymentId: `ch_vip_preauth_${Date.now()}`,
        amountPaid: session.price,
        creditsDeducted: 0,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
      };

      set({
        sessions: sessions.map((s) => (s.id === sessionId ? { ...s, bookedCount: s.bookedCount + 1 } : s)),
        bookings: [newBooking, ...bookings],
        waitlist: waitlist.map((w) => (w.id === topCandidate.id ? { ...w, status: 'CLAIMED' } : w)),
        stripeOverview: {
          ...stripeOverview,
          grossVolume: stripeOverview.grossVolume + session.price,
          pendingPayouts: stripeOverview.pendingPayouts + session.price,
        },
        activeWaterfallSessionId: null,
      });
      return;
    }

    // IF STANDARD: Dispatch 30-minute offer token and start cascade timer
    const offerExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    set({
      waitlist: waitlist.map((w) =>
        w.id === topCandidate.id
          ? {
              ...w,
              status: 'OFFERED',
              offerExpiresAt,
              claimToken: `tok_${Date.now()}`,
            }
          : w
      ),
      activeWaterfallSessionId: sessionId,
      activeWaterfallSecondsRemaining: 1800, // 30 minutes
    });
  },

  claimWaitlistOffer: (entryId) => {
    const { waitlist, sessions, bookings } = get();
    const entry = waitlist.find((w) => w.id === entryId);
    if (!entry) return;

    const session = sessions.find((s) => s.id === entry.sessionId);
    if (!session) return;

    const newBooking: Booking = {
      id: `bk-claimed-${Date.now()}`,
      sessionId: entry.sessionId,
      sessionTitle: session.title,
      sessionTime: `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`,
      clientEmail: entry.clientEmail,
      clientName: entry.clientName,
      clientPhone: entry.clientPhone,
      paymentMethod: 'STRIPE_CARD',
      amountPaid: session.price,
      creditsDeducted: 0,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    set({
      sessions: sessions.map((s) => (s.id === entry.sessionId ? { ...s, bookedCount: s.bookedCount + 1 } : s)),
      bookings: [newBooking, ...bookings],
      waitlist: waitlist.map((w) => (w.id === entryId ? { ...w, status: 'CLAIMED' } : w)),
      activeWaterfallSessionId: null,
    });
  },

  declineWaitlistOffer: (entryId) => {
    const { waitlist, triggerWaterfallCascade } = get();
    const entry = waitlist.find((w) => w.id === entryId);
    if (!entry) return;

    set({
      waitlist: waitlist.map((w) => (w.id === entryId ? { ...w, status: 'DECLINED' } : w)),
      activeWaterfallSessionId: null,
    });

    // Cascade to next candidate
    triggerWaterfallCascade(entry.sessionId);
  },

  tickWaterfallTimer: () => {
    const { activeWaterfallSecondsRemaining, activeWaterfallSessionId, waitlist, triggerWaterfallCascade } = get();
    if (!activeWaterfallSessionId) return;

    if (activeWaterfallSecondsRemaining <= 1) {
      // Expired! Mark currently offered as EXPIRED and cascade to #2
      const offeredEntry = waitlist.find((w) => w.sessionId === activeWaterfallSessionId && w.status === 'OFFERED');
      if (offeredEntry) {
        set({
          waitlist: waitlist.map((w) => (w.id === offeredEntry.id ? { ...w, status: 'EXPIRED' } : w)),
          activeWaterfallSecondsRemaining: 1800,
        });
        triggerWaterfallCascade(activeWaterfallSessionId);
      }
    } else {
      set({ activeWaterfallSecondsRemaining: activeWaterfallSecondsRemaining - 1 });
    }
  },

  updateStudioPolicies: (cancelWindowHrs, waitlistMins) => {
    set((state) => ({
      studio: {
        ...state.studio,
        cancelWindowHrs,
        waitlistMins,
      },
    }));
  },

  addSession: (sessionData) => {
    const newSession: ClassSession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      studioId: get().studio.id,
      bookedCount: 0,
    };
    set((state) => ({ sessions: [...state.sessions, newSession] }));
  },

  updateSessionCapacity: (sessionId, newCapacity) => {
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, capacity: newCapacity } : s)),
    }));
  },

  deleteSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
    }));
  },

  purchaseClassPack: (packId) => {
    const { classPacks, userPass, creditLedger, stripeOverview } = get();
    const pack = classPacks.find((p) => p.id === packId);
    if (!pack) return;

    const newBalance = userPass.creditsLeft + pack.credits;
    const newLedgerEntry: CreditLedgerEntry = {
      id: `led-buy-${Date.now()}`,
      userId: userPass.userId,
      passId: userPass.id,
      type: 'PURCHASE',
      delta: pack.credits,
      balanceAfter: newBalance,
      referenceId: pack.id,
      note: `Purchased ${pack.name}`,
      createdAt: new Date().toISOString(),
    };

    set({
      userPass: {
        ...userPass,
        packName: pack.name,
        creditsTotal: userPass.creditsTotal + pack.credits,
        creditsLeft: newBalance,
      },
      creditLedger: [newLedgerEntry, ...creditLedger],
      stripeOverview: {
        ...stripeOverview,
        grossVolume: stripeOverview.grossVolume + pack.price,
        pendingPayouts: stripeOverview.pendingPayouts + pack.price,
      },
    });
  },
}));


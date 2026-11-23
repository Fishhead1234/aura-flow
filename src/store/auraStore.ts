import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auraCloudSync } from '../services/auraCloudSync';
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
  AppRoute,
  DatabaseUser,
  PersonaType,
  ChatMessage,
  Conversation,
  RosterBroadcast,
  StudioCommunicationSettings,
  StudioPaymentConfig,
  AdminTabType,
  CoachWeeklyTip,
  BodyJournalEntry,
  RetentionCareConfig,
  VacancyAlertLog,
  ClassVisibility,
  PrivateCapacityPreset,
  InvitedStudentEntry,
  LocationType,
} from '../types/aura';
import { DEFAULT_RETENTION_CARE_CONFIG } from '../services/retentionService';

function parseInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return { path: 'public_studio', slug: 'my-studio' };
  const pathname = window.location.pathname;
  if (pathname === '/admin' || pathname.startsWith('/admin')) {
    return { path: 'admin' };
  }
  if (pathname === '/onboarding' || pathname.startsWith('/onboarding')) {
    return { path: 'onboarding' };
  }
  if (pathname === '/explore' || pathname.startsWith('/explore')) {
    return { path: 'explore' };
  }
  if (pathname.startsWith('/vip/')) {
    const inviteToken = pathname.replace('/vip/', '').split('/')[0] || '';
    return { path: 'vip_booking', inviteToken };
  }
  if (pathname.startsWith('/studio/')) {
    const slug = pathname.replace('/studio/', '').split('/')[0] || 'my-studio';
    return { path: 'public_studio', slug };
  }
  if (pathname.startsWith('/s/')) {
    const slug = pathname.replace('/s/', '').split('/')[0] || 'my-studio';
    return { path: 'public_studio', slug };
  }
  const boundSlug = typeof window !== 'undefined' ? localStorage.getItem('auraflow_bound_studio_slug') : null;
  if (boundSlug) {
    return { path: 'public_studio', slug: boundSlug };
  }
  return { path: 'admin' };
}

// Clean User Personas (Zero Mock Users)
const PERSONA_OWNER: DatabaseUser = {
  id: 'usr-owner-clean',
  email: '',
  role: 'OWNER',
  name: '',
  studioId: '',
  createdAt: new Date().toISOString(),
};

const PERSONA_STUDENT: DatabaseUser = {
  id: 'usr-student-clean',
  email: '',
  role: 'STUDENT',
  name: '',
  createdAt: new Date().toISOString(),
};

const PERSONA_ELENA = PERSONA_OWNER;
const PERSONA_NEW_OWNER = PERSONA_OWNER;
const PERSONA_MAYA = PERSONA_STUDENT;
const PERSONA_NEW_STUDENT = PERSONA_STUDENT;

const DEFAULT_COMMUNICATION: StudioCommunicationSettings = {
  lineOaEnabled: false,
  lineChannelId: '',
  lineChannelSecret: '',
  lineAccessToken: '',
  instagramHandle: '',
  supportEmail: '',
};

const DEFAULT_PAYMENTS: StudioPaymentConfig = {
  stripe: {
    enabled: false,
    connected: false,
    accountName: '',
    supportedCards: ['Visa', 'Mastercard', 'JCB', 'Apple Pay', 'Google Pay'],
  },
  linePay: {
    enabled: false,
    channelId: '',
    channelSecret: '',
    qrCodeUrl: '',
  },
  jkoPay: {
    enabled: false,
    merchantId: '',
    qrCodeUrl: '',
  },
  bankTransfer: {
    enabled: false,
    bankName: '',
    bankCode: '',
    accountNumber: '',
    accountName: '',
  },
};

const DEFAULT_WEEKLY_TIP: CoachWeeklyTip = {
  id: '',
  studioId: '',
  coachName: '',
  coachAvatar: '',
  title: '',
  content: '',
  mediaUrl: '',
  mediaType: 'IMAGE',
  focusTag: '',
  pinnedAt: '',
};

const INITIAL_BODY_JOURNAL: BodyJournalEntry[] = [];

// Empty studio placeholder when starting completely from scratch
const EMPTY_STUDIO: Studio = {
  id: '',
  ownerId: PERSONA_OWNER.id,
  slug: '',
  name: '',
  coachName: '',
  studioCode: '',
  tagline: '',
  currency: 'TWD',
  stripeAccountId: '',
  stripeAccountName: '',
  cancelWindowHrs: 12,
  waitlistMins: 30,
  roomsCount: 1,
  monthlySubscriptionPrice: 29.0,
  platformTakeRate: 0.0,
  logoMark: '✨',
  createdAt: new Date().toISOString(),
  announcementBanner: '',
  discoverable: true,
  city: '',
  isPro: false,
  isLive: false,
  communication: DEFAULT_COMMUNICATION,
  paymentMethods: DEFAULT_PAYMENTS,
  weeklyTip: DEFAULT_WEEKLY_TIP,
  retentionCare: DEFAULT_RETENTION_CARE_CONFIG,
};

// Zero pre-seeded studios
const INITIAL_STUDIOS: Studio[] = [];

const INITIAL_CONVERSATIONS: Conversation[] = [];
const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};
const INITIAL_BROADCASTS: RosterBroadcast[] = [];
const INITIAL_SESSIONS: ClassSession[] = [];
const INITIAL_PACKS: ClassPack[] = [];
const INITIAL_MAYA_PASS: ClientPass = {
  id: '',
  userId: '',
  studioId: 'studio-clean-01',
  packId: '',
  packName: '',
  creditsTotal: 0,
  creditsLeft: 0,
  expiresAt: '',
  createdAt: '',
};
const INITIAL_BOOKINGS: Booking[] = [];
const INITIAL_WAITLIST: WaitlistEntry[] = [];
const INITIAL_LEDGER: CreditLedgerEntry[] = [];
const INITIAL_STRIPE: StripeConnectOverview = {
  connectedAccountName: '',
  stripeAccountId: '',
  grossVolume: 0,
  platformFeeDeduction: 0.0,
  stripeCardProcessingFee: 0,
  netBalance: 0,
  pendingPayouts: 0,
  nextPayoutDate: '',
  currency: 'TWD',
  payoutHistory: [],
};

const createFreshStripeOverview = (
  connectedAccountName: string,
  currency: SupportedCurrency = 'TWD'
): StripeConnectOverview => ({
  connectedAccountName,
  stripeAccountId: `acct_fresh_${Date.now()}`,
  grossVolume: 0,
  platformFeeDeduction: 0,
  stripeCardProcessingFee: 0,
  netBalance: 0,
  pendingPayouts: 0,
  nextPayoutDate: '',
  currency,
  payoutHistory: [],
});

interface AuraState {
  // Navigation & Route
  currentRoute: AppRoute;
  navigateTo: (route: AppRoute) => void;

  // Sandbox Persona & Stripe Simulation
  activePersona: PersonaType;
  switchPersona: (persona: PersonaType) => void;
  simulateStripePayment: boolean;
  setSimulateStripePayment: (simulate: boolean) => void;
  resetDatabaseToSeedState: () => void;
  isDevSandboxVisible: boolean;
  setDevSandboxVisible: (visible: boolean) => void;
  isDevPinModalOpen: boolean;
  setDevPinModalOpen: (open: boolean) => void;
  resetAsNewCoach: () => void;

  // Locale & Settings
  locale: SupportedLocale;
  currency: SupportedCurrency;
  selectedDate: string;
  activeCategory: string;
  activeAdminTab: AdminTabType;
  isMobileDrawerOpen: boolean;

  // Messaging & Communication Suite
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  broadcastHistory: RosterBroadcast[];
  isStudentChatOpen: boolean;
  studentChatSessionContext: { sessionId?: string; sessionTitle?: string } | null;

  // Active User & Studio Context
  currentUser: DatabaseUser;
  studios: Studio[];
  activeStudioId: string;
  studio: Studio;

  // Entities
  sessions: ClassSession[];
  classPacks: ClassPack[];
  userPass: ClientPass;
  bookings: Booking[];
  waitlist: WaitlistEntry[];
  creditLedger: CreditLedgerEntry[];
  stripeOverview: StripeConnectOverview;
  bodyJournalEntries: BodyJournalEntry[];
  vacancyAlerts: VacancyAlertLog[];

  // Modals
  selectedSessionForBooking: ClassSession | null;
  isBookingDrawerOpen: boolean;
  selectedWaitlistSession: ClassSession | null;
  isWaitlistModalOpen: boolean;
  isWelcomeModalOpen: boolean;
  isStudentOnboardingOpen: boolean;
  isQrScannerOpen: boolean;
  boundStudioSlug: string | null;
  favoriteStudioSlugs: string[];
  isPaywallModalOpen: boolean;
  paywallTriggerReason: 'PUBLISH_SCHEDULE' | 'SHARE_LINK' | 'DISCOVERY_FEED' | null;
  isTransferModalOpen: boolean;
  transferModalTab: 'TRANSFER' | 'RESTORE' | 'BACKUP';
  openTransferModal: (tab?: 'TRANSFER' | 'RESTORE' | 'BACKUP') => void;
  closeTransferModal: () => void;
  restoreFromSnapshot: (snapshot: import('../services/auraCloudSync').AuraCloudSnapshot) => void;

  // Waterfall Timer
  activeWaterfallSessionId: string | null;
  activeWaterfallSecondsRemaining: number;

  // Actions
  setLocale: (locale: SupportedLocale) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  setSelectedDate: (date: string) => void;
  setActiveCategory: (cat: string) => void;
  setActiveAdminTab: (tab: AdminTabType) => void;
  setMobileDrawerOpen: (open: boolean) => void;
  setWelcomeModalOpen: (open: boolean) => void;
  setStudentOnboardingOpen: (open: boolean) => void;
  setQrScannerOpen: (open: boolean) => void;
  bindStudentToCoach: (slug: string) => void;
  openPaywallModal: (reason?: 'PUBLISH_SCHEDULE' | 'SHARE_LINK' | 'DISCOVERY_FEED') => void;
  closePaywallModal: () => void;
  activateProSubscription: () => void;
  updateStudioSettings: (updates: Partial<Studio>) => void;
  resetToCleanGuestState: () => void;

  // Messaging Actions
  setActiveConversationId: (id: string | null) => void;
  openStudentChat: (sessionId?: string, sessionTitle?: string) => void;
  closeStudentChat: () => void;
  sendChatMessage: (
    conversationId: string,
    content: string,
    senderRole?: 'STUDENT' | 'INSTRUCTOR',
    channel?: 'IN_APP' | 'LINE_OA'
  ) => void;
  sendStudentInquiry: (
    content: string,
    sessionId?: string,
    sessionTitle?: string
  ) => string;
  broadcastToRoster: (
    sessionId: string,
    message: string,
    channels: ('IN_APP' | 'LINE_OA')[]
  ) => void;
  updateStudioCommunication: (settings: Partial<StudioCommunicationSettings>) => void;
  updateStudioPayments: (config: Partial<StudioPaymentConfig>) => void;
  updateWeeklyTip: (tip: Partial<CoachWeeklyTip>) => void;
  updateRetentionCareConfig: (config: Partial<RetentionCareConfig>) => void;
  dispatchRetentionCareMessage: (
    studentName: string,
    studentEmail: string,
    message: string
  ) => void;
  addBodyJournalEntry: (
    entry: Omit<BodyJournalEntry, 'id' | 'userId' | 'studioId' | 'createdAt'>
  ) => void;
  notifyLastMinuteVacancy: (
    sessionId: string,
    targetAudience: 'WAITLIST_AND_FAVORITES' | 'FAVORITES_ONLY' | 'WAITLIST_ONLY',
    message: string
  ) => void;

  openBookingDrawer: (session: ClassSession) => void;
  closeBookingDrawer: () => void;
  openWaitlistModal: (session: ClassSession) => void;
  closeWaitlistModal: () => void;

  confirmBooking: (
    sessionId: string,
    method: PaymentMethodType,
    clientName: string,
    clientEmail: string,
    remittanceLast5?: string
  ) => { success: boolean; message: string };

  cloudConnected: boolean;
  lastCloudSyncAt: string | null;
  syncFromCloud: () => Promise<void>;
  syncToCloud: () => Promise<void>;

  cancelBooking: (bookingId: string) => void;
  checkInClient: (bookingId: string) => void;

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

  updateStudioPolicies: (cancelWindowHrs: number, waitlistMins: number) => void;
  updateStudioLogo: (logoUrl: string) => void;
  addSession: (session: Omit<ClassSession, 'id' | 'studioId' | 'bookedCount'>) => void;
  editSession: (sessionId: string, updates: Partial<ClassSession>) => void;
  rescheduleSession: (
    sessionId: string,
    newStartTime: string,
    newEndTime: string,
    notifyStudents?: boolean
  ) => void;
  cancelSession: (sessionId: string, reason?: string) => void;
  updateSessionCapacity: (sessionId: string, newCapacity: number) => void;
  updateSessionNotes: (
    sessionId: string,
    preClassNote: string,
    postClassHomework: string
  ) => void;
  markSessionHomeworkDone: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  purchaseClassPack: (packId: string) => void;
  addClassPack: (pack: Omit<ClassPack, 'id' | 'studioId'>) => void;
  updateClassPack: (id: string, updates: Partial<ClassPack>) => void;
  deleteClassPack: (id: string) => void;

  createStudioWithOnboarding: (data: {
    name: string;
    slug: string;
    tagline?: string;
    logoUrl?: string;
    currency: SupportedCurrency;
    cancelWindowHrs: number;
    waitlistMins: number;
    firstClass: {
      title: string;
      category: any;
      instructor: string;
      capacity: number;
      price: number;
      roomName: string;
      visibility?: ClassVisibility;
      privatePreset?: PrivateCapacityPreset;
      pinCode?: string;
      invitedStudents?: InvitedStudentEntry[];
      locationType?: LocationType;
      address?: string;
      preClassNote?: string;
      postClassHomework?: string;
    };
  }) => void;
}

if (typeof window !== 'undefined') {
  const CLEAN_KEY = 'auraflow_scratch_clean_v3';
  if (localStorage.getItem(CLEAN_KEY) !== 'true') {
    localStorage.removeItem('auraflow_has_launched');
    localStorage.removeItem('auraflow_bound_studio_slug');
    localStorage.removeItem('auraflow_is_pro');
    localStorage.removeItem('aura-flow-db-v1');
    localStorage.removeItem('aura-flow-clean-v2');
    localStorage.removeItem('aura-flow-scratch-v3');
    localStorage.setItem(CLEAN_KEY, 'true');
  }
}

export const useAuraStore = create<AuraState>()(
  persist(
    (set, get) => ({
  currentRoute: parseInitialRoute(),
  activePersona: 'new_owner',
  simulateStripePayment: true, // Default to auto-approving test transactions
  isDevSandboxVisible: false,
  isDevPinModalOpen: false,

  locale: (typeof window !== 'undefined' && (localStorage.getItem('aura_locale') as SupportedLocale)) || 'zh-TW',
  currency: (typeof window !== 'undefined' && (localStorage.getItem('aura_currency') as SupportedCurrency)) || 'TWD',
  selectedDate: new Date().toISOString().split('T')[0],
  activeCategory: 'All',
  activeAdminTab: 'schedule',
  isMobileDrawerOpen: false,

  // Messaging & Communication Initial State
  conversations: INITIAL_CONVERSATIONS,
  messages: INITIAL_MESSAGES,
  activeConversationId: null,
  broadcastHistory: INITIAL_BROADCASTS,
  isStudentChatOpen: false,
  studentChatSessionContext: null,

  currentUser: PERSONA_OWNER,
  studios: INITIAL_STUDIOS,
  activeStudioId: '',
  studio: EMPTY_STUDIO,

  sessions: INITIAL_SESSIONS,
  classPacks: INITIAL_PACKS,
  userPass: INITIAL_MAYA_PASS,
  bookings: INITIAL_BOOKINGS,
  waitlist: INITIAL_WAITLIST,
  creditLedger: INITIAL_LEDGER,
  stripeOverview: INITIAL_STRIPE,
  bodyJournalEntries: INITIAL_BODY_JOURNAL,
  vacancyAlerts: [],

  selectedSessionForBooking: null,
  isBookingDrawerOpen: false,
  selectedWaitlistSession: null,
  isWaitlistModalOpen: false,
  isWelcomeModalOpen: false,
  isStudentOnboardingOpen: false,
  isQrScannerOpen: false,
  boundStudioSlug: (typeof window !== 'undefined' && localStorage.getItem('auraflow_bound_studio_slug')) || null,
  favoriteStudioSlugs: [],
  isPaywallModalOpen: false,
  paywallTriggerReason: null,
  isTransferModalOpen: false,
  transferModalTab: 'TRANSFER',

  activeWaterfallSessionId: null,
  activeWaterfallSecondsRemaining: 1800,

  cloudConnected: false,
  lastCloudSyncAt: null,

  syncFromCloud: async () => {
    const res = await auraCloudSync.pullState();
    if (!res.ok) return;
    if (!res.snapshot) {
      set({ cloudConnected: true });
      get().syncToCloud();
      return;
    }
    const snap = res.snapshot;
    const cloudTime = res.updatedAt || snap.updatedAt;
    const currentLastSync = get().lastCloudSyncAt;
    if (currentLastSync && cloudTime && cloudTime <= currentLastSync) {
      set({ cloudConnected: true });
      return;
    }
    set((state) => ({
      cloudConnected: true,
      lastCloudSyncAt: cloudTime || new Date().toISOString(),
      studios: snap.studios || state.studios,
      studio: snap.studio || state.studio,
      activeStudioId: snap.activeStudioId || state.activeStudioId,
      sessions: snap.sessions || state.sessions,
      classPacks: snap.classPacks || state.classPacks,
      userPass: snap.userPass || state.userPass,
      bookings: snap.bookings || state.bookings,
      waitlist: snap.waitlist || state.waitlist,
      creditLedger: snap.creditLedger || state.creditLedger,
      stripeOverview: snap.stripeOverview || state.stripeOverview,
      conversations: snap.conversations || state.conversations,
      messages: snap.messages || state.messages,
      broadcastHistory: snap.broadcastHistory || state.broadcastHistory,
    }));
  },

  syncToCloud: async () => {
    const state = get();
    const res = await auraCloudSync.pushState({
      studios: state.studios,
      studio: state.studio,
      activeStudioId: state.activeStudioId,
      sessions: state.sessions,
      classPacks: state.classPacks,
      userPass: state.userPass,
      bookings: state.bookings,
      waitlist: state.waitlist,
      creditLedger: state.creditLedger,
      stripeOverview: state.stripeOverview,
      conversations: state.conversations,
      messages: state.messages,
      broadcastHistory: state.broadcastHistory,
    });
    if (res.ok) {
      set({ cloudConnected: true, lastCloudSyncAt: res.updatedAt || new Date().toISOString() });
    }
  },

  navigateTo: (route) => {
    let url = '/admin';
    if (route.path === 'admin') url = '/admin';
    else if (route.path === 'onboarding') url = '/onboarding';
    else if (route.path === 'explore') url = '/explore';
    else if (route.path === 'vip_booking') {
      url = `/vip/${route.inviteToken}`;
    } else if (route.path === 'public_studio') {
      url = `/studio/${route.slug}`;
      const matched = get().studios.find((s) => s.slug === route.slug);
      if (matched) {
        set({ studio: matched, activeStudioId: matched.id });
      }
    }

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', url);
    }
    set({ currentRoute: route, isMobileDrawerOpen: false });
  },

  switchPersona: (persona) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auraflow_has_launched', 'true');
    }
    const existingStudio = get().studios[0] || EMPTY_STUDIO;
    if (persona === 'elena_owner') {
      set({
        activePersona: 'elena_owner',
        currentUser: PERSONA_OWNER,
        studio: existingStudio,
        activeStudioId: existingStudio.id,
        isWelcomeModalOpen: false,
      });
      get().navigateTo({ path: 'admin' });
    } else if (persona === 'maya_student') {
      set({
        activePersona: 'maya_student',
        currentUser: PERSONA_STUDENT,
        userPass: {
          ...INITIAL_MAYA_PASS,
          userId: PERSONA_STUDENT.id,
          creditsLeft: 0,
        },
        isWelcomeModalOpen: false,
      });
      get().navigateTo(
        existingStudio.slug ? { path: 'public_studio', slug: existingStudio.slug } : { path: 'explore' }
      );
    } else if (persona === 'new_student') {
      set({
        activePersona: 'new_student',
        currentUser: PERSONA_STUDENT,
        bookings: [],
        userPass: {
          ...INITIAL_MAYA_PASS,
          id: 'pass-guest-0',
          userId: PERSONA_STUDENT.id,
          creditsLeft: 0,
        },
        isWelcomeModalOpen: false,
      });
      get().navigateTo({ path: 'explore' });
    } else if (persona === 'new_owner') {
      set(() => ({
        activePersona: 'new_owner',
        currentUser: PERSONA_OWNER,
        studio: EMPTY_STUDIO,
        studios: [],
        activeStudioId: '',
        sessions: [],
        bookings: [],
        waitlist: [],
        conversations: [],
        isWelcomeModalOpen: false,
      }));
      get().navigateTo({ path: 'onboarding' });
    }
  },

  resetAsNewCoach: () => {
    set(() => ({
      activePersona: 'new_owner',
      currentUser: PERSONA_OWNER,
      studio: EMPTY_STUDIO,
      studios: [],
      activeStudioId: '',
      sessions: [],
      classPacks: [],
      bookings: [],
      waitlist: [],
      creditLedger: [],
      conversations: [],
      messages: {},
      broadcastHistory: [],
      bodyJournalEntries: [],
      stripeOverview: INITIAL_STRIPE,
      isWelcomeModalOpen: false,
    }));
    get().navigateTo({ path: 'onboarding' });
    get().syncToCloud();
  },

  setSimulateStripePayment: (simulateStripePayment) => set({ simulateStripePayment }),
  setDevSandboxVisible: (visible) => set({ isDevSandboxVisible: visible }),
  setDevPinModalOpen: (open) => set({ isDevPinModalOpen: open }),

  resetDatabaseToSeedState: () => {
    set({
      studios: [],
      studio: EMPTY_STUDIO,
      activeStudioId: '',
      sessions: [],
      classPacks: [],
      userPass: INITIAL_MAYA_PASS,
      bookings: [],
      waitlist: [],
      creditLedger: [],
      stripeOverview: INITIAL_STRIPE,
      conversations: [],
      messages: {},
      activeConversationId: null,
      broadcastHistory: [],
      bodyJournalEntries: [],
      isStudentChatOpen: false,
      studentChatSessionContext: null,
      activeWaterfallSessionId: null,
      activeWaterfallSecondsRemaining: 1800,
      selectedSessionForBooking: null,
      isBookingDrawerOpen: false,
    });
    get().syncToCloud();
  },

  setLocale: (locale) => {
    if (typeof window !== 'undefined') localStorage.setItem('aura_locale', locale);
    set({ locale });
  },

  setCurrency: (currency) => {
    if (typeof window !== 'undefined') localStorage.setItem('aura_currency', currency);
    set({ currency });
  },

  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setActiveAdminTab: (activeAdminTab) => set({ activeAdminTab }),
  setMobileDrawerOpen: (isMobileDrawerOpen) => set({ isMobileDrawerOpen }),
  setWelcomeModalOpen: (isWelcomeModalOpen) => set({ isWelcomeModalOpen }),
  setStudentOnboardingOpen: (isStudentOnboardingOpen) => set({ isStudentOnboardingOpen }),
  setQrScannerOpen: (isQrScannerOpen) => set({ isQrScannerOpen }),

  bindStudentToCoach: (slug) => {
    const matched = get().studios.find((s) => s.slug === slug) || EMPTY_STUDIO;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auraflow_has_launched', 'true');
      localStorage.setItem('auraflow_bound_studio_slug', matched.slug);
    }
    const existingFavs = get().favoriteStudioSlugs || [];
    const updatedFavs = existingFavs.includes(matched.slug)
      ? existingFavs
      : [matched.slug, ...existingFavs];

    set({
      boundStudioSlug: matched.slug,
      favoriteStudioSlugs: updatedFavs,
      studio: matched,
      activeStudioId: matched.id,
      isWelcomeModalOpen: false,
      isStudentOnboardingOpen: false,
    });
    get().navigateTo({ path: 'public_studio', slug: matched.slug });
  },

  openPaywallModal: (reason = 'PUBLISH_SCHEDULE') =>
    set({ isPaywallModalOpen: true, paywallTriggerReason: reason }),
  closePaywallModal: () =>
    set({ isPaywallModalOpen: false, paywallTriggerReason: null }),

  openTransferModal: (tab = 'TRANSFER') =>
    set({ isTransferModalOpen: true, transferModalTab: tab }),
  closeTransferModal: () =>
    set({ isTransferModalOpen: false }),

  restoreFromSnapshot: (snapshot) => {
    set({
      studios: snapshot.studios || (snapshot.studio ? [snapshot.studio] : get().studios),
      studio: snapshot.studio || get().studio,
      activeStudioId: snapshot.activeStudioId || snapshot.studio?.id || get().activeStudioId,
      sessions: snapshot.sessions || get().sessions,
      classPacks: snapshot.classPacks || get().classPacks,
      bookings: snapshot.bookings || get().bookings,
      waitlist: snapshot.waitlist || get().waitlist,
      creditLedger: snapshot.creditLedger || get().creditLedger,
      stripeOverview: snapshot.stripeOverview || get().stripeOverview,
      conversations: snapshot.conversations || get().conversations,
      messages: snapshot.messages || get().messages,
      broadcastHistory: snapshot.broadcastHistory || get().broadcastHistory,
      isTransferModalOpen: false,
      isWelcomeModalOpen: false,
      activePersona: 'elena_owner',
      currentRoute: { path: 'admin' },
    });
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
    }
    get().syncToCloud();
  },

  activateProSubscription: () => {
    const { studio, studios } = get();
    const updatedStudio: Studio = { ...studio, isPro: true, isLive: true, discoverable: true };
    set({
      studio: updatedStudio,
      studios: studios.map((s) => (s.id === studio.id ? updatedStudio : s)),
      isPaywallModalOpen: false,
      paywallTriggerReason: null,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('auraflow_is_pro', 'true');
    }
    get().syncToCloud();
  },

  updateStudioSettings: (updates) => {
    const { studio, studios } = get();
    const updatedStudio: Studio = { ...studio, ...updates };
    set({
      studio: updatedStudio,
      studios: studios.map((s) => (s.id === studio.id ? updatedStudio : s)),
    });
    get().syncToCloud();
  },

  resetToCleanGuestState: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auraflow_has_launched');
      localStorage.removeItem('auraflow_bound_studio_slug');
      localStorage.removeItem('auraflow_is_pro');
      localStorage.removeItem('aura-flow-db-v1');
      localStorage.removeItem('aura-flow-clean-v2');
      localStorage.removeItem('aura-flow-scratch-v3');
    }
    set({
      activePersona: 'new_student',
      currentUser: PERSONA_NEW_STUDENT,
      studios: [],
      studio: EMPTY_STUDIO,
      activeStudioId: '',
      sessions: [],
      classPacks: [],
      bookings: [],
      waitlist: [],
      creditLedger: [],
      conversations: [],
      messages: {},
      broadcastHistory: [],
      bodyJournalEntries: [],
      stripeOverview: INITIAL_STRIPE,
      boundStudioSlug: null,
      favoriteStudioSlugs: [],
      userPass: {
        ...INITIAL_MAYA_PASS,
        id: 'pass-guest-0',
        userId: PERSONA_NEW_STUDENT.id,
        creditsLeft: 0,
      },
      isWelcomeModalOpen: true,
      isStudentOnboardingOpen: false,
      isPaywallModalOpen: false,
      isBookingDrawerOpen: false,
      currentRoute: { path: 'explore' },
    });
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/explore');
    }
  },

  setActiveConversationId: (activeConversationId) => {
    set({ activeConversationId });
    if (activeConversationId) {
      // Mark conversation as read
      const { conversations } = get();
      set({
        conversations: conversations.map((c) =>
          c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
        ),
      });
    }
  },

  openStudentChat: (sessionId, sessionTitle) => {
    set({
      isStudentChatOpen: true,
      studentChatSessionContext: sessionId ? { sessionId, sessionTitle: sessionTitle || '' } : null,
    });
  },

  closeStudentChat: () => set({ isStudentChatOpen: false, studentChatSessionContext: null }),

  sendChatMessage: (conversationId, content, senderRole = 'INSTRUCTOR', channel = 'IN_APP') => {
    const { messages, conversations, currentUser, studio } = get();
    const existing = messages[conversationId] || [];
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      conversationId,
      senderRole,
      senderName: senderRole === 'INSTRUCTOR' ? (studio.coachName || studio.name || '工作室教練') : currentUser.name,
      senderAvatar: senderRole === 'INSTRUCTOR' ? undefined : currentUser.avatarUrl,
      content,
      channel,
      createdAt: new Date().toISOString(),
      isRead: senderRole === 'INSTRUCTOR',
    };

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: content,
          lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unreadCount: senderRole === 'STUDENT' ? conv.unreadCount + 1 : 0,
        };
      }
      return conv;
    });

    const targetConv = conversations.find((c) => c.id === conversationId);

    set({
      messages: {
        ...messages,
        [conversationId]: [...existing, newMsg],
      },
      conversations: updatedConversations,
    });

    // If instructor replies to a LINE_OA conversation or with LINE_OA channel, push to LINE
    if (
      senderRole === 'INSTRUCTOR' &&
      (channel === 'LINE_OA' || targetConv?.channel === 'LINE_OA') &&
      studio.communication?.lineOaEnabled &&
      studio.communication?.lineAccessToken &&
      typeof window !== 'undefined'
    ) {
      fetch('/api/line-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: studio.communication.lineAccessToken,
          sessionTitle: targetConv?.sessionTitle || studio.name,
          message: content,
          toUserId: targetConv?.lineUserId,
        }),
      }).catch(() => {});
    }

    get().syncToCloud();
  },

  sendStudentInquiry: (content, sessionId, sessionTitle) => {
    const { currentUser, studio, conversations } = get();
    let conv = conversations.find(
      (c) => c.studentEmail === currentUser.email && (!sessionId || c.sessionId === sessionId)
    );

    const convId = conv ? conv.id : `conv-${currentUser.id}-${Date.now()}`;

    if (!conv) {
      const newConv: Conversation = {
        id: convId,
        studioId: studio.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        studentPhone: '+886 912-345-678',
        studentAvatar: currentUser.avatarUrl,
        sessionId: sessionId || 'sess-01',
        sessionTitle: sessionTitle || 'General Inquiry',
        sessionTime: '08:00 - 08:50',
        lastMessage: content,
        lastMessageTime: '剛剛',
        unreadCount: 1,
        channel: 'IN_APP',
      };
      set({ conversations: [newConv, ...conversations] });
    }

    get().sendChatMessage(convId, content, 'STUDENT', 'IN_APP');
    return convId;
  },

  broadcastToRoster: (sessionId, message, channels) => {
    const { sessions, studio, broadcastHistory, bookings, conversations, messages } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const newBroadcast: RosterBroadcast = {
      id: `bc-${Date.now()}`,
      studioId: studio.id,
      sessionId,
      sessionTitle: session.title,
      instructorName: session.instructor,
      message,
      channels,
      recipientCount: session.bookedCount,
      sentAt: new Date().toISOString(),
    };

    // Inject message into conversation of each booked student
    const sessionBookings = bookings.filter((b) => b.sessionId === sessionId && b.status !== 'CANCELLED');
    const updatedMessages = { ...messages };
    let updatedConversations = [...conversations];

    sessionBookings.forEach((bk) => {
      let conv = updatedConversations.find(
        (c) => c.studentEmail === bk.clientEmail || c.studentName === bk.clientName
      );
      const convId = conv ? conv.id : `conv-${bk.id}`;
      if (!conv) {
        conv = {
          id: convId,
          studioId: studio.id,
          studentId: bk.clientEmail,
          studentName: bk.clientName,
          studentEmail: bk.clientEmail,
          studentPhone: bk.clientPhone,
          sessionId: session.id,
          sessionTitle: session.title,
          lastMessage: `📢【課堂公告】${message}`,
          lastMessageTime: '剛剛',
          unreadCount: 0,
          channel: channels.includes('LINE_OA') ? 'LINE_OA' : 'IN_APP',
        };
        updatedConversations.unshift(conv);
      }

      const existingMsgs = updatedMessages[convId] || [];
      updatedMessages[convId] = [
        ...existingMsgs,
        {
          id: `msg-bc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          conversationId: convId,
          senderRole: 'SYSTEM',
          senderName: `${session.instructor} (課堂廣播)`,
          content: `📢【${session.title} 課堂公告】\n${message}`,
          channel: channels.includes('LINE_OA') ? 'LINE_OA' : 'IN_APP',
          createdAt: new Date().toISOString(),
          isRead: true,
        },
      ];
    });

    set({
      broadcastHistory: [newBroadcast, ...broadcastHistory],
      messages: updatedMessages,
      conversations: updatedConversations,
    });

    // If LINE_OA channel is enabled, dispatch real broadcast via serverless endpoint
    if (channels.includes('LINE_OA') && typeof window !== 'undefined') {
      fetch('/api/line-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: studio.communication?.lineAccessToken,
          sessionTitle: session.title,
          message,
        }),
      }).catch(() => {});
    }

    get().syncToCloud();
  },

  updateStudioCommunication: (settings) => {
    const { studio, studios } = get();
    const current = studio.communication || DEFAULT_COMMUNICATION;
    const updated = { ...current, ...settings };
    const updatedStudio = { ...studio, communication: updated };
    set({
      studio: updatedStudio,
      studios: studios.map((s) => (s.id === studio.id ? updatedStudio : s)),
    });
    get().syncToCloud();
  },

  updateStudioPayments: (config) => {
    const { studio, studios } = get();
    const current = studio.paymentMethods || DEFAULT_PAYMENTS;
    const updated = {
      ...current,
      ...config,
      stripe: { ...current.stripe, ...(config.stripe || {}) },
      linePay: { ...current.linePay, ...(config.linePay || {}) },
      jkoPay: { ...current.jkoPay, ...(config.jkoPay || {}) },
      bankTransfer: { ...current.bankTransfer, ...(config.bankTransfer || {}) },
    };
    const updatedStudio = { ...studio, paymentMethods: updated };
    set({
      studio: updatedStudio,
      studios: studios.map((s) => (s.id === studio.id ? updatedStudio : s)),
    });
    get().syncToCloud();
  },

  updateWeeklyTip: (tipUpdates) => {
    const { studio, studios } = get();
    const currentTip = studio.weeklyTip || DEFAULT_WEEKLY_TIP;
    const updatedTip: CoachWeeklyTip = {
      ...currentTip,
      ...tipUpdates,
      pinnedAt: new Date().toISOString(),
    };
    const updatedStudio: Studio = { ...studio, weeklyTip: updatedTip };
    set({
      studio: updatedStudio,
      studios: studios.map((s) => (s.id === studio.id ? updatedStudio : s)),
    });
    get().syncToCloud();
  },

  updateRetentionCareConfig: (configUpdates) => {
    const { studio, studios } = get();
    const currentCare = studio.retentionCare || DEFAULT_RETENTION_CARE_CONFIG;
    const updatedCare: RetentionCareConfig = {
      ...currentCare,
      ...configUpdates,
    };
    const updatedStudio: Studio = { ...studio, retentionCare: updatedCare };
    set({
      studio: updatedStudio,
      studios: studios.map((s) => (s.id === studio.id ? updatedStudio : s)),
    });
    get().syncToCloud();
  },

  dispatchRetentionCareMessage: (studentName, studentEmail, message) => {
    const { conversations, messages, studio } = get();
    let conv = conversations.find(
      (c) =>
        c.studentEmail.toLowerCase() === studentEmail.toLowerCase() ||
        c.studentName === studentName
    );
    const convId = conv ? conv.id : `conv-care-${Date.now()}`;
    const updatedConversations = [...conversations];

    if (!conv) {
      conv = {
        id: convId,
        studioId: studio.id,
        studentId: studentEmail,
        studentName,
        studentEmail,
        sessionTitle: '智能關懷與里程碑通知',
        sessionTime: 'Automated Care',
        lastMessage: message,
        lastMessageTime: '剛剛',
        unreadCount: 0,
        channel: studio.communication?.lineOaEnabled ? 'LINE_OA' : 'IN_APP',
      };
      updatedConversations.unshift(conv);
    } else {
      const idx = updatedConversations.findIndex((c) => c.id === convId);
      if (idx !== -1) {
        updatedConversations[idx] = {
          ...updatedConversations[idx],
          lastMessage: message,
          lastMessageTime: '剛剛',
        };
      }
    }

    const existingMsgs = messages[convId] || [];
    const newMsg: ChatMessage = {
      id: `msg-care-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      conversationId: convId,
      senderRole: 'INSTRUCTOR',
      senderName: studio.coachName || '工作室教練',
      content: message,
      channel: studio.communication?.lineOaEnabled ? 'LINE_OA' : 'IN_APP',
      createdAt: new Date().toISOString(),
      isRead: true,
    };

    set({
      conversations: updatedConversations,
      messages: {
        ...messages,
        [convId]: [...existingMsgs, newMsg],
      },
    });
    get().syncToCloud();
  },

  addBodyJournalEntry: (entryData) => {
    const { bodyJournalEntries, currentUser, studio } = get();
    const newEntry: BodyJournalEntry = {
      ...entryData,
      id: `bj-${Date.now()}`,
      userId: currentUser.id,
      studioId: studio.id,
      createdAt: new Date().toISOString(),
    };
    set({ bodyJournalEntries: [newEntry, ...bodyJournalEntries] });
    get().syncToCloud();
  },

  notifyLastMinuteVacancy: (sessionId, targetAudience, message) => {
    const { sessions, waitlist, vacancyAlerts, studio } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const spotsAvailable = Math.max(1, session.capacity - session.bookedCount);
    const waitlistCount = waitlist.filter((w) => w.sessionId === sessionId).length;
    const notifiedCount =
      targetAudience === 'WAITLIST_ONLY'
        ? Math.max(2, waitlistCount)
        : targetAudience === 'FAVORITES_ONLY'
        ? 6
        : Math.max(2, waitlistCount) + 6;

    const newAlert: VacancyAlertLog = {
      id: `vac-${Date.now()}`,
      sessionId,
      sessionTitle: session.title,
      spotsAvailable,
      notifiedCount,
      targetAudience,
      message,
      sentAt: new Date().toISOString(),
    };

    set({
      vacancyAlerts: [newAlert, ...vacancyAlerts],
    });

    // Also broadcast to roster/conversations so students see the non-spam vacancy alert in Inbox
    get().broadcastToRoster(
      sessionId,
      `⚡【即時空缺釋出 • 剩餘 ${spotsAvailable} 席】${message}`,
      studio.communication?.lineOaEnabled ? ['IN_APP', 'LINE_OA'] : ['IN_APP']
    );
  },

  openBookingDrawer: (session) => set({ selectedSessionForBooking: session, isBookingDrawerOpen: true }),
  closeBookingDrawer: () => set({ isBookingDrawerOpen: false, selectedSessionForBooking: null }),
  openWaitlistModal: (session) => set({ selectedWaitlistSession: session, isWaitlistModalOpen: true }),
  closeWaitlistModal: () => set({ isWaitlistModalOpen: false, selectedWaitlistSession: null }),

  confirmBooking: (sessionId, method, clientName, clientEmail, remittanceLast5) => {
    const { sessions, userPass, creditLedger, bookings, stripeOverview, studio, currentUser, currency } = get();
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) return { success: false, message: 'Class session not found.' };
    if (session.bookedCount >= session.capacity) {
      return { success: false, message: 'Class is full. Please join the waitlist.' };
    }

    const sessionTimeStr = `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`;
    const targetEmail = clientEmail || currentUser.email;
    const targetName = clientName || currentUser.name;

    // Helper to mark invited student as BOOKED on private sessions
    const updateSessionAfterBooking = (s: ClassSession): ClassSession => {
      if (s.id !== sessionId) return s;
      let updatedInvites = s.invitedStudents;
      if (s.visibility === 'PRIVATE') {
        const list = s.invitedStudents ? [...s.invitedStudents] : [];
        const matchIdx = list.findIndex(
          (inv) =>
            inv.status === 'AWAITING' &&
            (inv.email.toLowerCase() === targetEmail.toLowerCase() ||
              inv.name.toLowerCase() === targetName.toLowerCase())
        );
        if (matchIdx !== -1) {
          list[matchIdx] = {
            ...list[matchIdx],
            status: 'BOOKED',
            bookedAt: new Date().toISOString(),
          };
        } else {
          const firstAwaitingIdx = list.findIndex((inv) => inv.status === 'AWAITING');
          if (firstAwaitingIdx !== -1) {
            list[firstAwaitingIdx] = {
              ...list[firstAwaitingIdx],
              name: targetName || list[firstAwaitingIdx].name,
              email: targetEmail || list[firstAwaitingIdx].email,
              status: 'BOOKED',
              bookedAt: new Date().toISOString(),
            };
          } else {
            list.push({
              id: `inv-${Date.now()}`,
              name: targetName,
              email: targetEmail,
              status: 'BOOKED',
              bookedAt: new Date().toISOString(),
            });
          }
        }
        updatedInvites = list;
      }
      return {
        ...s,
        bookedCount: s.bookedCount + 1,
        invitedStudents: updatedInvites,
      };
    };

    if (typeof window !== 'undefined' && targetEmail) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          clientName: targetName,
          studioName: studio.name,
          sessionTitle: session.title,
          sessionTime: sessionTimeStr,
          instructor: session.instructor,
          roomName: session.roomName,
          paymentMethod: method,
          amountPaid: method === 'PASS_CREDIT' ? '1 Pass Credit' : `${currency} ${session.price}`,
          resendApiKey: studio.communication?.resendApiKey,
          type: 'BOOKING_CONFIRMATION',
        }),
      }).catch(() => {});
    }

    if (method === 'PASS_CREDIT') {
      if (userPass.creditsLeft <= 0) {
        return { success: false, message: 'Insufficient class pass credits.' };
      }

      const updatedCredits = userPass.creditsLeft - 1;
      const newLedgerEntry: CreditLedgerEntry = {
        id: `led-${Date.now()}`,
        userId: currentUser.id,
        studioId: studio.id,
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
        studioId: studio.id,
        sessionId,
        sessionTitle: session.title,
        sessionTime: sessionTimeStr,
        clientEmail: targetEmail,
        clientName: targetName,
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
        sessions: sessions.map(updateSessionAfterBooking),
      });

      get().syncToCloud();
      return { success: true, message: 'Pass credit redeemed successfully!' };
    }

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      studioId: studio.id,
      sessionId,
      sessionTitle: session.title,
      sessionTime: sessionTimeStr,
      clientEmail: targetEmail,
      clientName: targetName,
      paymentMethod: method,
      stripePaymentId: `ch_${Date.now()}_live`,
      remittanceLast5: remittanceLast5 || undefined,
      amountPaid: session.price,
      creditsDeducted: 0,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    set({
      bookings: [newBooking, ...bookings],
      sessions: sessions.map(updateSessionAfterBooking),
      stripeOverview: {
        ...stripeOverview,
        grossVolume: stripeOverview.grossVolume + session.price,
        pendingPayouts: stripeOverview.pendingPayouts + session.price,
      },
    });

    get().syncToCloud();
    return { success: true, message: 'Direct payment confirmed!' };
  },

  cancelBooking: (bookingId) => {
    const { bookings, sessions, userPass, creditLedger, triggerWaterfallCascade, studio } = get();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    let updatedPass = userPass;
    let newLedger = creditLedger;

    if (booking.creditsDeducted > 0) {
      const newBalance = userPass.creditsLeft + booking.creditsDeducted;
      updatedPass = { ...userPass, creditsLeft: newBalance };
      newLedger = [
        {
          id: `led-ref-${Date.now()}`,
          userId: userPass.userId,
          studioId: studio.id,
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

    triggerWaterfallCascade(booking.sessionId);
    get().syncToCloud();
  },

  checkInClient: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, status: 'CHECKED_IN' } : b)),
    }));
    get().syncToCloud();
  },

  joinWaitlist: (sessionId, clientName, clientEmail, clientPhone, mode) => {
    const { waitlist, sessions, studio } = get();
    const session = sessions.find((s) => s.id === sessionId);
    const existingCount = waitlist.filter((w) => w.sessionId === sessionId).length;

    const newEntry: WaitlistEntry = {
      id: `wl-${Date.now()}`,
      studioId: studio.id,
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
    get().syncToCloud();
  },

  triggerWaterfallCascade: (sessionId) => {
    const { waitlist, sessions, bookings, stripeOverview, studio } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const candidates = waitlist
      .filter((w) => w.sessionId === sessionId && (w.status === 'WAITING' || w.status === 'OFFERED'))
      .sort((a, b) => a.priorityOrder - b.priorityOrder);

    if (candidates.length === 0) return;

    const topCandidate = candidates[0];

    if (topCandidate.mode === 'VIP_PREAUTH') {
      const newBooking: Booking = {
        id: `bk-vip-${Date.now()}`,
        studioId: studio.id,
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

    const offerExpiresAt = new Date(Date.now() + studio.waitlistMins * 60 * 1000).toISOString();
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
      activeWaterfallSecondsRemaining: studio.waitlistMins * 60,
    });
  },

  claimWaitlistOffer: (entryId) => {
    const { waitlist, sessions, bookings, studio } = get();
    const entry = waitlist.find((w) => w.id === entryId);
    if (!entry) return;

    const session = sessions.find((s) => s.id === entry.sessionId);
    if (!session) return;

    const newBooking: Booking = {
      id: `bk-claimed-${Date.now()}`,
      studioId: studio.id,
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

    triggerWaterfallCascade(entry.sessionId);
  },

  tickWaterfallTimer: () => {
    const { activeWaterfallSecondsRemaining, activeWaterfallSessionId, waitlist, triggerWaterfallCascade, studio } = get();
    if (!activeWaterfallSessionId) return;

    if (activeWaterfallSecondsRemaining <= 1) {
      const offeredEntry = waitlist.find((w) => w.sessionId === activeWaterfallSessionId && w.status === 'OFFERED');
      if (offeredEntry) {
        set({
          waitlist: waitlist.map((w) => (w.id === offeredEntry.id ? { ...w, status: 'EXPIRED' } : w)),
          activeWaterfallSecondsRemaining: studio.waitlistMins * 60,
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
    get().syncToCloud();
  },

  addSession: (sessionData) => {
    const isPrivate = sessionData.visibility === 'PRIVATE';
    const generatedToken =
      sessionData.inviteToken ||
      (isPrivate
        ? `vip-${Math.random().toString(36).substring(2, 7)}-${Date.now().toString(36).slice(-4)}`
        : undefined);
    const newSession: ClassSession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      studioId: get().studio.id,
      bookedCount: 0,
      visibility: sessionData.visibility || 'PUBLIC',
      inviteToken: generatedToken,
    };
    set((state) => ({ sessions: [...state.sessions, newSession] }));
    get().syncToCloud();
  },

  updateStudioLogo: (logoUrl: string) => {
    set((state) => ({
      studio: { ...state.studio, logoUrl },
      studios: state.studios.map((s) => (s.id === state.studio.id ? { ...s, logoUrl } : s)),
    }));
    get().syncToCloud();
  },

  editSession: (sessionId, updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)),
      selectedSessionForBooking:
        state.selectedSessionForBooking?.id === sessionId
          ? { ...state.selectedSessionForBooking, ...updates }
          : state.selectedSessionForBooking,
    }));
    get().syncToCloud();
  },

  rescheduleSession: (sessionId, newStartTime, newEndTime, notifyStudents = true) => {
    const { sessions, broadcastToRoster, locale } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const originalStartTime = session.startTime;
    const isZh = locale === 'zh-TW' || locale === 'zh-CN';

    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              originalStartTime: s.originalStartTime || originalStartTime,
              startTime: newStartTime,
              endTime: newEndTime,
              status: 'RESCHEDULED',
              rescheduledAt: new Date().toISOString(),
            }
          : s
      ),
    }));

    if (notifyStudents) {
      const timeStr = `${newStartTime.substring(11, 16)} - ${newEndTime.substring(11, 16)}`;
      const dateStr = newStartTime.substring(0, 10);
      const msg = isZh
        ? `【重要改期通知】您預約/收藏的課程「${session.title}」時間已調整為 ${dateStr} ${timeStr}。若時間不便，您可於截止前隨時免費取消並退回點數。`
        : `[Important Reschedule Alert] The session "${session.title}" has been rescheduled to ${dateStr} ${timeStr}. If this does not suit your schedule, you may cancel for a full refund before the cutoff.`;
      broadcastToRoster(sessionId, msg, ['IN_APP', 'LINE_OA']);
    }

    get().syncToCloud();
  },

  cancelSession: (sessionId, reason) => {
    const { sessions, bookings, broadcastToRoster, locale, userPass } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const isZh = locale === 'zh-TW' || locale === 'zh-CN';
    const cancelReasonText =
      reason?.trim() || (isZh ? '教練行程異動 / 場地保養' : 'Instructor schedule adjustment');

    // Refund credits to all booked students
    let totalCreditsRefunded = 0;
    const newLedgerEntries: CreditLedgerEntry[] = [];

    const updatedBookings = bookings.map((b) => {
      if (b.sessionId === sessionId && b.status !== 'CANCELLED') {
        if (b.creditsDeducted > 0) {
          totalCreditsRefunded += b.creditsDeducted;
          newLedgerEntries.push({
            id: `led-refund-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            userId: b.clientEmail || 'usr-maya-student',
            studioId: session.studioId,
            passId: userPass.id,
            type: 'CANCELLATION_REFUND',
            delta: b.creditsDeducted,
            balanceAfter: userPass.creditsLeft + totalCreditsRefunded,
            referenceId: session.id,
            note: `Refund for cancelled session: ${session.title}`,
            createdAt: new Date().toISOString(),
          });
        }
        return { ...b, status: 'CANCELLED' as const };
      }
      return b;
    });

    const updatedPass =
      totalCreditsRefunded > 0
        ? { ...userPass, creditsLeft: userPass.creditsLeft + totalCreditsRefunded }
        : userPass;

    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'CANCELLED',
              cancellationReason: cancelReasonText,
              cancelledAt: new Date().toISOString(),
            }
          : s
      ),
      bookings: updatedBookings,
      userPass: updatedPass,
      creditLedger: [...newLedgerEntries, ...state.creditLedger],
    }));

    // Alert attendees
    const alertMsg = isZh
      ? `【課程取消通知】非常抱歉通知您，原定於 ${session.startTime.substring(0, 10)} 的「${session.title}」因「${cancelReasonText}」已取消。系統已自動將您的課包堂數/點數全額退回至您的帳戶！`
      : `[Class Cancellation Alert] We regret to inform you that "${session.title}" on ${session.startTime.substring(0, 10)} was cancelled due to "${cancelReasonText}". Your class pass/credits have been automatically refunded in full!`;
    broadcastToRoster(sessionId, alertMsg, ['IN_APP', 'LINE_OA']);

    get().syncToCloud();
  },

  updateSessionCapacity: (sessionId, newCapacity) => {
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, capacity: newCapacity } : s)),
    }));
    get().syncToCloud();
  },

  updateSessionNotes: (sessionId, preClassNote, postClassHomework) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              preClassNote: preClassNote.trim(),
              postClassHomework: postClassHomework.trim(),
            }
          : s
      ),
      selectedSessionForBooking:
        state.selectedSessionForBooking?.id === sessionId
          ? {
              ...state.selectedSessionForBooking,
              preClassNote: preClassNote.trim(),
              postClassHomework: postClassHomework.trim(),
            }
          : state.selectedSessionForBooking,
    }));
    get().syncToCloud();
  },

  markSessionHomeworkDone: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, homeworkCompleted: true } : s
      ),
      selectedSessionForBooking:
        state.selectedSessionForBooking?.id === sessionId
          ? { ...state.selectedSessionForBooking, homeworkCompleted: true }
          : state.selectedSessionForBooking,
    }));
    get().syncToCloud();
  },

  deleteSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
    }));
    get().syncToCloud();
  },

  purchaseClassPack: (packId) => {
    const { classPacks, userPass, creditLedger, stripeOverview, studio } = get();
    const pack = classPacks.find((p) => p.id === packId);
    if (!pack) return;

    const newBalance = userPass.creditsLeft + pack.credits;
    const newLedgerEntry: CreditLedgerEntry = {
      id: `led-buy-${Date.now()}`,
      userId: userPass.userId,
      studioId: studio.id,
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
    get().syncToCloud();
  },

  addClassPack: (packData) => {
    const { classPacks, studio } = get();
    const newPack: ClassPack = {
      ...packData,
      id: `pack-${Date.now()}`,
      studioId: studio.id,
    };
    set({ classPacks: [...classPacks, newPack] });
    get().syncToCloud();
  },

  updateClassPack: (id, updates) => {
    const { classPacks } = get();
    set({
      classPacks: classPacks.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
    get().syncToCloud();
  },

  deleteClassPack: (id) => {
    const { classPacks } = get();
    set({
      classPacks: classPacks.filter((p) => p.id !== id),
    });
    get().syncToCloud();
  },

  createStudioWithOnboarding: (data) => {
    const newStudioId = `studio-${Date.now()}`;
    const newStudio: Studio = {
      id: newStudioId,
      ownerId: get().currentUser.id,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: data.name,
      coachName: data.firstClass.instructor,
      tagline: data.tagline || '',
      currency: data.currency,
      stripeAccountId: `acct_${Date.now()}`,
      stripeAccountName: `${data.name} Payouts`,
      cancelWindowHrs: data.cancelWindowHrs,
      waitlistMins: data.waitlistMins,
      roomsCount: 1,
      monthlySubscriptionPrice: 29.0,
      platformTakeRate: 0.0,
      logoMark: '✨',
      logoUrl: data.logoUrl,
      createdAt: new Date().toISOString(),
      announcementBanner: '',
      discoverable: true,
      city: '',
      isPro: false,
      isLive: false,
      communication: DEFAULT_COMMUNICATION,
      paymentMethods: DEFAULT_PAYMENTS,
    };

    const isPrivate = data.firstClass.visibility === 'PRIVATE';
    const generatedToken = isPrivate
      ? `vip-${Math.random().toString(36).substring(2, 7)}-${Date.now().toString(36).slice(-4)}`
      : undefined;
    const todayDateStr = new Date().toISOString().split('T')[0];

    const firstClassSession: ClassSession = {
      id: `sess-${Date.now()}`,
      studioId: newStudioId,
      title: data.firstClass.title,
      category: data.firstClass.category,
      instructor: data.firstClass.instructor,
      instructorAvatar: data.logoUrl || '',
      startTime: `${todayDateStr}T09:00:00.000Z`,
      endTime: `${todayDateStr}T09:50:00.000Z`,
      durationMins: 50,
      capacity: data.firstClass.capacity,
      bookedCount: 0,
      price: data.firstClass.price,
      roomName: data.firstClass.roomName || '',
      level: 'All Levels',
      visibility: data.firstClass.visibility || 'PUBLIC',
      privatePreset: data.firstClass.privatePreset,
      pinCode: data.firstClass.pinCode,
      inviteToken: generatedToken,
      invitedStudents: data.firstClass.invitedStudents,
      locationType: data.firstClass.locationType || 'STUDIO',
      address: data.firstClass.address,
      preClassNote: data.firstClass.preClassNote,
      postClassHomework: data.firstClass.postClassHomework,
      status: 'ACTIVE',
    };

    set((state) => ({
      studios: [...state.studios.filter((s) => s.id !== newStudioId), newStudio],
      studio: newStudio,
      activeStudioId: newStudioId,
      currency: data.currency,
      sessions: [firstClassSession, ...state.sessions.filter((s) => s.studioId !== newStudioId)],
      bookings: state.bookings.filter((b) => b.studioId !== newStudioId),
      stripeOverview: createFreshStripeOverview(newStudio.name, data.currency),
      currentRoute: { path: 'admin' },
      activePersona: 'elena_owner',
    }));

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
    }
    get().syncToCloud();
  },
}),
    {
      name: 'aura-flow-scratch-v3',
      partialize: (state) => ({
        locale: state.locale,
        currency: state.currency,
        studios: state.studios,
        studio: state.studio,
        activeStudioId: state.activeStudioId,
        sessions: state.sessions,
        classPacks: state.classPacks,
        userPass: state.userPass,
        bookings: state.bookings,
        waitlist: state.waitlist,
        creditLedger: state.creditLedger,
        stripeOverview: state.stripeOverview,
        conversations: state.conversations,
        messages: state.messages,
        broadcastHistory: state.broadcastHistory,
        boundStudioSlug: state.boundStudioSlug,
        favoriteStudioSlugs: state.favoriteStudioSlugs,
      }),
    }
  )
);

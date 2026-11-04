import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
} from '../types/aura';

function parseInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return { path: 'public_studio', slug: 'sol-sanctuary' };
  const pathname = window.location.pathname;
  if (pathname === '/admin' || pathname.startsWith('/admin')) {
    return { path: 'admin' };
  }
  if (pathname === '/onboarding' || pathname.startsWith('/onboarding')) {
    return { path: 'onboarding' };
  }
  if (pathname.startsWith('/s/')) {
    const slug = pathname.replace('/s/', '').split('/')[0] || 'sol-sanctuary';
    return { path: 'public_studio', slug };
  }
  return { path: 'public_studio', slug: 'sol-sanctuary' };
}

// 1. Instructor Owner ("Elena Rostova", elena@example.com)
const PERSONA_ELENA: DatabaseUser = {
  id: 'usr-elena-owner',
  email: 'elena@example.com',
  role: 'OWNER',
  name: 'Elena Rostova',
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  studioId: 'studio-sol-01',
  createdAt: '2026-11-01T00:00:00.000Z',
};

// 2. Existing Student ("Maya Lin", maya@example.com with 2 credits remaining)
const PERSONA_MAYA: DatabaseUser = {
  id: 'usr-maya-student',
  email: 'maya@example.com',
  role: 'STUDENT',
  name: 'Maya Lin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-11-01T00:00:00.000Z',
};

// 3. New Student (0 Passes)
const PERSONA_NEW_STUDENT: DatabaseUser = {
  id: 'usr-new-student',
  email: 'alex.guest@example.com',
  role: 'STUDENT',
  name: 'Alex Rivera (New Student)',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-11-02T00:00:00.000Z',
};

// 4. New Studio Owner (Starting onboarding)
const PERSONA_NEW_OWNER: DatabaseUser = {
  id: 'usr-new-owner',
  email: 'founder@example.com',
  role: 'OWNER',
  name: 'Chloe Laurent (New Owner)',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-11-02T00:00:00.000Z',
};

const DEFAULT_COMMUNICATION: StudioCommunicationSettings = {
  lineOaEnabled: true,
  lineChannelId: '@sol_sanctuary_tw',
  lineChannelSecret: 'sec_884920a9fbc10293847',
  lineAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.solsanctuary_token_sample',
  instagramHandle: '@solsanctuary.movement',
  supportEmail: 'hello@solsanctuary.studio',
};

const DEFAULT_PAYMENTS: StudioPaymentConfig = {
  stripe: {
    enabled: true,
    connected: true,
    accountName: 'Sol Sanctuary Direct Payouts (acct_sol_sanctuary_8829)',
    supportedCards: ['Visa', 'Mastercard', 'JCB', 'Apple Pay', 'Google Pay'],
  },
  linePay: {
    enabled: true,
    channelId: 'linepay_merchant_99281',
    channelSecret: 'sec_linepay_7721839',
    qrCodeUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80',
  },
  jkoPay: {
    enabled: true,
    merchantId: 'JKO_STORE_883019',
    qrCodeUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80',
  },
  bankTransfer: {
    enabled: true,
    bankName: '國泰世華商業銀行 (Cathay United Bank)',
    bankCode: '013',
    accountNumber: '013-50-6189201',
    accountName: '日光彼拉提斯工作室 (Elena Rostova)',
  },
};

// 1 Studio ("Sol Sanctuary", slug: "sol-sanctuary")
const INITIAL_STUDIOS: Studio[] = [
  {
    id: 'studio-sol-01',
    ownerId: 'usr-elena-owner',
    slug: 'sol-sanctuary',
    name: 'Sol Sanctuary',
    tagline: 'Mindful Reformer & Dynamic Movement Sanctuary',
    currency: 'USD',
    stripeAccountId: 'acct_sol_sanctuary_8829',
    stripeAccountName: 'Sol Sanctuary Loon',
    cancelWindowHrs: 12,
    waitlistMins: 30,
    roomsCount: 2,
    monthlySubscriptionPrice: 29.0,
    platformTakeRate: 0.0,
    logoMark: '🌿',
    createdAt: '2026-11-01T00:00:00.000Z',
    communication: DEFAULT_COMMUNICATION,
    paymentMethods: DEFAULT_PAYMENTS,
  },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-maya-01',
    studioId: 'studio-sol-01',
    studentId: 'usr-maya-student',
    studentName: 'Maya Lin',
    studentEmail: 'maya@example.com',
    studentPhone: '+886 912-345-678',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    sessionId: 'sess-01',
    sessionTitle: 'Dynamic Pilates',
    sessionTime: '08:00 - 08:50',
    lastMessage: 'Maya 您好！這堂課適合所有程度學員，請自備水壺並穿著防滑襪，教室有提供更衣間與置物櫃。',
    lastMessageTime: '10:42 AM',
    unreadCount: 0,
    channel: 'IN_APP',
  },
  {
    id: 'conv-lucas-02',
    studioId: 'studio-sol-01',
    studentId: 'usr-lucas-student',
    studentName: 'Lucas Chen (陳立安)',
    studentEmail: 'lucas.chen@example.com',
    studentPhone: '+886 928-888-123',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    sessionId: 'sess-02',
    sessionTitle: 'Athletic Reformer Burn',
    sessionTime: '09:30 - 10:20',
    lastMessage: '教練您好，已綁定 LINE 官方帳號，請問週六這場還有名額可以候補嗎？',
    lastMessageTime: '09:15 AM',
    unreadCount: 1,
    channel: 'LINE_OA',
  },
  {
    id: 'conv-sophia-03',
    studioId: 'studio-sol-01',
    studentId: 'usr-sophia-student',
    studentName: 'Sophia Wang',
    studentEmail: 'sophia.w@example.com',
    studentPhone: '+886 933-777-999',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    sessionId: 'sess-05',
    sessionTitle: 'Evening Sound Bath',
    sessionTime: '18:00 - 19:00',
    lastMessage: '請問音療頌缽課程需要自備瑜珈墊嗎？還是教室有專屬厚墊呢？',
    lastMessageTime: '昨天',
    unreadCount: 0,
    channel: 'IN_APP',
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-maya-01': [
    {
      id: 'msg-m1',
      conversationId: 'conv-maya-01',
      senderRole: 'STUDENT',
      senderName: 'Maya Lin',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      content: 'Elena 教練您好！我剛預約了週三的 Dynamic Pilates，請問需要準備特別的裝備嗎？初學者跟得上嗎？',
      channel: 'IN_APP',
      createdAt: '2026-11-03T02:30:00.000Z',
      isRead: true,
    },
    {
      id: 'msg-m2',
      conversationId: 'conv-maya-01',
      senderRole: 'INSTRUCTOR',
      senderName: 'Elena Rostova',
      content: 'Maya 您好！這堂課適合所有程度學員，動作會由淺入深給予不同進階選項。請自備水壺並穿著防滑五趾襪，教室有提供更衣間與密碼置物櫃。期待課堂見！🌿',
      channel: 'IN_APP',
      createdAt: '2026-11-03T02:42:00.000Z',
      isRead: true,
    },
  ],
  'conv-lucas-02': [
    {
      id: 'msg-l1',
      conversationId: 'conv-lucas-02',
      senderRole: 'STUDENT',
      senderName: 'Lucas Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      content: '教練您好，已綁定 LINE 官方帳號，請問週六這場還有名額可以候補嗎？',
      channel: 'LINE_OA',
      createdAt: '2026-11-03T01:15:00.000Z',
      isRead: false,
    },
  ],
  'conv-sophia-03': [
    {
      id: 'msg-s1',
      conversationId: 'conv-sophia-03',
      senderRole: 'STUDENT',
      senderName: 'Sophia Wang',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      content: '請問音療頌缽課程需要自備瑜珈墊嗎？還是教室有專屬厚墊呢？',
      channel: 'IN_APP',
      createdAt: '2026-11-02T10:00:00.000Z',
      isRead: true,
    },
    {
      id: 'msg-s2',
      conversationId: 'conv-sophia-03',
      senderRole: 'INSTRUCTOR',
      senderName: 'Elena Rostova',
      content: 'Sophia 晚安！教室會為大家準備高磅數羊毛瑜珈墊與眼枕，您只要穿著舒適保暖衣物前來即可放鬆享受療癒時光。',
      channel: 'IN_APP',
      createdAt: '2026-11-02T10:15:00.000Z',
      isRead: true,
    },
  ],
};

const INITIAL_BROADCASTS: RosterBroadcast[] = [
  {
    id: 'bc-1',
    studioId: 'studio-sol-01',
    sessionId: 'sess-01',
    sessionTitle: 'Dynamic Pilates',
    instructorName: 'Elena Rostova',
    message: '【課前提醒】今日器械皮拉提請著防滑底五趾襪，教室備有置物櫃，建議提早 10 分鐘到場更衣暖身。',
    channels: ['IN_APP', 'LINE_OA'],
    recipientCount: 6,
    sentAt: '2026-11-02T07:00:00.000Z',
  },
];

// 5 Initial classes on the schedule with realistic spot capacities
const INITIAL_SESSIONS: ClassSession[] = [
  {
    id: 'sess-01',
    studioId: 'studio-sol-01',
    title: 'Dynamic Pilates',
    category: 'Reformer',
    instructor: 'Elena Rostova',
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
    studioId: 'studio-sol-01',
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
    studioId: 'studio-sol-01',
    title: 'Gentle Yin Yoga',
    category: 'Yin Yoga',
    instructor: 'Chloe M.',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-02T10:30:00.000Z',
    endTime: '2026-11-02T11:30:00.000Z',
    durationMins: 60,
    capacity: 8,
    bookedCount: 8, // Class Full • Waitlist Open
    price: 28.0,
    roomName: 'Warm Cedar Room',
    level: 'Beginner',
  },
  {
    id: 'sess-04',
    studioId: 'studio-sol-01',
    title: 'Morning Reformer Sculpt',
    category: 'Reformer',
    instructor: 'Elena Rostova',
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
    studioId: 'studio-sol-01',
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
    studioId: 'studio-sol-01',
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
    studioId: 'studio-sol-01',
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
    studioId: 'studio-sol-01',
    name: 'Single Drop-In Pass',
    credits: 1,
    price: 28.0,
    expiryDays: 30,
    popularBadge: false,
    description: 'Flexible drop-in pass with no long-term commitment.',
  },
];

// Maya Lin's active 5-pack pass with 2 credits remaining
const INITIAL_MAYA_PASS: ClientPass = {
  id: 'pass-maya-01',
  userId: 'usr-maya-student',
  studioId: 'studio-sol-01',
  packId: 'pack-5',
  packName: '5-Class Pack',
  creditsTotal: 5,
  creditsLeft: 2, // Exactly 2 credits left
  expiresAt: '2026-12-31T23:59:59.000Z',
  createdAt: '2026-10-15T10:00:00.000Z',
};

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-01',
    studioId: 'studio-sol-01',
    sessionId: 'sess-03',
    sessionTitle: 'Gentle Yin Yoga',
    sessionTime: '10:30 - 11:30 AM',
    clientEmail: 'maya@example.com',
    clientName: 'Maya Lin',
    clientPhone: '+1 (555) 234-5678',
    paymentMethod: 'PASS_CREDIT',
    amountPaid: 0.0,
    creditsDeducted: 1,
    status: 'CONFIRMED',
    createdAt: '2026-10-30T09:00:00.000Z',
  },
  {
    id: 'b-02',
    studioId: 'studio-sol-01',
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
    studioId: 'studio-sol-01',
    sessionId: 'sess-01',
    sessionTitle: 'Dynamic Pilates',
    sessionTime: '08:00 - 08:50 AM',
    clientEmail: 'maya@example.com',
    clientName: 'Maya Lin',
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
    studioId: 'studio-sol-01',
    sessionId: 'sess-03',
    sessionTitle: 'Gentle Yin Yoga',
    clientEmail: 'selina@example.com',
    clientPhone: '+1 (555) 443-8991',
    clientName: 'Selina Chen',
    priorityOrder: 1,
    mode: 'VIP_PREAUTH',
    status: 'WAITING',
    createdAt: '2026-11-01T15:00:00.000Z',
  },
  {
    id: 'wl-02',
    studioId: 'studio-sol-01',
    sessionId: 'sess-03',
    sessionTitle: 'Gentle Yin Yoga',
    clientEmail: 'david.lin@example.com',
    clientPhone: '+1 (555) 902-1144',
    clientName: 'David Lin',
    priorityOrder: 2,
    mode: 'STANDARD',
    status: 'WAITING',
    createdAt: '2026-11-01T16:30:00.000Z',
  },
];

const INITIAL_LEDGER: CreditLedgerEntry[] = [
  {
    id: 'led-01',
    userId: 'usr-maya-student',
    studioId: 'studio-sol-01',
    passId: 'pass-maya-01',
    type: 'PURCHASE',
    delta: 5,
    balanceAfter: 5,
    referenceId: 'pack-5',
    note: 'Purchased 5-Class Pack bundle',
    createdAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'led-02',
    userId: 'usr-maya-student',
    studioId: 'studio-sol-01',
    passId: 'pass-maya-01',
    type: 'BOOKING_DEBIT',
    delta: -1,
    balanceAfter: 4,
    referenceId: 'sess-01',
    note: 'Reserved Dynamic Pilates spot',
    createdAt: '2026-10-20T12:00:00.000Z',
  },
  {
    id: 'led-03',
    userId: 'usr-maya-student',
    studioId: 'studio-sol-01',
    passId: 'pass-maya-01',
    type: 'BOOKING_DEBIT',
    delta: -1,
    balanceAfter: 3,
    referenceId: 'sess-02',
    note: 'Reserved Vinyasa Flow spot',
    createdAt: '2026-10-25T15:30:00.000Z',
  },
  {
    id: 'led-04',
    userId: 'usr-maya-student',
    studioId: 'studio-sol-01',
    passId: 'pass-maya-01',
    type: 'BOOKING_DEBIT',
    delta: -1,
    balanceAfter: 2,
    referenceId: 'sess-01',
    note: 'Reserved Dynamic Pilates morning spot',
    createdAt: '2026-11-01T11:00:00.000Z',
  },
];

const INITIAL_STRIPE: StripeConnectOverview = {
  connectedAccountName: 'Sol Sanctuary Loon',
  stripeAccountId: 'acct_sol_sanctuary_8829',
  grossVolume: 3593.0,
  platformFeeDeduction: 0.0,
  stripeCardProcessingFee: 104.2,
  netBalance: 3488.8,
  pendingPayouts: 3593.0,
  nextPayoutDate: '2026-12-29',
  currency: 'USD',
  payoutHistory: [
    { id: 'po-1', amount: 2840.0, date: '2026-10-15', status: 'PAID', arrivalDate: '2026-10-17' },
    { id: 'po-2', amount: 3120.0, date: '2026-10-30', status: 'PAID', arrivalDate: '2026-11-01' },
  ],
};

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

  // Modals
  selectedSessionForBooking: ClassSession | null;
  isBookingDrawerOpen: boolean;
  selectedWaitlistSession: ClassSession | null;
  isWaitlistModalOpen: boolean;

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

  openBookingDrawer: (session: ClassSession) => void;
  closeBookingDrawer: () => void;
  openWaitlistModal: (session: ClassSession) => void;
  closeWaitlistModal: () => void;

  confirmBooking: (
    sessionId: string,
    method: PaymentMethodType,
    clientName: string,
    clientEmail: string
  ) => { success: boolean; message: string };

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
  addSession: (session: Omit<ClassSession, 'id' | 'studioId' | 'bookedCount'>) => void;
  updateSessionCapacity: (sessionId: string, newCapacity: number) => void;
  deleteSession: (sessionId: string) => void;
  purchaseClassPack: (packId: string) => void;
  addClassPack: (pack: Omit<ClassPack, 'id' | 'studioId'>) => void;
  updateClassPack: (id: string, updates: Partial<ClassPack>) => void;
  deleteClassPack: (id: string) => void;

  createStudioWithOnboarding: (data: {
    name: string;
    slug: string;
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
    };
  }) => void;
}

export const useAuraStore = create<AuraState>()(
  persist(
    (set, get) => ({
  currentRoute: parseInitialRoute(),
  activePersona: 'maya_student',
  simulateStripePayment: true, // Default to auto-approving test transactions

  locale: (typeof window !== 'undefined' && (localStorage.getItem('aura_locale') as SupportedLocale)) || 'en',
  currency: (typeof window !== 'undefined' && (localStorage.getItem('aura_currency') as SupportedCurrency)) || 'USD',
  selectedDate: '2026-11-02',
  activeCategory: 'All',
  activeAdminTab: 'schedule',
  isMobileDrawerOpen: false,

  // Messaging & Communication Initial State
  conversations: INITIAL_CONVERSATIONS,
  messages: INITIAL_MESSAGES,
  activeConversationId: 'conv-maya-01',
  broadcastHistory: INITIAL_BROADCASTS,
  isStudentChatOpen: false,
  studentChatSessionContext: null,

  currentUser: PERSONA_MAYA,
  studios: INITIAL_STUDIOS,
  activeStudioId: 'studio-sol-01',
  studio: INITIAL_STUDIOS[0],

  sessions: INITIAL_SESSIONS,
  classPacks: INITIAL_PACKS,
  userPass: INITIAL_MAYA_PASS,
  bookings: INITIAL_BOOKINGS,
  waitlist: INITIAL_WAITLIST,
  creditLedger: INITIAL_LEDGER,
  stripeOverview: INITIAL_STRIPE,

  selectedSessionForBooking: null,
  isBookingDrawerOpen: false,
  selectedWaitlistSession: null,
  isWaitlistModalOpen: false,

  activeWaterfallSessionId: null,
  activeWaterfallSecondsRemaining: 1800,

  navigateTo: (route) => {
    let url = '/s/sol-sanctuary';
    if (route.path === 'admin') url = '/admin';
    else if (route.path === 'onboarding') url = '/onboarding';
    else if (route.path === 'public_studio') url = `/s/${route.slug}`;

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', url);
    }
    set({ currentRoute: route, isMobileDrawerOpen: false });
  },

  switchPersona: (persona) => {
    if (persona === 'elena_owner') {
      set({
        activePersona: 'elena_owner',
        currentUser: PERSONA_ELENA,
        studio: INITIAL_STUDIOS[0],
      });
      get().navigateTo({ path: 'admin' });
    } else if (persona === 'maya_student') {
      set({
        activePersona: 'maya_student',
        currentUser: PERSONA_MAYA,
        userPass: {
          ...INITIAL_MAYA_PASS,
          creditsLeft: 2, // 2 Credits remaining
        },
      });
      get().navigateTo({ path: 'public_studio', slug: 'sol-sanctuary' });
    } else if (persona === 'new_student') {
      set({
        activePersona: 'new_student',
        currentUser: PERSONA_NEW_STUDENT,
        userPass: {
          ...INITIAL_MAYA_PASS,
          id: 'pass-guest-0',
          userId: PERSONA_NEW_STUDENT.id,
          creditsLeft: 0, // 0 Credits to test Stripe/Apple Pay checkout!
        },
      });
      get().navigateTo({ path: 'public_studio', slug: 'sol-sanctuary' });
    } else if (persona === 'new_owner') {
      set({
        activePersona: 'new_owner',
        currentUser: PERSONA_NEW_OWNER,
      });
      get().navigateTo({ path: 'onboarding' });
    }
  },

  setSimulateStripePayment: (simulateStripePayment) => set({ simulateStripePayment }),

  resetDatabaseToSeedState: () => {
    set({
      studios: INITIAL_STUDIOS,
      studio: INITIAL_STUDIOS[0],
      activeStudioId: 'studio-sol-01',
      sessions: INITIAL_SESSIONS,
      classPacks: INITIAL_PACKS,
      userPass: INITIAL_MAYA_PASS,
      bookings: INITIAL_BOOKINGS,
      waitlist: INITIAL_WAITLIST,
      creditLedger: INITIAL_LEDGER,
      stripeOverview: INITIAL_STRIPE,
      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,
      activeConversationId: 'conv-maya-01',
      broadcastHistory: INITIAL_BROADCASTS,
      isStudentChatOpen: false,
      studentChatSessionContext: null,
      activeWaterfallSessionId: null,
      activeWaterfallSecondsRemaining: 1800,
      selectedSessionForBooking: null,
      isBookingDrawerOpen: false,
    });
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
      senderName: senderRole === 'INSTRUCTOR' ? (studio.name || 'Elena Rostova') : currentUser.name,
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

    set({
      messages: {
        ...messages,
        [conversationId]: [...existing, newMsg],
      },
      conversations: updatedConversations,
    });
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
  },

  openBookingDrawer: (session) => set({ selectedSessionForBooking: session, isBookingDrawerOpen: true }),
  closeBookingDrawer: () => set({ isBookingDrawerOpen: false, selectedSessionForBooking: null }),
  openWaitlistModal: (session) => set({ selectedWaitlistSession: session, isWaitlistModalOpen: true }),
  closeWaitlistModal: () => set({ isWaitlistModalOpen: false, selectedWaitlistSession: null }),

  confirmBooking: (sessionId, method, clientName, clientEmail) => {
    const { sessions, userPass, creditLedger, bookings, stripeOverview, studio, currentUser } = get();
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
        sessionTime: `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`,
        clientEmail: clientEmail || currentUser.email,
        clientName: clientName || currentUser.name,
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

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      studioId: studio.id,
      sessionId,
      sessionTitle: session.title,
      sessionTime: `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`,
      clientEmail: clientEmail || currentUser.email,
      clientName: clientName || currentUser.name,
      paymentMethod: method,
      stripePaymentId: `ch_${Date.now()}_simulated`,
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
  },

  checkInClient: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, status: 'CHECKED_IN' } : b)),
    }));
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
  },

  addClassPack: (packData) => {
    const { classPacks, studio } = get();
    const newPack: ClassPack = {
      ...packData,
      id: `pack-${Date.now()}`,
      studioId: studio.id,
    };
    set({ classPacks: [...classPacks, newPack] });
  },

  updateClassPack: (id, updates) => {
    const { classPacks } = get();
    set({
      classPacks: classPacks.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  },

  deleteClassPack: (id) => {
    const { classPacks } = get();
    set({
      classPacks: classPacks.filter((p) => p.id !== id),
    });
  },

  createStudioWithOnboarding: (data) => {
    const newStudioId = `studio-${Date.now()}`;
    const newStudio: Studio = {
      id: newStudioId,
      ownerId: get().currentUser.id,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: data.name,
      tagline: 'Boutique Movement & Reformer Studio',
      currency: data.currency,
      stripeAccountId: `acct_${Date.now()}`,
      stripeAccountName: `${data.name} Payouts`,
      cancelWindowHrs: data.cancelWindowHrs,
      waitlistMins: data.waitlistMins,
      roomsCount: 1,
      monthlySubscriptionPrice: 29.0,
      platformTakeRate: 0.0,
      logoMark: '✨',
      createdAt: new Date().toISOString(),
      communication: DEFAULT_COMMUNICATION,
      paymentMethods: DEFAULT_PAYMENTS,
    };

    const firstClassSession: ClassSession = {
      id: `sess-${Date.now()}`,
      studioId: newStudioId,
      title: data.firstClass.title,
      category: data.firstClass.category,
      instructor: data.firstClass.instructor,
      instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      startTime: '2026-11-03T09:00:00.000Z',
      endTime: '2026-11-03T09:50:00.000Z',
      durationMins: 50,
      capacity: data.firstClass.capacity,
      bookedCount: 0,
      price: data.firstClass.price,
      roomName: data.firstClass.roomName || 'Studio Room 1',
      level: 'All Levels',
    };

    set((state) => ({
      studios: [...state.studios, newStudio],
      studio: newStudio,
      activeStudioId: newStudioId,
      currency: data.currency,
      sessions: [firstClassSession, ...state.sessions],
      currentRoute: { path: 'admin' },
      activePersona: 'elena_owner',
    }));

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
    }
  },
}),
    {
      name: 'aura-flow-db-v1',
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
      }),
    }
  )
);

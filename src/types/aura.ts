export type SupportedLocale = 'en' | 'zh-TW' | 'zh-CN' | 'ja';

export type SupportedCurrency = 'USD' | 'TWD' | 'HKD' | 'JPY' | 'SGD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  rateToUSD: number; // For demo currency conversion
  localeDefault: string;
  flag: string;
}

export const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rateToUSD: 1.0, localeDefault: 'en-US', flag: '🇺🇸' },
  TWD: { code: 'TWD', symbol: 'NT$', rateToUSD: 32.0, localeDefault: 'zh-TW', flag: '🇹🇼' },
  HKD: { code: 'HKD', symbol: 'HK$', rateToUSD: 7.8, localeDefault: 'zh-HK', flag: '🇭🇰' },
  JPY: { code: 'JPY', symbol: '¥', rateToUSD: 155.0, localeDefault: 'ja-JP', flag: '🇯🇵' },
  SGD: { code: 'SGD', symbol: 'S$', rateToUSD: 1.35, localeDefault: 'en-SG', flag: '🇸🇬' },
  EUR: { code: 'EUR', symbol: '€', rateToUSD: 0.92, localeDefault: 'fr-FR', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', rateToUSD: 0.79, localeDefault: 'en-GB', flag: '🇬🇧' },
};

export type PersonaType =
  | 'elena_owner'
  | 'maya_student'
  | 'new_student'
  | 'new_owner';

// Supabase / Database User Model
export interface DatabaseUser {
  id: string;
  email: string;
  role: 'OWNER' | 'STUDENT';
  name: string;
  avatarUrl?: string;
  studioId?: string;
  createdAt: string;
}

export interface StudioCommunicationSettings {
  lineOaEnabled: boolean;
  lineChannelId: string;
  lineChannelSecret: string;
  lineAccessToken: string;
  instagramHandle: string;
  supportEmail: string;
}

export interface StudioPaymentConfig {
  stripe: {
    enabled: boolean;
    connected: boolean;
    accountName: string;
    supportedCards: string[];
  };
  linePay: {
    enabled: boolean;
    channelId: string;
    channelSecret: string;
    qrCodeUrl?: string;
  };
  jkoPay: {
    enabled: boolean;
    merchantId: string;
    qrCodeUrl?: string;
  };
  bankTransfer: {
    enabled: boolean;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface Studio {
  id: string;
  ownerId: string;
  slug: string; // e.g. "sol-sanctuary" or "aura-flow"
  name: string;
  tagline: string;
  currency: SupportedCurrency;
  stripeAccountId: string;
  stripeAccountName: string;
  cancelWindowHrs: number; // e.g., 12 hours
  waitlistMins: number; // e.g., 30 minutes
  roomsCount: number;
  monthlySubscriptionPrice: number; // $29.00
  platformTakeRate: number; // 0%
  logoMark: string;
  createdAt: string;
  communication?: StudioCommunicationSettings;
  paymentMethods?: StudioPaymentConfig;
}

export type ClassCategory = 
  | 'Reformer'
  | 'Flow'
  | 'Sound Bath'
  | 'Yin Yoga'
  | 'Mat Pilates'
  | 'Barre'
  | 'Workshop'
  | (string & {});

export interface ClassSession {
  id: string;
  studioId: string; // Decoupled by studio_id
  title: string;
  category: ClassCategory;
  instructor: string;
  instructorAvatar: string;
  instructorBio?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  durationMins: number;
  capacity: number; // Hard cap, e.g. 8 reformers
  bookedCount: number;
  price: number; // Drop-in pricing in baseline currency
  roomName: string;
  level: 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ClassPack {
  id: string;
  studioId: string; // Decoupled by studio_id
  name: string;
  credits: number;
  price: number;
  originalPrice?: number;
  expiryDays: number;
  popularBadge?: boolean;
  description: string;
}

export interface ClientPass {
  id: string;
  userId: string;
  studioId: string; // Decoupled by studio_id
  packId: string;
  packName: string;
  creditsTotal: number;
  creditsLeft: number;
  expiresAt: string;
  createdAt: string;
}

export type PaymentMethodType =
  | 'PASS_CREDIT'
  | 'STRIPE_CARD'
  | 'APPLE_PAY'
  | 'LINE_PAY'
  | 'JKOPAY'
  | 'BANK_TRANSFER';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderRole: 'STUDENT' | 'INSTRUCTOR' | 'SYSTEM';
  senderName: string;
  senderAvatar?: string;
  content: string;
  channel: 'IN_APP' | 'LINE_OA';
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  studioId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentAvatar?: string;
  sessionId?: string;
  sessionTitle?: string;
  sessionTime?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  channel: 'IN_APP' | 'LINE_OA';
}

export interface RosterBroadcast {
  id: string;
  studioId: string;
  sessionId: string;
  sessionTitle: string;
  instructorName: string;
  message: string;
  channels: ('IN_APP' | 'LINE_OA')[];
  recipientCount: number;
  sentAt: string;
}

export type AdminTabType = 'schedule' | 'packs' | 'rosters' | 'messages' | 'payments' | 'policies';

export interface Booking {
  id: string;
  studioId: string; // Decoupled by studio_id
  sessionId: string;
  sessionTitle: string;
  sessionTime: string;
  clientEmail: string;
  clientName: string;
  clientPhone?: string;
  paymentMethod: PaymentMethodType;
  stripePaymentId?: string;
  amountPaid: number;
  creditsDeducted: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN';
  createdAt: string;
}

export type WaitlistMode = 'STANDARD' | 'VIP_PREAUTH';
export type WaitlistStatus = 'WAITING' | 'OFFERED' | 'CLAIMED' | 'EXPIRED' | 'DECLINED';

export interface WaitlistEntry {
  id: string;
  studioId: string; // Decoupled by studio_id
  sessionId: string;
  sessionTitle?: string;
  clientEmail: string;
  clientPhone: string;
  clientName: string;
  priorityOrder: number;
  mode: WaitlistMode; // Standard free queue vs VIP $0 pre-auth hold
  status: WaitlistStatus;
  offerExpiresAt?: string; // 30-minute waterfall expiry
  claimToken?: string;
  preAuthCardId?: string;
  createdAt: string;
}

export interface CreditLedgerEntry {
  id: string;
  userId: string;
  studioId: string;
  passId: string;
  type: 'PURCHASE' | 'BOOKING_DEBIT' | 'CANCELLATION_REFUND' | 'EXPIRED' | 'ADMIN_ADJUSTMENT';
  delta: number;
  balanceAfter: number;
  referenceId: string;
  note: string;
  createdAt: string;
}

export interface StripePayoutHistoryItem {
  id: string;
  amount: number;
  date: string;
  status: 'PAID' | 'IN_TRANSIT' | 'PENDING';
  arrivalDate: string;
}

export interface StripeConnectOverview {
  connectedAccountName: string;
  stripeAccountId: string;
  grossVolume: number;
  platformFeeDeduction: number; // $0.00 (0%)
  stripeCardProcessingFee: number; // 2.9% + $0.30
  netBalance: number;
  pendingPayouts: number;
  nextPayoutDate: string;
  currency: SupportedCurrency;
  payoutHistory: StripePayoutHistoryItem[];
}

// App Routing Types
export type AppRoute =
  | { path: 'public_studio'; slug: string }
  | { path: 'admin' }
  | { path: 'onboarding' };

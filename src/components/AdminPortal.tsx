import React, { useState, useEffect } from 'react';
import { useAuraStore } from '../store/auraStore';
import {
  getTranslation,
  formatCurrency,
  formatDateLocalized,
  getPackDisplayName,
  getPackDisplayDescription,
} from '../i18n/auraI18n';
import {
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Zap,
  Bell,
  ArrowRight,
  ShieldAlert,
  Percent,
  DollarSign,
  Users,
  Settings,
  Sparkles,
  Ticket,
  Pencil,
  MessageSquare,
  Send,
  QrCode,
  Smartphone,
  CreditCard,
  Building,
  Mail,
  Instagram,
  Check,
  CheckCheck,
  Copy,
  Radio,
  Share2,
  Megaphone,
  MessageCircle,
} from 'lucide-react';
import { ClassCategory, CURRENCY_CONFIGS, ClassPack, ClassSession, AdminTabType } from '../types/aura';
import { AuraLogoBadge } from './AuraLeafLogo';
import { useSubscription } from '../hooks/useSubscription';

export const AdminPortal: React.FC = () => {
  const { isPro, openPaywall } = useSubscription();
  const {
    locale,
    currency,
    studio,
    sessions,
    bookings,
    waitlist,
    classPacks,
    stripeOverview,
    activeAdminTab,
    setActiveAdminTab,
    cancelBooking,
    checkInClient,
    claimWaitlistOffer,
    declineWaitlistOffer,
    triggerWaterfallCascade,
    activeWaterfallSessionId,
    activeWaterfallSecondsRemaining,
    tickWaterfallTimer,
    updateStudioPolicies,
    updateStudioSettings,
    addSession,
    deleteSession,
    addClassPack,
    updateClassPack,
    deleteClassPack,
    navigateTo,
    // Messaging & Communication Module
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendChatMessage,
    broadcastToRoster,
    broadcastHistory,
    updateStudioCommunication,
    updateStudioPayments,
    cloudConnected,
    lastCloudSyncAt,
    syncFromCloud,
  } = useAuraStore();

  const [cancelCutoff, setCancelCutoff] = useState(studio.cancelWindowHrs);
  const [waitlistMins, setWaitlistMins] = useState(studio.waitlistMins);
  const [announcementBanner, setAnnouncementBanner] = useState(
    studio.announcementBanner ?? '🎉 教室最新公告：新學員首堂體驗現折 NT$ 200 • 歡迎線上預約！'
  );
  const [discoverable, setDiscoverable] = useState(studio.discoverable !== false);
  const [studioCity, setStudioCity] = useState(studio.city ?? 'Taipei • Da-an District (台北大安)');
  const [copiedStudioLink, setCopiedStudioLink] = useState(false);
  const [policiesSavedToast, setPoliciesSavedToast] = useState(false);
  const [showNewClassModal, setShowNewClassModal] = useState(false);

  // New Class Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ClassCategory>('Reformer');
  const [newInstructor, setNewInstructor] = useState('Lena S.');
  const [newCapacity, setNewCapacity] = useState(8);
  const [newPrice, setNewPrice] = useState(28);
  const [newRoom, setNewRoom] = useState('Reformer Studio A');

  // Class Pack Form State (Edit & Create)
  const [showPackModal, setShowPackModal] = useState(false);
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [packNameInput, setPackNameInput] = useState('');
  const [packPriceInput, setPackPriceInput] = useState(115);
  const [packCreditsInput, setPackCreditsInput] = useState(5);
  const [packExpiryInput, setPackExpiryInput] = useState(90);
  const [packPopularInput, setPackPopularInput] = useState(false);
  const [packDescInput, setPackDescInput] = useState('');

  // 1-Click Roster Broadcast Modal State
  const [broadcastingSession, setBroadcastingSession] = useState<ClassSession | null>(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastInApp, setBroadcastInApp] = useState(true);
  const [broadcastLine, setBroadcastLine] = useState(true);
  const [broadcastSentToast, setBroadcastSentToast] = useState(false);

  // Chat message input state
  const [replyText, setReplyText] = useState('');

  // Payment configuration state
  const [stripeSecretKey, setStripeSecretKey] = useState(studio.paymentMethods?.stripe.secretKey ?? '');
  const [stripePublishableKey, setStripePublishableKey] = useState(studio.paymentMethods?.stripe.publishableKey ?? '');
  const [linePayEnabled, setLinePayEnabled] = useState(studio.paymentMethods?.linePay.enabled ?? true);
  const [linePayChannelId, setLinePayChannelId] = useState(studio.paymentMethods?.linePay.channelId ?? 'linepay_merchant_99281');
  const [linePayChannelSecret, setLinePayChannelSecret] = useState(studio.paymentMethods?.linePay.channelSecret ?? 'sec_linepay_7721839');
  const [linePayQrCodeUrl, setLinePayQrCodeUrl] = useState(studio.paymentMethods?.linePay.qrCodeUrl ?? '');
  
  const [jkoPayEnabled, setJkoPayEnabled] = useState(studio.paymentMethods?.jkoPay.enabled ?? true);
  const [jkoPayMerchantId, setJkoPayMerchantId] = useState(studio.paymentMethods?.jkoPay.merchantId ?? 'JKO_STORE_883019');
  const [jkoPayQrCodeUrl, setJkoPayQrCodeUrl] = useState(studio.paymentMethods?.jkoPay.qrCodeUrl ?? '');

  const [bankEnabled, setBankEnabled] = useState(studio.paymentMethods?.bankTransfer.enabled ?? true);
  const [bankName, setBankName] = useState(studio.paymentMethods?.bankTransfer.bankName ?? '國泰世華商業銀行 (Cathay United Bank)');
  const [bankCode, setBankCode] = useState(studio.paymentMethods?.bankTransfer.bankCode ?? '013');
  const [bankAccount, setBankAccount] = useState(studio.paymentMethods?.bankTransfer.accountNumber ?? '013-50-6189201');
  const [bankAccountName, setBankAccountName] = useState(studio.paymentMethods?.bankTransfer.accountName ?? '日光彼拉提斯工作室 (Elena Rostova)');
  const [paymentSavedToast, setPaymentSavedToast] = useState(false);

  // Communication settings state (LINE OA, IG, Email, Resend)
  const [lineOaActive, setLineOaActive] = useState(studio.communication?.lineOaEnabled ?? true);
  const [lineOaChannelId, setLineOaChannelId] = useState(studio.communication?.lineChannelId ?? '@sol_sanctuary_tw');
  const [lineOaChannelSecret, setLineOaChannelSecret] = useState(studio.communication?.lineChannelSecret ?? 'sec_884920a9fbc10293847');
  const [lineOaAccessToken, setLineOaAccessToken] = useState(studio.communication?.lineAccessToken ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.solsanctuary_token_sample');
  const [igHandle, setIgHandle] = useState(studio.communication?.instagramHandle ?? '@solsanctuary.movement');
  const [commEmail, setCommEmail] = useState(studio.communication?.supportEmail ?? 'hello@solsanctuary.studio');
  const [resendApiKey, setResendApiKey] = useState(studio.communication?.resendApiKey ?? '');
  const [commSavedToast, setCommSavedToast] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [testActionResult, setTestActionResult] = useState<string | null>(null);

  const tCommon = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'common', key, params);
  const tAdmin = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'admin', key, params);

  // Calculate total unread messages count
  const totalUnreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  // Active conversation object
  const currentConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const currentConvMessages = currentConv ? messages[currentConv.id] || [] : [];

  const handleOpenNewClassModal = () => {
    setNewTitle('');
    setNewCategory('Reformer');
    setNewInstructor(studio.name ? `${studio.name.split(' ')[0]} Coach` : 'Elena Rostova');
    setNewCapacity(8);
    setNewPrice(currency === 'TWD' ? 800 : 28);
    setNewRoom('Reformer Studio A');
    setShowNewClassModal(true);
  };

  const handleOpenCreatePackModal = () => {
    setEditingPackId(null);
    setPackNameInput('');
    setPackPriceInput(currency === 'TWD' ? 3500 : 115);
    setPackCreditsInput(5);
    setPackExpiryInput(90);
    setPackPopularInput(false);
    setPackDescInput('');
    setShowPackModal(true);
  };

  const handleOpenEditPackModal = (pack: ClassPack) => {
    setEditingPackId(pack.id);
    setPackNameInput(getPackDisplayName(pack.name, locale));
    setPackPriceInput(pack.price);
    setPackCreditsInput(pack.credits);
    setPackExpiryInput(pack.expiryDays);
    setPackPopularInput(Boolean(pack.popularBadge));
    setPackDescInput(getPackDisplayDescription(pack, currency, locale));
    setShowPackModal(true);
  };

  const handleSavePack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packNameInput.trim()) return;

    if (editingPackId) {
      updateClassPack(editingPackId, {
        name: packNameInput.trim(),
        price: packPriceInput,
        credits: packCreditsInput,
        expiryDays: packExpiryInput,
        popularBadge: packPopularInput,
        description: packDescInput.trim(),
      });
    } else {
      addClassPack({
        name: packNameInput.trim(),
        price: packPriceInput,
        credits: packCreditsInput,
        expiryDays: packExpiryInput,
        popularBadge: packPopularInput,
        description: packDescInput.trim(),
      });
    }
    setShowPackModal(false);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addSession({
      title: newTitle.trim(),
      category: newCategory,
      instructor: newInstructor.trim(),
      instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      startTime: '2026-11-06T09:00:00.000Z',
      endTime: '2026-11-06T09:50:00.000Z',
      durationMins: 50,
      capacity: newCapacity,
      price: newPrice,
      roomName: newRoom.trim(),
      level: 'All Levels',
    });

    setShowNewClassModal(false);
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudioPolicies(cancelCutoff, waitlistMins);
    updateStudioSettings({
      announcementBanner: announcementBanner.trim(),
      discoverable,
      city: studioCity.trim(),
    });
    setPoliciesSavedToast(true);
    setTimeout(() => setPoliciesSavedToast(false), 3000);
  };

  const handlePublishOrShareStudioLink = (reason: 'PUBLISH_SCHEDULE' | 'SHARE_LINK') => {
    if (!isPro) {
      openPaywall(reason);
      return;
    }
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://auraflow-bay.vercel.app'}/studio/${studio.slug}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedStudioLink(true);
    setTimeout(() => setCopiedStudioLink(false), 2500);
  };

  const handleSaveCommunication = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudioCommunication({
      lineOaEnabled: lineOaActive,
      lineChannelId: lineOaChannelId,
      lineChannelSecret: lineOaChannelSecret,
      lineAccessToken: lineOaAccessToken,
      instagramHandle: igHandle,
      supportEmail: commEmail,
      resendApiKey,
    });
    setCommSavedToast(true);
    setTimeout(() => setCommSavedToast(false), 3000);
  };

  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudioPayments({
      stripe: {
        enabled: true,
        connected: true,
        accountName: studio.paymentMethods?.stripe.accountName || 'acct_sol_sanctuary_8829',
        supportedCards: studio.paymentMethods?.stripe.supportedCards || ['Visa', 'Mastercard', 'JCB', 'Apple Pay', 'Google Pay'],
        secretKey: stripeSecretKey,
        publishableKey: stripePublishableKey,
      },
      linePay: {
        enabled: linePayEnabled,
        channelId: linePayChannelId,
        channelSecret: linePayChannelSecret,
        qrCodeUrl: linePayQrCodeUrl,
      },
      jkoPay: {
        enabled: jkoPayEnabled,
        merchantId: jkoPayMerchantId,
        qrCodeUrl: jkoPayQrCodeUrl,
      },
      bankTransfer: {
        enabled: bankEnabled,
        bankName,
        bankCode,
        accountNumber: bankAccount,
        accountName: bankAccountName,
      },
    });
    setPaymentSavedToast(true);
    setTimeout(() => setPaymentSavedToast(false), 3000);
  };

  const handleTestLinePush = async () => {
    setTestActionResult(locale === 'zh-TW' ? '正在發送 LINE OA 測試推播...' : 'Sending LINE OA test push...');
    try {
      const resp = await fetch('/api/line-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: lineOaAccessToken,
          sessionTitle: studio.name || 'Aura Flow Studio',
          message: locale === 'zh-TW' ? '這是一則來自 Aura Flow 工作室後台的 LINE OA 連線測試通知！' : 'Test broadcast from Aura Flow Studio Admin!',
        }),
      });
      const data = await resp.json();
      if (data.ok && !data.simulated) {
        setTestActionResult(locale === 'zh-TW' ? '✅ LINE 官方帳號真實廣播已成功送出！' : '✅ Live LINE OA broadcast sent!');
      } else {
        setTestActionResult(
          locale === 'zh-TW'
            ? `ℹ️ API 測試完成 (${data.message || '請填入正式 LINE Channel Access Token 以推播至真實手機'})`
            : `ℹ️ API test complete (${data.message || 'Enter a live LINE Channel Access Token for real delivery'})`
        );
      }
    } catch {
      setTestActionResult(locale === 'zh-TW' ? '❌ 連線失敗' : '❌ Connection error');
    }
    setTimeout(() => setTestActionResult(null), 5000);
  };

  const handleTestEmailSend = async () => {
    setTestActionResult(locale === 'zh-TW' ? '正在發送測試確認信...' : 'Sending test confirmation email...');
    try {
      const resp = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: commEmail || 'hello@solsanctuary.studio',
          clientName: 'Elena Rostova',
          studioName: studio.name || 'Sol Sanctuary',
          sessionTitle: 'Dynamic Reformer Pilates',
          sessionTime: '09:00 - 09:50',
          instructor: 'Elena Rostova',
          roomName: 'Reformer Studio A',
          paymentMethod: 'STRIPE_CARD',
          amountPaid: `${currency} 800`,
          resendApiKey,
          type: 'TEST_EMAIL',
        }),
      });
      const data = await resp.json();
      if (data.ok && !data.simulated) {
        setTestActionResult(
          locale === 'zh-TW'
            ? `✅ 真實確認信已寄出至 ${commEmail} (ID: ${data.emailId})！`
            : `✅ Live email sent to ${commEmail} (ID: ${data.emailId})!`
        );
      } else {
        setTestActionResult(
          locale === 'zh-TW'
            ? `ℹ️ 郵件佇列已觸發 (${data.message || '填入 Resend API Key 即可寄送真實信件'})`
            : `ℹ️ Email queue triggered (${data.message || 'Add Resend API Key for live delivery'})`
        );
      }
    } catch {
      setTestActionResult(locale === 'zh-TW' ? '❌ 寄送失敗' : '❌ Failed to send email');
    }
    setTimeout(() => setTestActionResult(null), 5000);
  };

  const handleOpenBroadcastModal = (session: ClassSession) => {
    setBroadcastingSession(session);
    setBroadcastText('');
    setBroadcastInApp(true);
    setBroadcastLine(Boolean(studio.communication?.lineOaEnabled));
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastingSession || !broadcastText.trim()) return;

    const channels: ('IN_APP' | 'LINE_OA')[] = [];
    if (broadcastInApp) channels.push('IN_APP');
    if (broadcastLine) channels.push('LINE_OA');

    broadcastToRoster(broadcastingSession.id, broadcastText.trim(), channels);
    setBroadcastSentToast(true);
    setTimeout(() => {
      setBroadcastSentToast(false);
      setBroadcastingSession(null);
    }, 1500);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConv || !replyText.trim()) return;
    sendChatMessage(currentConv.id, replyText.trim());
    setReplyText('');
  };

  const handleQuickReply = (text: string) => {
    if (!currentConv) return;
    sendChatMessage(currentConv.id, text);
  };

  return (
    <div className="min-h-screen bg-[#1C1917] text-[#E0D8CE] pb-24 selection:bg-[#C5A059]/30">
      {/* Top Admin Navigation matching Screenshot 3 */}
      <header className="sticky top-0 z-30 bg-[#1C1917]/95 backdrop-blur-md border-b border-[#3A332B] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center space-x-2.5">
            <AuraLogoBadge size="sm" className="w-8 h-8" />
            <span className="font-serif text-xl tracking-wider text-[#C5A059] font-medium">
              Aura Flow
            </span>
          </div>

          {/* Center Tabs with Badges */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-[#282420] p-1 rounded-full border border-[#3A342E] overflow-x-auto no-scrollbar max-w-[70vw] sm:max-w-none">
            <button
              onClick={() => setActiveAdminTab('schedule')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeAdminTab === 'schedule'
                  ? 'bg-[#3A332C] text-[#EAD8B1] border border-[#5A4F44] shadow-xs'
                  : 'text-[#A89F91] hover:text-[#EAD8B1]'
              }`}
            >
              {tAdmin('tabScheduleBuilder')}
            </button>
            <button
              onClick={() => setActiveAdminTab('packs')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeAdminTab === 'packs'
                  ? 'bg-[#3A332C] text-[#EAD8B1] border border-[#5A4F44] shadow-xs'
                  : 'text-[#A89F91] hover:text-[#EAD8B1]'
              }`}
            >
              {tAdmin('tabPacksPricing')}
            </button>
            <button
              onClick={() => setActiveAdminTab('rosters')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeAdminTab === 'rosters'
                  ? 'bg-[#3A332C] text-[#EAD8B1] border border-[#5A4F44] shadow-xs'
                  : 'text-[#A89F91] hover:text-[#EAD8B1]'
              }`}
            >
              {tAdmin('tabRosters')}
            </button>
            <button
              onClick={() => setActiveAdminTab('messages')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center space-x-1.5 ${
                activeAdminTab === 'messages'
                  ? 'bg-[#3A332C] text-[#EAD8B1] border border-[#5A4F44] shadow-xs'
                  : 'text-[#A89F91] hover:text-[#EAD8B1]'
              }`}
            >
              <span>{tAdmin('tabMessages')}</span>
              {totalUnreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-[#161412] text-[10px] font-bold flex items-center justify-center">
                  {totalUnreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveAdminTab('payments')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeAdminTab === 'payments'
                  ? 'bg-[#3A332C] text-[#EAD8B1] border border-[#5A4F44] shadow-xs'
                  : 'text-[#A89F91] hover:text-[#EAD8B1]'
              }`}
            >
              {tAdmin('tabPayments')}
            </button>
            <button
              onClick={() => setActiveAdminTab('policies')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeAdminTab === 'policies'
                  ? 'bg-[#3A332C] text-[#EAD8B1] border border-[#5A4F44] shadow-xs'
                  : 'text-[#A89F91] hover:text-[#EAD8B1]'
              }`}
            >
              {tAdmin('tabPolicies')}
            </button>
          </div>

          {/* Right Status */}
          <div className="flex items-center space-x-2.5 text-xs text-[#A89F91]">
            <button
              type="button"
              onClick={() => syncFromCloud()}
              title={lastCloudSyncAt ? `Last synced: ${new Date(lastCloudSyncAt).toLocaleTimeString()}` : 'Click to sync with Supabase Cloud'}
              className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/70 text-[10px] text-emerald-300 hover:bg-emerald-900/60 transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{cloudConnected ? (locale === 'zh-TW' ? '雲端即時同步中' : 'Cloud Live') : (locale === 'zh-TW' ? '連線雲端...' : 'Connecting...')}</span>
            </button>
            <button
              onClick={() => navigateTo({ path: 'public_studio', slug: studio.slug || 'sol-sanctuary' })}
              className="hidden sm:inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#2A2520] border border-[#3D352E] text-[11px] text-[#C5A059] hover:bg-[#383028] transition-colors"
            >
              <span>{tCommon('publicPage')}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <div className="w-7 h-7 rounded-full bg-[#2A2520] border border-[#3D352E] flex items-center justify-center text-[#C5A059]">
              <Settings className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace Container */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Value-First Publish & Share Live Booking Link Banner */}
        <div
          className={`mb-5 rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isPro
              ? 'bg-emerald-950/30 border-emerald-700/50'
              : 'bg-amber-950/40 border-[#C5A059]/60 shadow-lg'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isPro
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-[#F5F2EB]">
                  {isPro
                    ? locale === 'zh-TW'
                      ? '課表已公開上線 • 專屬獨立預約連結已啟用'
                      : 'Schedule is Live • Private Studio Booking Link Active'
                    : locale === 'zh-TW'
                    ? '草稿預覽模式 • 發布課表即可開始接收學員預約'
                    : 'Draft Preview Mode • Publish Schedule to Accept Client Bookings'}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isPro
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isPro ? 'PRO LIVE' : locale === 'zh-TW' ? '尚未發布' : 'UNPUBLISHED'}
                </span>
              </div>
              <p className="text-xs text-[#A89F91] mt-0.5">
                {locale === 'zh-TW' ? '專屬無廣告預約網址：' : 'Your private ad-free studio link: '}
                <span className="font-mono text-[#EAD8B1]">/studio/{studio.slug}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePublishOrShareStudioLink('SHARE_LINK')}
              className="px-4 py-2 rounded-full bg-[#2A241E] hover:bg-[#383028] border border-[#4A4035] text-xs font-medium text-[#E0D8CE] flex items-center space-x-1.5 transition-all"
            >
              {copiedStudioLink ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{locale === 'zh-TW' ? '已複製專屬網址！' : 'Link Copied!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{locale === 'zh-TW' ? '分享預約連結' : 'Share Booking Link'}</span>
                </>
              )}
            </button>

            {!isPro && (
              <button
                type="button"
                onClick={() => handlePublishOrShareStudioLink('PUBLISH_SCHEDULE')}
                className="px-5 py-2 rounded-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#161412] text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {locale === 'zh-TW'
                    ? '發布課表開始接單 (Publish & Go Live)'
                    : 'Publish & Go Live (14-Day Free Trial)'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Top Payout & 0% Fee Banner matching Screenshot 3 */}
        <div className="mb-8 rounded-3xl bg-linear-to-r from-[#24201C] via-[#2A241E] to-[#1E1B18] p-6 border border-[#3A332B] shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#C5A059] mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{tAdmin('stripeDirectPayouts')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#F5F2EB] tracking-tight">
                {formatCurrency(stripeOverview.pendingPayouts, currency, locale)}
              </h2>
              <p className="text-xs text-[#8C8274] mt-1">
                {tAdmin('nextPayoutDate')}: {formatDateLocalized('2026-11-06', locale)} • {tAdmin('directPayoutAccount')}: {stripeOverview.connectedAccountName}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="px-4 py-2.5 rounded-2xl bg-[#1A1714] border border-[#3A332B]">
                <div className="text-[11px] text-[#8C8274]">{tAdmin('platformTakeRate')}</div>
                <div className="text-base font-semibold text-emerald-400">
                  {tAdmin('zeroCommissionBadge')}
                </div>
              </div>

              <button
                onClick={() => navigateTo({ path: 'public_studio', slug: studio.slug || 'sol-sanctuary' })}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#C5A059] text-[#161412] text-xs font-semibold hover:bg-[#D4AF37] transition-all shadow-md active:scale-95"
              >
                <span>{tCommon('viewPublicPage')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* SUB-TAB 1: SCHEDULE BUILDER */}
        {activeAdminTab === 'schedule' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-[#F5F2EB] tracking-wide">
                  {tAdmin('activeClassSchedule')}
                </h3>
                <p className="text-xs text-[#8C8274]">
                  {tAdmin('activeClassScheduleSub')}
                </p>
              </div>

              <button
                onClick={handleOpenNewClassModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#C5A059] text-[#161412] text-xs font-semibold hover:bg-[#D4AF37] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tAdmin('createClass')}</span>
              </button>
            </div>

            {/* Grid of Sessions with Roster Broadcast Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => {
                const fillRatio = Math.min(100, Math.round((session.bookedCount / session.capacity) * 100));
                const isFull = session.bookedCount >= session.capacity;

                return (
                  <div
                    key={session.id}
                    className="bg-[#221E1A] rounded-2xl p-5 border border-[#3A332B] hover:border-[#574B3E] transition-all relative overflow-hidden group shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-serif text-base font-medium text-[#F5F2EB] group-hover:text-[#EAD8B1] transition-colors">
                            {session.title}
                          </h4>
                          <p className="text-xs text-[#8C8274] mt-0.5 font-mono">
                            {session.startTime.substring(11, 16)} - {session.endTime.substring(11, 16)} • {studio.name}
                          </p>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#2E2822] text-[#C5A059] border border-[#423930]">
                          {session.category}
                        </span>
                      </div>

                      <div className="text-xs text-[#A89F91] mb-4">
                        Coach: <span className="text-[#E0D8CE] font-medium">{session.instructor}</span>
                      </div>
                    </div>

                    <div>
                      {/* Capacity Meter Bar */}
                      <div className="pt-2 border-t border-[#302B24] mb-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[#8C8274] text-[11px]">
                            {tAdmin('capacityMeters')}
                          </span>
                          <span
                            className={`text-xs font-semibold font-mono ${
                              isFull ? 'text-amber-400' : 'text-[#E0D8CE]'
                            }`}
                          >
                            {tAdmin('bookedCountStatus', { booked: session.bookedCount, capacity: session.capacity })}
                            {isFull && ` • ${tAdmin('waitlistActive')}`}
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-[#181614] overflow-hidden p-0.5 border border-[#3A332B]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull
                                ? 'bg-linear-to-r from-[#C5A059] to-[#E5C170] shadow-[0_0_8px_rgba(197,160,89,0.5)]'
                                : 'bg-linear-to-r from-[#8C7A58] to-[#C5A059]'
                            }`}
                            style={{ width: `${fillRatio}%` }}
                          />
                        </div>
                      </div>

                      {/* 1-Click Class Roster Broadcast CTA */}
                      <button
                        onClick={() => handleOpenBroadcastModal(session)}
                        className="w-full py-2 px-3 rounded-xl bg-[#2C2620] hover:bg-[#383028] border border-[#443B30] text-xs font-medium text-[#EAD8B1] flex items-center justify-center space-x-1.5 transition-colors group-hover:border-[#C5A059]/60"
                      >
                        <Megaphone className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{tAdmin('broadcastToRoster')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: PACKS & PRICING */}
        {activeAdminTab === 'packs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-[#F5F2EB] tracking-wide">
                  {tAdmin('classPacksTitle')}
                </h3>
                <p className="text-xs text-[#8C8274]">
                  {tAdmin('classPacksSubtitle')}
                </p>
              </div>

              <button
                onClick={handleOpenCreatePackModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#C5A059] text-[#161412] text-xs font-semibold hover:bg-[#D4AF37] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tAdmin('createNewPack')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-[#221E1A] rounded-2xl p-6 border border-[#3A332B] flex flex-col justify-between relative shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-serif text-lg font-medium text-[#F5F2EB]">
                        {getPackDisplayName(pack.name, locale)}
                      </h4>
                      {pack.popularBadge && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C5A059] text-[#161412] font-semibold">
                          {tAdmin('popularTag')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#A89F91] mb-4">
                      {getPackDisplayDescription(pack, currency, locale)}
                    </p>

                    <div className="text-2xl font-semibold text-[#F5F2EB] mb-2 font-mono">
                      {formatCurrency(pack.price, currency, locale)}
                    </div>

                    <div className="space-y-1.5 text-xs text-[#8C8274] pt-3 border-t border-[#302B24]">
                      <div>{tAdmin('creditsCount', { count: pack.credits })}</div>
                      <div>{tAdmin('validityDays', { days: pack.expiryDays })}</div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#302B24] flex items-center justify-between">
                    <button
                      onClick={() => handleOpenEditPackModal(pack)}
                      className="text-xs text-[#C5A059] hover:underline flex items-center space-x-1"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>{tAdmin('editPackAction')}</span>
                    </button>
                    <span className="text-[11px] text-[#706658]">
                      0% Commission
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: ROSTERS & CHECK-IN */}
        {activeAdminTab === 'rosters' && (
          <div>
            {/* Waterfall Notification Banner if Active */}
            {activeWaterfallSessionId && (
              <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-amber-950/70 to-[#2A2016] border border-amber-600/40 text-amber-200 shadow-lg animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        {tAdmin('waitlistWaterfall')}
                      </div>
                      <div className="text-xs text-amber-200/90">
                        {tAdmin('timeRemaining', {
                          mins: Math.floor(activeWaterfallSecondsRemaining / 60),
                          secs: (activeWaterfallSecondsRemaining % 60).toString().padStart(2, '0'),
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => tickWaterfallTimer()}
                      className="px-3 py-1.5 rounded-full bg-[#181614] border border-amber-500/40 text-amber-300 text-xs hover:bg-amber-900/40 transition-colors"
                    >
                      Step 1s
                    </button>
                    {waitlist
                      .filter((w) => w.sessionId === activeWaterfallSessionId && w.status === 'OFFERED')
                      .map((offered) => (
                        <div key={offered.id} className="flex items-center space-x-2">
                          <button
                            onClick={() => claimWaitlistOffer(offered.id)}
                            className="px-3 py-1.5 rounded-full bg-[#C5A059] text-[#161412] text-xs font-semibold hover:bg-amber-300 transition-colors shadow-xs"
                          >
                            {tAdmin('claimNow')} ({offered.clientName})
                          </button>
                          <button
                            onClick={() => declineWaitlistOffer(offered.id)}
                            className="px-3 py-1.5 rounded-full bg-red-950/60 border border-red-700/60 text-red-300 text-xs hover:bg-red-900/80 transition-colors"
                          >
                            {tAdmin('declineSpot')}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registered Attendees */}
              <div className="bg-[#221E1A] rounded-2xl p-5 border border-[#3A332B]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-[#F5F2EB]">
                    {tAdmin('attendees')} ({bookings.length})
                  </h3>
                  <span className="text-[11px] text-[#8C8274]">
                    Tap "Cancel Spot" to test automatic 30-min waitlist waterfall
                  </span>
                </div>

                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3.5 rounded-xl bg-[#181614] border border-[#352E26] flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#F5F2EB] flex items-center flex-wrap gap-2">
                          <span>{booking.clientName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A231C] text-[#C5A059]">
                            {booking.paymentMethod}
                          </span>
                          {booking.remittanceLast5 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 font-mono">
                              {locale === 'zh-TW' ? `末五碼: ${booking.remittanceLast5}` : `Acct Last 5: ${booking.remittanceLast5}`}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8C8274] mt-0.5">
                          {booking.clientEmail}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => checkInClient(booking.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            booking.status === 'CHECKED_IN'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-[#2A2520] text-[#E0D8CE] hover:bg-[#352E26] border border-[#3D352E]'
                          }`}
                        >
                          {booking.status === 'CHECKED_IN' ? tAdmin('checkedIn') : tAdmin('checkIn')}
                        </button>

                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50 transition-colors"
                        >
                          {tAdmin('cancelBooking')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waitlist Queue */}
              <div className="bg-[#221E1A] rounded-2xl p-5 border border-[#3A332B]">
                <h3 className="text-sm font-medium text-[#F5F2EB] mb-4">
                  {tAdmin('waitlistQueue')} ({waitlist.length})
                </h3>

                <div className="space-y-3">
                  {waitlist.map((w) => (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-xl bg-[#181614] border border-[#352E26] flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#F5F2EB] flex items-center space-x-2">
                          <span className="text-[#C5A059] font-mono">#{w.priorityOrder}</span>
                          <span>{w.clientName}</span>
                          {w.mode === 'VIP_PREAUTH' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8C8274] mt-0.5">
                          {w.clientPhone}
                        </div>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          w.status === 'OFFERED'
                            ? 'bg-amber-400 text-[#161412] font-bold animate-pulse'
                            : 'bg-[#2A231C] text-[#8C8274]'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 4: INBOX & MESSAGING SUITE ($0 BACKEND COST) */}
        {activeAdminTab === 'messages' && (
          <div className="bg-[#221E1A] rounded-3xl border border-[#3A332B] overflow-hidden shadow-2xl">
            {/* Inbox Header Banner */}
            <div className="p-5 bg-[#28231E] border-b border-[#3A332B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-serif font-medium text-[#F5F2EB] flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-[#C5A059]" />
                  <span>{tAdmin('inboxTitle')}</span>
                </h3>
                <p className="text-xs text-[#8C8274] mt-0.5">
                  {tAdmin('inboxSubtitle')}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-[#181614] border border-[#3D352E] text-[#C5A059]">
                  LINE OA: {studio.communication?.lineOaEnabled ? '已連線 (@sol_sanctuary_tw)' : '未啟用'}
                </span>
              </div>
            </div>

            {/* 3-Column Studio Chat Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
              {/* Left Column: Conversations List (4 cols) */}
              <div className="md:col-span-4 border-r border-[#302B24] bg-[#1E1B18]/60 p-3 overflow-y-auto max-h-[620px]">
                <div className="text-[11px] font-semibold text-[#8C8274] uppercase tracking-wider px-2 py-1 mb-2">
                  {tAdmin('allConversations')} ({conversations.length})
                </div>

                <div className="space-y-2">
                  {conversations.map((conv) => {
                    const isSelected = conv.id === (currentConv?.id);
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-[#2E2822] border-[#C5A059]/60 shadow-md'
                            : 'bg-[#221E1A] border-[#302B24] hover:bg-[#28231D]'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={conv.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={conv.studentName}
                              className="w-8 h-8 rounded-full object-cover border border-[#443B30]"
                            />
                            <div>
                              <div className="text-xs font-semibold text-[#F5F2EB]">
                                {conv.studentName}
                              </div>
                              <div className="text-[10px] text-[#C5A059]">
                                {conv.sessionTitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-1">
                            <span className="text-[10px] text-[#706658]">
                              {conv.lastMessageTime}
                            </span>
                            {conv.channel === 'LINE_OA' ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                LINE OA
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#332B22] text-[#E0C99E]">
                                In-App
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-[#8C8274] line-clamp-1 mt-1">
                          {conv.lastMessage}
                        </p>

                        {conv.unreadCount > 0 && (
                          <div className="mt-2 flex justify-end">
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500 text-[#161412] font-bold">
                              {conv.unreadCount} 新訊息
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Middle Column: Active Chat Thread (5 cols) */}
              <div className="md:col-span-5 flex flex-col justify-between border-r border-[#302B24] bg-[#1C1917]">
                {currentConv ? (
                  <>
                    {/* Active Thread Header */}
                    <div className="p-3.5 bg-[#24201C] border-b border-[#302B24] flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={currentConv.studentAvatar}
                          alt={currentConv.studentName}
                          className="w-8 h-8 rounded-full object-cover border border-[#443B30]"
                        />
                        <div>
                          <div className="text-xs font-semibold text-[#F5F2EB]">
                            {currentConv.studentName}
                          </div>
                          <div className="text-[10px] text-[#8C8274]">
                            {currentConv.sessionTitle} ({currentConv.sessionTime})
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        {currentConv.channel === 'LINE_OA' ? 'LINE OA 雙向同步' : '站內即時通訊'}
                      </span>
                    </div>

                    {/* Messages Bubble Scroll Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[440px]">
                      {currentConvMessages.map((msg) => {
                        const isInstructor = msg.senderRole === 'INSTRUCTOR';
                        const isSystem = msg.senderRole === 'SYSTEM';

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 text-xs text-amber-200">
                              <div className="font-semibold text-amber-300 flex items-center space-x-1.5 mb-1">
                                <span>📢</span>
                                <span>{msg.senderName}</span>
                              </div>
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isInstructor ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-[#706658]">
                              <span>{msg.senderName}</span>
                              {msg.channel === 'LINE_OA' && (
                                <span className="text-[9px] px-1 py-0.1 bg-emerald-950 text-emerald-400 rounded">
                                  LINE
                                </span>
                              )}
                            </div>

                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                                isInstructor
                                  ? 'bg-[#C5A059] text-[#161412] font-medium rounded-br-xs'
                                  : 'bg-[#28231E] text-[#F5F2EB] border border-[#3A332B] rounded-bl-xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>

                            <span className="text-[9px] text-[#706658] mt-1 font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Reply Preset Chips */}
                    <div className="p-2.5 bg-[#221E1A] border-t border-[#302B24] flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                      <button
                        type="button"
                        onClick={() => handleQuickReply('您好！課程適合所有程度學員，請自備防滑襪與水壺喔。')}
                        className="text-[11px] px-3 py-1 rounded-full bg-[#181614] border border-[#3A332B] text-[#E0D8CE] hover:text-[#C5A059] shrink-0 transition-colors"
                      >
                        防滑襪與水壺
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickReply('沒問題，教室有提供專屬置物櫃與更衣空間。')}
                        className="text-[11px] px-3 py-1 rounded-full bg-[#181614] border border-[#3A332B] text-[#E0D8CE] hover:text-[#C5A059] shrink-0 transition-colors"
                      >
                        置物櫃與更衣室
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickReply('感謝詢問！本堂課尚有名額，歡迎直接於頁面點選預約。')}
                        className="text-[11px] px-3 py-1 rounded-full bg-[#181614] border border-[#3A332B] text-[#E0D8CE] hover:text-[#C5A059] shrink-0 transition-colors"
                      >
                        尚有名額歡迎預約
                      </button>
                    </div>

                    {/* Reply Form */}
                    <form onSubmit={handleSendReply} className="p-3 bg-[#24201C] border-t border-[#302B24] flex items-center space-x-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={tAdmin('replyPlaceholder')}
                        className="flex-1 px-4 py-2 rounded-full bg-[#181614] border border-[#3A332B] text-xs text-[#F5F2EB] placeholder:text-[#706658] focus:outline-none focus:border-[#C5A059]"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="w-9 h-9 rounded-full bg-[#C5A059] text-[#161412] flex items-center justify-center hover:bg-[#D4AF37] disabled:opacity-40 transition-colors shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-[#706658]">
                    {tAdmin('noConversations')}
                  </div>
                )}
              </div>

              {/* Right Column: Student Profile & Passes Sidebar (3 cols) */}
              <div className="md:col-span-3 p-4 bg-[#1E1B18]/40 space-y-5">
                <div className="text-[11px] font-semibold text-[#8C8274] uppercase tracking-wider mb-2">
                  {tAdmin('studentInfoTitle')}
                </div>

                {currentConv && (
                  <>
                    {/* Student Basic Card */}
                    <div className="text-center p-4 bg-[#24201C] rounded-2xl border border-[#302B24]">
                      <img
                        src={currentConv.studentAvatar}
                        alt={currentConv.studentName}
                        className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border border-[#443B30]"
                      />
                      <h4 className="text-sm font-semibold text-[#F5F2EB]">
                        {currentConv.studentName}
                      </h4>
                      <p className="text-[11px] text-[#8C8274]">
                        {currentConv.studentEmail}
                      </p>
                      {currentConv.studentPhone && (
                        <p className="text-[11px] text-[#C5A059] font-mono mt-0.5">
                          {currentConv.studentPhone}
                        </p>
                      )}
                    </div>

                    {/* Active Passes */}
                    <div className="p-3.5 bg-[#24201C] rounded-2xl border border-[#302B24]">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#C5A059] mb-2">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>{tAdmin('studentActivePasses')}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#181614] border border-[#352E26] text-xs">
                        <div className="font-medium text-[#F5F2EB]">5 堂精選課包 (Sol Sanctuary)</div>
                        <div className="text-[#C5A059] font-mono mt-1 font-bold">剩餘 2 堂額度</div>
                        <div className="text-[10px] text-[#706658] mt-0.5">到期日：2027年01月30日</div>
                      </div>
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="p-3.5 bg-[#24201C] rounded-2xl border border-[#302B24]">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#EAD8B1] mb-2">
                        <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{tAdmin('studentUpcomingClasses')}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#181614] border border-[#352E26] text-xs space-y-1">
                        <div className="font-medium text-[#F5F2EB]">{currentConv.sessionTitle}</div>
                        <div className="text-[11px] text-[#8C8274] font-mono">週三 08:00 - 08:50</div>
                        <span className="inline-block text-[9px] px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-400 font-medium">
                          席位已確認
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 5: PAYMENT METHODS (GLOBAL + TAIWAN) */}
        {activeAdminTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-[#F5F2EB] tracking-wide">
                  {tAdmin('paymentSettingsTitle')}
                </h3>
                <p className="text-xs text-[#8C8274]">
                  {tAdmin('paymentSettingsSubtitle')}
                </p>
              </div>

              {paymentSavedToast && (
                <div className="px-3 py-1.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs flex items-center space-x-1.5 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>已儲存付款設定！</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSavePayments} className="space-y-6">
              {/* Card 1: Stripe Connect (Card / Apple Pay / GPay) */}
              <div className="bg-[#221E1A] rounded-2xl p-6 border border-[#3A332B] relative shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2D261E] border border-[#44392D] flex items-center justify-center text-[#C5A059]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-medium text-[#F5F2EB]">
                        {tAdmin('stripeCardApplePayTitle')}
                      </h4>
                      <p className="text-xs text-[#8C8274]">
                        {tAdmin('stripeCardApplePayDesc')}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{tAdmin('stripeConnectedBadge')}</span>
                  </span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-[#181614] border border-[#352E26] flex items-center justify-between text-xs text-[#A89F91]">
                  <div>
                    <span className="text-[#8C8274]">直連帳戶代號: </span>
                    <span className="font-mono text-[#F5F2EB]">{studio.paymentMethods?.stripe.accountName || 'acct_sol_sanctuary_8829'}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">0% 抽成 • 自動結清撥款</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#302B24] text-xs">
                  <div>
                    <label className="block text-[#A89F91] mb-1 font-medium">
                      {locale === 'zh-TW' ? 'Stripe Publishable Key (公開金鑰 pk_...)' : 'Stripe Publishable Key (pk_...)'}
                    </label>
                    <input
                      type="text"
                      value={stripePublishableKey}
                      onChange={(e) => setStripePublishableKey(e.target.value)}
                      placeholder="pk_live_... or pk_test_..."
                      className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A89F91] mb-1 font-medium">
                      {locale === 'zh-TW' ? 'Stripe Secret Key (私密金鑰 sk_... 啟用真實結帳跳轉)' : 'Stripe Secret Key (sk_... enables live Checkout)'}
                    </label>
                    <input
                      type="password"
                      value={stripeSecretKey}
                      onChange={(e) => setStripeSecretKey(e.target.value)}
                      placeholder="sk_live_... or sk_test_..."
                      className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: LINE Pay Mobile Payment */}
              <div className="bg-[#221E1A] rounded-2xl p-6 border border-[#3A332B] relative shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-medium text-[#F5F2EB]">
                        {tAdmin('linePayTitle')}
                      </h4>
                      <p className="text-xs text-[#8C8274]">
                        {tAdmin('linePayDesc')}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={linePayEnabled}
                      onChange={(e) => setLinePayEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#352E26] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {linePayEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#302B24] text-xs">
                    <div>
                      <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('linePayChannelId')}</label>
                      <input
                        type="text"
                        value={linePayChannelId}
                        onChange={(e) => setLinePayChannelId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('linePayChannelSecret')}</label>
                      <input
                        type="password"
                        value={linePayChannelSecret}
                        onChange={(e) => setLinePayChannelSecret(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A89F91] mb-1 font-medium">
                        {locale === 'zh-TW' ? '自訂收款 QR Code 圖片網址 (選填)' : 'Custom QR Code Image URL (Optional)'}
                      </label>
                      <input
                        type="url"
                        value={linePayQrCodeUrl}
                        onChange={(e) => setLinePayQrCodeUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: JKOPAY 街口支付 */}
              <div className="bg-[#221E1A] rounded-2xl p-6 border border-[#3A332B] relative shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-700/60 flex items-center justify-center text-red-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-medium text-[#F5F2EB]">
                        {tAdmin('jkoPayTitle')}
                      </h4>
                      <p className="text-xs text-[#8C8274]">
                        {tAdmin('jkoPayDesc')}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jkoPayEnabled}
                      onChange={(e) => setJkoPayEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#352E26] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {jkoPayEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#302B24] text-xs">
                    <div>
                      <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('jkoPayMerchantId')}</label>
                      <input
                        type="text"
                        value={jkoPayMerchantId}
                        onChange={(e) => setJkoPayMerchantId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A89F91] mb-1 font-medium">
                        {locale === 'zh-TW' ? '街口收款 QR Code 圖片網址 (選填)' : 'JKOPAY QR Code Image URL (Optional)'}
                      </label>
                      <input
                        type="url"
                        value={jkoPayQrCodeUrl}
                        onChange={(e) => setJkoPayQrCodeUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card 4: Bank Transfer / ATM */}
              <div className="bg-[#221E1A] rounded-2xl p-6 border border-[#3A332B] relative shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2D261E] border border-[#44392D] flex items-center justify-center text-[#C5A059]">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-medium text-[#F5F2EB]">
                        {tAdmin('bankTransferTitle')}
                      </h4>
                      <p className="text-xs text-[#8C8274]">
                        {tAdmin('bankTransferDesc')}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bankEnabled}
                      onChange={(e) => setBankEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#352E26] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5A059]"></div>
                  </label>
                </div>

                {bankEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#302B24] text-xs">
                    <div>
                      <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('bankName')}</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('bankCode')}</label>
                      <input
                        type="text"
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('bankAccount')}</label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('bankAccountName')}</label>
                      <input
                        type="text"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#C5A059] text-[#161412] text-xs font-semibold hover:bg-[#D4AF37] transition-all shadow-md"
                >
                  {tAdmin('savePaymentConfig')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUB-TAB 6: STUDIO POLICIES & COMMUNICATION */}
        {activeAdminTab === 'policies' && (
          <div className="space-y-6 max-w-3xl">
            {/* Part 1: Automated Waitlist & Cancellation Policies */}
            <div className="bg-[#221E1A] rounded-2xl p-6 border border-[#3A332B]">
              <h3 className="font-serif text-lg font-medium text-[#F5F2EB] mb-2">
                {tAdmin('studioRulesTitle')}
              </h3>
              <p className="text-xs text-[#8C8274] mb-6">
                Configure cutoff policies and automated cascade intervals. All rules execute asynchronously with zero manual intervention.
              </p>

              <form onSubmit={handleSavePolicies} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#E0D8CE] mb-1">
                    {tAdmin('cancellationCutoff')}: <span className="text-[#C5A059] font-mono">{cancelCutoff} {tAdmin('hours')}</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="48"
                    step="2"
                    value={cancelCutoff}
                    onChange={(e) => setCancelCutoff(Number(e.target.value))}
                    className="w-full accent-[#C5A059]"
                  />
                  <p className="text-xs text-[#8C8274] mt-1">
                    {tAdmin('cancellationCutoffDesc')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E0D8CE] mb-1">
                    {tAdmin('waitlistOfferTimeout')}: <span className="text-[#C5A059] font-mono">{waitlistMins} {tAdmin('minutes')}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={waitlistMins}
                    onChange={(e) => setWaitlistMins(Number(e.target.value))}
                    className="w-full accent-[#C5A059]"
                  />
                  <p className="text-xs text-[#8C8274] mt-1">
                    {tAdmin('waitlistOfferTimeoutDesc')}
                  </p>
                </div>

                {/* Top Announcement Banner & Public Marketplace Opt-In */}
                <div className="pt-4 border-t border-[#302B24] space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#E0D8CE] mb-1">
                      {locale === 'zh-TW'
                        ? '教室最新公告橫幅 (顯示於您的專屬預約頁頂部)'
                        : 'Studio Top Announcement Banner (Displayed on your private /studio page)'}
                    </label>
                    <input
                      type="text"
                      value={announcementBanner}
                      onChange={(e) => setAnnouncementBanner(e.target.value)}
                      placeholder={
                        locale === 'zh-TW'
                          ? '例如：新學員首堂體驗現折 NT$ 200'
                          : 'e.g. New students get $10 off their first Reformer class!'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181614] border border-[#3A332B] text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#181614] border border-[#352E26] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#F5F2EB]">
                        {locale === 'zh-TW'
                          ? '加入「探索精選課程 (Explore Studios)」城市公開名錄'
                          : 'Opt-in to Public "Explore Studios" City Directory'}
                      </div>
                      <div className="text-[11px] text-[#8C8274] mt-0.5">
                        {locale === 'zh-TW'
                          ? '開啟後，附近學員可於探索頁找到您的課程；您的專屬連結 (/studio/' + studio.slug + ') 仍保持 100% 私密無競品廣告。'
                          : 'Let local students discover your classes in the Explore tab while keeping your direct /studio link 100% private.'}
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                      <input
                        type="checkbox"
                        checked={discoverable}
                        onChange={(e) => setDiscoverable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#352E26] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5A059]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A89F91] mb-1">
                      {locale === 'zh-TW' ? '所在城市與行政區 (City / District)' : 'Studio City / Neighborhood'}
                    </label>
                    <input
                      type="text"
                      value={studioCity}
                      onChange={(e) => setStudioCity(e.target.value)}
                      placeholder="e.g. Taipei • Da-an District (台北大安)"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                {policiesSavedToast && (
                  <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs">
                    {locale === 'zh-TW' ? '✓ 已儲存教室規則與最新公告設定！' : '✓ Studio rules & announcement saved!'}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#1A1714] border border-[#352E26] text-xs text-[#A89F91]">
                  {tAdmin('flatSubscriptionBanner')}
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#C5A059] text-[#161412] text-xs font-semibold hover:bg-[#D4AF37] transition-all shadow-md"
                >
                  {tCommon('save')}
                </button>
              </form>
            </div>

            {/* Part 2: Communication Channels & LINE OA Integration */}
            <div className="bg-[#221E1A] rounded-2xl p-6 border border-[#3A332B]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-lg font-medium text-[#F5F2EB]">
                  {tAdmin('commSettingsTitle')}
                </h3>
                {commSavedToast && (
                  <span className="text-xs text-emerald-400 animate-in fade-in">
                    已儲存通訊設定！
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8C8274] mb-6">
                {tAdmin('commSettingsSubtitle')}
              </p>

              <form onSubmit={handleSaveCommunication} className="space-y-5">
                {/* LINE OA Toggle */}
                <div className="p-4 rounded-xl bg-[#181614] border border-[#352E26] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      LINE
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-[#F5F2EB]">
                        {tAdmin('lineOaEnableToggle')}
                      </div>
                      <div className="text-[11px] text-[#8C8274]">
                        支援課堂名冊自動推播，學員回覆直入 Aura Flow 收件匣
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lineOaActive}
                      onChange={(e) => setLineOaActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#352E26] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {lineOaActive && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-[#A89F91] mb-1">
                        {tAdmin('lineChannelId')}
                      </label>
                      <input
                        type="text"
                        value={lineOaChannelId}
                        onChange={(e) => setLineOaChannelId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-xs text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#A89F91] mb-1">
                          {tAdmin('lineChannelSecret')}
                        </label>
                        <input
                          type="password"
                          value={lineOaChannelSecret}
                          onChange={(e) => setLineOaChannelSecret(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-xs text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#A89F91] mb-1">
                          {tAdmin('lineAccessToken')}
                        </label>
                        <input
                          type="password"
                          value={lineOaAccessToken}
                          onChange={(e) => setLineOaAccessToken(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-xs text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>

                    {/* LINE Webhook URL & Live Test Push */}
                    <div className="p-3.5 rounded-xl bg-[#181614] border border-[#352E26] space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-emerald-400">
                            {locale === 'zh-TW' ? 'LINE Developers 雙向訊息 Webhook 網址' : 'LINE Developers Inbound Webhook URL'}
                          </div>
                          <div className="text-[11px] text-[#8C8274] font-mono break-all mt-0.5">
                            https://auraflow-bay.vercel.app/api/line-webhook
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText('https://auraflow-bay.vercel.app/api/line-webhook');
                              setWebhookCopied(true);
                              setTimeout(() => setWebhookCopied(false), 2500);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#2A2520] hover:bg-[#383028] border border-[#3D352E] text-[11px] text-[#E0D8CE] flex items-center space-x-1"
                          >
                            {webhookCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{webhookCopied ? (locale === 'zh-TW' ? '已複製' : 'Copied') : (locale === 'zh-TW' ? '複製 Webhook' : 'Copy URL')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleTestLinePush}
                            className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-[11px] text-emerald-300 font-semibold flex items-center space-x-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>{locale === 'zh-TW' ? '測試發送 LINE 推播' : 'Test LINE Push'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#302B24]">
                  <div>
                    <label className="block text-xs font-medium text-[#A89F91] mb-1">
                      {tAdmin('instagramHandle')}
                    </label>
                    <input
                      type="text"
                      value={igHandle}
                      onChange={(e) => setIgHandle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A89F91] mb-1">
                      {tAdmin('supportEmail')}
                    </label>
                    <input
                      type="email"
                      value={commEmail}
                      onChange={(e) => setCommEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                {/* Resend Email Notification API */}
                <div className="p-4 rounded-xl bg-[#181614] border border-[#352E26] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-[#F5F2EB] flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{locale === 'zh-TW' ? '自動預約確認信與候補通知 (Resend API)' : 'Automated Booking Confirmation Emails (Resend API)'}</span>
                      </div>
                      <p className="text-[11px] text-[#8C8274] mt-0.5">
                        {locale === 'zh-TW'
                          ? '學員完成預約時自動發送 HTML 電子票券與課前提醒信。'
                          : 'Automatically dispatches HTML booking confirmation passes to students.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestEmailSend}
                      className="px-3 py-1.5 rounded-lg bg-[#2A2520] hover:bg-[#383028] border border-[#3D352E] text-[11px] text-[#C5A059] font-semibold shrink-0 flex items-center space-x-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{locale === 'zh-TW' ? '發送測試確認信' : 'Send Test Email'}</span>
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#A89F91] mb-1">
                      Resend API Key (re_...)
                    </label>
                    <input
                      type="password"
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      placeholder="re_123456789..."
                      className="w-full px-3 py-2 rounded-xl bg-[#221E1A] border border-[#3A332B] text-xs text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                {testActionResult && (
                  <div className="p-3 rounded-xl bg-[#181614] border border-[#C5A059]/60 text-xs text-[#EAD8B1]">
                    {testActionResult}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#C5A059] text-[#161412] text-xs font-semibold hover:bg-[#D4AF37] transition-all shadow-md"
                  >
                    儲存通訊管道設定
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 1-Click Roster Broadcast Modal */}
      {broadcastingSession && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#221E1A] rounded-3xl p-6 border border-[#3A332B] w-full max-w-lg text-[#F5F2EB] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-[#3A332B] pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#C5A059] flex items-center space-x-2">
                  <Megaphone className="w-5 h-5 text-[#C5A059]" />
                  <span>{tAdmin('broadcastModalTitle')}</span>
                </h3>
                <p className="text-xs text-[#8C8274] mt-0.5">
                  {broadcastingSession.title} ({broadcastingSession.startTime.substring(11, 16)} - {broadcastingSession.endTime.substring(11, 16)})
                </p>
              </div>
              <button
                onClick={() => setBroadcastingSession(null)}
                className="text-[#8C8274] hover:text-[#F5F2EB] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              {/* Audience info */}
              <div className="p-3 bg-[#181614] rounded-xl border border-[#352E26] flex items-center justify-between">
                <span className="text-[#8C8274]">{tAdmin('broadcastTarget')}</span>
                <span className="text-[#C5A059] font-semibold">
                  {tAdmin('broadcastTargetRoster', { count: broadcastingSession.bookedCount })}
                </span>
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="block text-[#A89F91] mb-2 font-medium">{tAdmin('broadcastChannels')}</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-[#E0D8CE] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastInApp}
                      onChange={(e) => setBroadcastInApp(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#C5A059]"
                    />
                    <span>{tAdmin('broadcastChannelInApp')}</span>
                  </label>
                  <label className="flex items-center space-x-2 text-[#E0D8CE] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastLine}
                      onChange={(e) => setBroadcastLine(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#C5A059]"
                    />
                    <span>{tAdmin('broadcastChannelLine')} (@sol_sanctuary_tw)</span>
                  </label>
                </div>
              </div>

              {/* Quick Template Chips */}
              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('broadcastQuickTemplates')}</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBroadcastText('今日上課請攜帶乾淨防滑襪與水壺，教室已為各位備妥專屬器械、酒精擦巾與置物櫃！')}
                    className="px-2.5 py-1 rounded-lg bg-[#2E2822] text-[#E0C99E] border border-[#44392D] text-[11px] hover:bg-[#3A332C]"
                  >
                    防滑襪與水壺提醒
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastText('溫馨提醒：請提早 10 分鐘抵達教室進行關節熱身，課程將準時開始以維持完整訓練節奏。')}
                    className="px-2.5 py-1 rounded-lg bg-[#2E2822] text-[#E0C99E] border border-[#44392D] text-[11px] hover:bg-[#3A332C]"
                  >
                    提早 10 分鐘暖身
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastText('教室位於 2 樓，備有密碼鎖置物櫃與更衣淋浴間，如有身體不適請於課前向教練說明。')}
                    className="px-2.5 py-1 rounded-lg bg-[#2E2822] text-[#E0C99E] border border-[#44392D] text-[11px] hover:bg-[#3A332C]"
                  >
                    更衣置物與更衣設施
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('broadcastContent')}</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder={tAdmin('broadcastPlaceholder')}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {broadcastSentToast && (
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>{tAdmin('broadcastSuccess')}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#3A332B]">
                <button
                  type="button"
                  onClick={() => setBroadcastingSession(null)}
                  className="px-4 py-2 rounded-full border border-[#3A332B] text-[#A89F91] hover:text-[#F5F2EB]"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!broadcastText.trim()}
                  className="px-5 py-2 rounded-full bg-[#C5A059] text-[#161412] font-semibold hover:bg-[#D4AF37] transition-all disabled:opacity-40"
                >
                  {tAdmin('sendBroadcast')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Class Modal */}
      {showNewClassModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#221E1A] rounded-3xl p-6 border border-[#3A332B] w-full max-w-lg text-[#F5F2EB] shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-[#3A332B] pb-3">
              <h3 className="font-serif text-xl font-medium text-[#C5A059]">
                {tAdmin('createClass')}
              </h3>
              <button
                onClick={() => setShowNewClassModal(false)}
                className="text-[#8C8274] hover:text-[#F5F2EB] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('className')}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={tAdmin('classNamePlaceholder')}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Flexible Class Category with Custom Input & Clickable Quick Tags */}
              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('category')}</label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={tAdmin('categoryCustomPlaceholder')}
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#706658] mr-1">{tAdmin('suggestedTagsLabel')}</span>
                  {['皮拉提', '瑜珈', '私人教練', '頌缽音療', '重訓體能', 'Reformer', 'Mat Flow', 'Barre'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewCategory(tag)}
                      className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-colors ${
                        newCategory === tag
                          ? 'bg-[#C5A059] text-[#161412] font-semibold border-[#C5A059]'
                          : 'bg-[#1E1B18] text-[#A89F91] border-[#3A332B] hover:text-[#F5F2EB]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('instructor')}</label>
                  <input
                    type="text"
                    required
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('room')}</label>
                  <input
                    type="text"
                    required
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('hardCapacity')}</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('price')} ({CURRENCY_CONFIGS[currency].symbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#3A332B]">
                <button
                  type="button"
                  onClick={() => setShowNewClassModal(false)}
                  className="px-4 py-2 rounded-full border border-[#3A332B] text-[#A89F91] hover:text-[#F5F2EB]"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#C5A059] text-[#161412] font-semibold hover:bg-[#D4AF37] transition-all"
                >
                  {tAdmin('saveSession')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Pack Modal (Edit & Create) */}
      {showPackModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#221E1A] rounded-3xl p-6 border border-[#3A332B] w-full max-w-lg text-[#F5F2EB] shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-[#3A332B] pb-3">
              <h3 className="font-serif text-xl font-medium text-[#C5A059]">
                {editingPackId ? tAdmin('editPack') : tAdmin('createNewPack')}
              </h3>
              <button
                onClick={() => setShowPackModal(false)}
                className="text-[#8C8274] hover:text-[#F5F2EB] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePack} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('packName')}</label>
                <input
                  type="text"
                  required
                  value={packNameInput}
                  onChange={(e) => setPackNameInput(e.target.value)}
                  placeholder="例如：5 堂精選課包"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('packPrice')} ({CURRENCY_CONFIGS[currency].symbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={packPriceInput}
                    onChange={(e) => setPackPriceInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('creditsCount', { count: '' })}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={packCreditsInput}
                    onChange={(e) => setPackCreditsInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('validityDaysInput')}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={packExpiryInput}
                    onChange={(e) => setPackExpiryInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-[#E0D8CE] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={packPopularInput}
                      onChange={(e) => setPackPopularInput(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#C5A059]"
                    />
                    <span className="text-xs">{tAdmin('popularBadgeToggle')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">{tAdmin('packDescription')}</label>
                <textarea
                  rows={2}
                  value={packDescInput}
                  onChange={(e) => setPackDescInput(e.target.value)}
                  placeholder={tAdmin('packDescriptionPlaceholder')}
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#3A332B]">
                {editingPackId && classPacks.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(locale === 'zh-TW' ? '確定要刪除此課包嗎？' : 'Delete this class pack?')) {
                        deleteClassPack(editingPackId);
                        setShowPackModal(false);
                      }
                    }}
                    className="text-rose-400 hover:text-rose-300 text-xs flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{tAdmin('deletePack')}</span>
                  </button>
                ) : <div />}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPackModal(false)}
                    className="px-4 py-2 rounded-full border border-[#3A332B] text-[#A89F91] hover:text-[#F5F2EB]"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#C5A059] text-[#161412] font-semibold hover:bg-[#D4AF37] transition-all"
                  >
                    {tAdmin('savePack')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

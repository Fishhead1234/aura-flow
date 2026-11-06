import React, { useEffect, useRef, useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation, formatCurrency } from '../i18n/auraI18n';
import {
  X,
  CreditCard,
  Check,
  Sparkles,
  AlertCircle,
  Copy,
  CheckCheck,
  QrCode,
  Smartphone,
  Building,
  Share2,
} from 'lucide-react';
import { PaymentMethodType } from '../types/aura';
import { SessionCareCard } from './StudentClassDetailModal';
import confetti from 'canvas-confetti';

export const BookingDrawer: React.FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    locale,
    currency,
    studio,
    isBookingDrawerOpen,
    closeBookingDrawer,
    selectedSessionForBooking,
    userPass,
    confirmBooking,
    currentUser,
    simulateStripePayment,
  } = useAuraStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(
    userPass.creditsLeft > 0 ? 'PASS_CREDIT' : 'APPLE_PAY'
  );
  const [directPaymentTab, setDirectPaymentTab] = useState<'CARD' | 'LINE_PAY' | 'JKOPAY' | 'BANK'>('CARD');
  const [copiedBank, setCopiedBank] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const [clientName, setClientName] = useState(currentUser.name || 'Maya Lin');
  const [clientEmail, setClientEmail] = useState(currentUser.email || 'maya@example.com');
  const [remittanceLast5, setRemittanceLast5] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [copiedShareText, setCopiedShareText] = useState(false);

  const payments = studio.paymentMethods;

  // Sync state when active persona changes
  useEffect(() => {
    if (userPass.creditsLeft > 0) {
      setSelectedMethod('PASS_CREDIT');
    } else {
      setSelectedMethod('APPLE_PAY');
      setDirectPaymentTab('CARD');
    }
    setClientName(currentUser.name);
    setClientEmail(currentUser.email);
  }, [userPass.creditsLeft, currentUser]);

  const tCommon = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'common', key, params);
  const tBooking = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'booking', key, params);

  // Sync modal state with <dialog> element
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isBookingDrawerOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setBookingSuccess(false);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isBookingDrawerOpen]);

  const handleClose = () => {
    closeBookingDrawer();
  };

  const handleCopyAccount = (accountNo: string) => {
    navigator.clipboard?.writeText(accountNo);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleConfirm = async () => {
    if (!selectedSessionForBooking) return;
    setIsSubmitting(true);

    // Attempt real gateway checkout whenever Stripe Secret Key or LINE Pay credentials are configured (or when simulateStripePayment = false)
    const hasRealStripeKey = Boolean(payments?.stripe.secretKey);
    const hasRealLinePayKey = Boolean(payments?.linePay.channelId && payments?.linePay.channelSecret);

    if (
      (!simulateStripePayment || hasRealStripeKey || hasRealLinePayKey) &&
      (selectedMethod === 'STRIPE_CARD' || selectedMethod === 'APPLE_PAY' || selectedMethod === 'LINE_PAY')
    ) {
      try {
        const resp = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: selectedMethod,
            amount: selectedSessionForBooking.price,
            currency,
            sessionTitle: selectedSessionForBooking.title,
            sessionId: selectedSessionForBooking.id,
            studioSlug: studio.slug,
            clientEmail,
            originUrl: typeof window !== 'undefined' ? window.location.origin : 'https://auraflow-bay.vercel.app',
            stripeSecretKey: payments?.stripe.secretKey,
            linePayChannelId: payments?.linePay.channelId,
            linePayChannelSecret: payments?.linePay.channelSecret,
            linePaySandbox: payments?.linePay.sandbox !== false,
          }),
        });
        const data = await resp.json();
        if (data.ok && !data.simulated && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
      } catch {
        // Fallback to local booking confirmation if offline
      }
    }

    setTimeout(() => {
      const res = confirmBooking(
        selectedSessionForBooking.id,
        selectedMethod,
        clientName,
        clientEmail,
        remittanceLast5
      );

      setIsSubmitting(false);

      if (res.success) {
        setBookingSuccess(true);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#B86B53', '#7D8D7B', '#C5A059'],
        });
      }
    }, 600);
  };

  const handleShareWithFriends = async () => {
    if (!selectedSessionForBooking) return;
    const studioLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://auraflow-bay.vercel.app'}/studio/${studio.slug}`;
    const shareText =
      locale === 'zh-TW'
        ? `✨ 我剛預約了【${studio.name}】的「${selectedSessionForBooking.title}」(${selectedSessionForBooking.startTime.substring(11, 16)} - ${selectedSessionForBooking.endTime.substring(11, 16)})！一起來上課吧 👉 ${studioLink}`
        : `✨ I just booked "${selectedSessionForBooking.title}" at ${studio.name}! Come join me 👉 ${studioLink}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${studio.name} • ${selectedSessionForBooking.title}`,
          text: shareText,
          url: studioLink,
        });
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }
    navigator.clipboard?.writeText(shareText);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 3000);
  };

  if (!selectedSessionForBooking) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-xs p-0 m-0 w-full max-w-md mx-auto my-auto fixed inset-x-0 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 rounded-t-3xl sm:rounded-3xl bg-[#F7F4EE] shadow-2xl border border-stone-200/80 overflow-hidden"
    >
      <div className="p-6 text-stone-900 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Drawer Header matching Screenshot 2 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-medium tracking-tight text-stone-900">
            {tBooking('checkoutTitle')}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-stone-200/60 flex items-center justify-center text-stone-600 hover:bg-stone-300/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {bookingSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-stone-900">
                {tBooking('bookingSuccess')}
              </h3>
              <p className="text-xs text-stone-600 max-w-xs mx-auto mt-1">
                {tBooking('bookingSuccessSub')}
              </p>
            </div>

            {/* Automated Pre-Class Reminder & Post-Class Homework Card on Booking Pass */}
            <SessionCareCard session={selectedSessionForBooking} defaultPhase="PRE_CLASS" />

            {/* Pre-formatted LINE & IG Story Share Preview */}
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 text-left text-xs space-y-2 shadow-2xs">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                {locale === 'zh-TW' ? 'LINE / IG 限時動態分享文案' : 'LINE & IG Story Invite Preview'}
              </div>
              <p className="text-stone-700 leading-relaxed text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                {locale === 'zh-TW'
                  ? `✨ 我剛預約了【${studio.name}】的「${selectedSessionForBooking.title}」(${selectedSessionForBooking.startTime.substring(11, 16)} - ${selectedSessionForBooking.endTime.substring(11, 16)})！一起來上課吧 👉 /studio/${studio.slug}`
                  : `✨ I just booked "${selectedSessionForBooking.title}" at ${studio.name}! Join me 👉 /studio/${studio.slug}`}
              </p>

              <button
                type="button"
                onClick={handleShareWithFriends}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>
                  {copiedShareText
                    ? locale === 'zh-TW'
                      ? '✓ 已複製 LINE / IG 邀請文案！'
                      : '✓ Invite Text Copied for LINE / IG!'
                    : locale === 'zh-TW'
                    ? '邀請好友一起上課 (Share with Friends)'
                    : 'Share with Friends (LINE / IG Story)'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded-2xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              {locale === 'zh-TW' ? '完成並返回課表' : 'Done & Return to Schedule'}
            </button>

            {/* Discreet Powered by Aura Flow Acquisition Footer */}
            <div className="pt-3 border-t border-stone-200/80">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  useAuraStore.getState().switchPersona('new_owner');
                }}
                className="text-[11px] text-stone-500 hover:text-stone-900 transition-colors"
              >
                <span>
                  {locale === 'zh-TW'
                    ? 'Powered by Aura Flow • 獨立教練與精品工作室預約系統 '
                    : 'Powered by Aura Flow • Boutique Studio Booking System '}
                </span>
                <span className="font-semibold text-aura-clay underline">
                  {locale === 'zh-TW' ? '[免費開通 ↗]' : '[Launch Free ↗]'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Session Summary Card matching Screenshot 2 */}
            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-stone-200/70 mb-3">
              <h4 className="font-serif text-base font-medium text-stone-900">
                {selectedSessionForBooking.title} - {formatCurrency(selectedSessionForBooking.price, currency, locale)}
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                {selectedSessionForBooking.startTime.substring(0, 10)} • {selectedSessionForBooking.startTime.substring(11, 16)} - {selectedSessionForBooking.endTime.substring(11, 16)}
              </p>
            </div>

            {/* Pre-Class Reminder / Post-Class Homework Card */}
            <div className="mb-5">
              <SessionCareCard session={selectedSessionForBooking} defaultPhase="PRE_CLASS" />
            </div>

            {/* Payment Method Section */}
            <div className="mb-5">
              <h3 className="font-serif text-lg font-medium text-stone-800 mb-3">
                {tBooking('paymentMethod')}
              </h3>

              <div className="space-y-3">
                {/* Option 1: Use 1 Class Pass Credit (if has pass) */}
                {userPass.creditsLeft > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('PASS_CREDIT')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                      selectedMethod === 'PASS_CREDIT'
                        ? 'bg-[#EFEAE2] border-stone-400 ring-1 ring-stone-400'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-stone-200/60 flex items-center justify-center text-stone-700">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-stone-900">
                          {tBooking('useClassPass')}
                        </div>
                        <div className="text-xs text-stone-500">
                          {tBooking('remainingCredits', { count: userPass.creditsLeft })}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedMethod === 'PASS_CREDIT'
                          ? 'border-aura-clay bg-aura-clay text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {selectedMethod === 'PASS_CREDIT' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                )}

                {/* Option 2: Direct Studio Payment Methods */}
                <div
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedMethod !== 'PASS_CREDIT'
                      ? 'bg-[#EFEAE2] border-stone-400 ring-1 ring-stone-400'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="text-xs font-semibold text-stone-700">
                      {locale === 'zh-TW' ? '工作室支援之多元收款管道' : 'Studio Accepted Payment Options'}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      0% 手續費
                    </span>
                  </div>

                  {/* Segmented selector tabs for payment methods */}
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-200/70 rounded-xl mb-3 text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setDirectPaymentTab('CARD');
                        setSelectedMethod('APPLE_PAY');
                      }}
                      className={`py-1.5 rounded-lg transition-all text-center ${
                        directPaymentTab === 'CARD'
                          ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {tBooking('payMethodStripe')}
                    </button>

                    {(!payments || payments.linePay.enabled) && (
                      <button
                        type="button"
                        onClick={() => {
                          setDirectPaymentTab('LINE_PAY');
                          setSelectedMethod('LINE_PAY');
                        }}
                        className={`py-1.5 rounded-lg transition-all text-center ${
                          directPaymentTab === 'LINE_PAY'
                            ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        LINE Pay
                      </button>
                    )}

                    {(!payments || payments.jkoPay.enabled) && (
                      <button
                        type="button"
                        onClick={() => {
                          setDirectPaymentTab('JKOPAY');
                          setSelectedMethod('JKOPAY');
                        }}
                        className={`py-1.5 rounded-lg transition-all text-center ${
                          directPaymentTab === 'JKOPAY'
                            ? 'bg-red-600 text-white shadow-2xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        街口支付
                      </button>
                    )}

                    {(!payments || payments.bankTransfer.enabled) && (
                      <button
                        type="button"
                        onClick={() => {
                          setDirectPaymentTab('BANK');
                          setSelectedMethod('BANK_TRANSFER');
                        }}
                        className={`py-1.5 rounded-lg transition-all text-center ${
                          directPaymentTab === 'BANK'
                            ? 'bg-[#1C1917] text-amber-300 shadow-2xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {tBooking('payMethodBank')}
                      </button>
                    )}
                  </div>

                  {/* Tab 1: Apple Pay & Credit Card */}
                  {directPaymentTab === 'CARD' && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod('APPLE_PAY')}
                        className="w-full h-11 rounded-xl bg-black text-white flex items-center justify-center space-x-1.5 hover:bg-neutral-800 transition-colors shadow-xs"
                      >
                        <span className="text-base font-semibold tracking-tighter">Pay</span>
                      </button>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedMethod('STRIPE_CARD')}
                          className="text-[11px] text-stone-600 hover:text-stone-900 underline underline-offset-2 flex items-center space-x-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{tBooking('payCard')}</span>
                        </button>
                        <span className="text-[10px] text-stone-400 font-mono">
                          Visa • MC • JCB • GPay
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: LINE Pay */}
                  {directPaymentTab === 'LINE_PAY' && (
                    <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-semibold text-emerald-800">LINE Pay 官方條碼付款</span>
                        </div>
                        <span className="text-[10px] text-stone-400">LINE Points 折抵</span>
                      </div>

                      <div className="flex items-center justify-center py-1">
                        <img
                          src={
                            payments?.linePay.qrCodeUrl ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                              `https://auraflow-bay.vercel.app/s/${studio.slug}?pay=linepay&session=${selectedSessionForBooking.id}&amt=${selectedSessionForBooking.price}`
                            )}`
                          }
                          alt="LINE Pay QR Code"
                          className="w-28 h-28 rounded-lg border border-emerald-200 p-1.5 bg-white shadow-2xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('LINE_PAY')}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>{tBooking('linePayCta')}</span>
                      </button>
                      <p className="text-[10px] text-stone-500 text-center">
                        {tBooking('linePayQrTip')}
                      </p>
                    </div>
                  )}

                  {/* Tab 3: JKOPAY */}
                  {directPaymentTab === 'JKOPAY' && (
                    <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                          <span className="text-xs font-semibold text-red-700">街口支付 (JKOPAY)</span>
                        </div>
                        <span className="text-[10px] text-stone-400">街口幣最高折抵 100%</span>
                      </div>

                      <div className="flex items-center justify-center py-1">
                        <img
                          src={
                            payments?.jkoPay.qrCodeUrl ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                              `https://auraflow-bay.vercel.app/s/${studio.slug}?pay=jkopay&session=${selectedSessionForBooking.id}&amt=${selectedSessionForBooking.price}`
                            )}`
                          }
                          alt="JKOPAY QR Code"
                          className="w-28 h-28 rounded-lg border border-red-200 p-1.5 bg-white shadow-2xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('JKOPAY')}
                        className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>{tBooking('jkoPayCta')}</span>
                      </button>
                      <p className="text-[10px] text-stone-500 text-center">
                        {tBooking('jkoPayQrTip')}
                      </p>
                    </div>
                  )}

                  {/* Tab 4: Bank Transfer / ATM */}
                  {directPaymentTab === 'BANK' && (
                    <div className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-2.5">
                      <div className="text-[11px] font-medium text-stone-700">
                        {tBooking('bankTransferInstructions')}
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-800 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                        <div className="flex justify-between">
                          <span className="text-stone-500">{tBooking('bankNameLabel')}:</span>
                          <span className="font-medium">{payments?.bankTransfer.bankName || '國泰世華商業銀行'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">{tBooking('bankCodeLabel')}:</span>
                          <span className="font-mono font-bold text-[#B86B53]">{payments?.bankTransfer.bankCode || '013'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">{tBooking('bankAccountLabel')}:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold tracking-wider">{payments?.bankTransfer.accountNumber || '013-50-6189201'}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount(payments?.bankTransfer.accountNumber || '013-50-6189201')}
                              className="px-2 py-0.5 rounded bg-stone-200 hover:bg-stone-300 text-[10px] font-semibold flex items-center space-x-1 transition-colors"
                            >
                              {copiedBank ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedBank ? tBooking('accountCopied') : tBooking('copyAccount')}</span>
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">{tBooking('bankAccountNameLabel')}:</span>
                          <span className="font-medium">{payments?.bankTransfer.accountName || '日光彼拉提斯工作室 (Elena Rostova)'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          {locale === 'zh-TW' ? '您的轉帳帳號後五碼 (對帳驗證用)' : 'Last 5 Digits of Your Bank Account'}
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          value={remittanceLast5}
                          onChange={(e) => setRemittanceLast5(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder={locale === 'zh-TW' ? '例如：58291' : 'e.g. 58291'}
                          className="w-full h-9 px-3 rounded-lg bg-stone-50 border border-stone-300 text-xs font-mono tracking-widest focus:outline-hidden focus:border-aura-clay"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transparent Fee Ledger matching Screenshot 2 */}
            <div className="bg-[#ECE7DF]/70 rounded-2xl p-4 space-y-2 mb-6 border border-stone-200/50 text-xs">
              <div className="flex items-center justify-between text-stone-700">
                <span>{tBooking('subtotal')}:</span>
                <span className="font-medium text-stone-900">
                  {selectedMethod === 'PASS_CREDIT'
                    ? tBooking('orCredit')
                    : formatCurrency(selectedSessionForBooking.price, currency, locale)}
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-700">
                <span className="flex items-center space-x-1">
                  <span>{tBooking('platformFee')}:</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                    0%
                  </span>
                </span>
                <span className="font-semibold text-emerald-800">
                  {tBooking('zeroPercent')}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-300 flex items-center justify-between font-serif text-sm font-semibold text-stone-900">
                <span>{tBooking('total')}:</span>
                <span>
                  {selectedMethod === 'PASS_CREDIT'
                    ? (locale === 'zh-TW' ? '1 堂課堂點數' : '1 Credit')
                    : formatCurrency(selectedSessionForBooking.price, currency, locale)}
                </span>
              </div>

              {selectedMethod !== 'PASS_CREDIT' && simulateStripePayment && (
                <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl flex items-center space-x-1.5 border border-amber-200">
                  <span className="font-semibold">⚡ Dev Sandbox:</span>
                  <span>
                    {locale === 'zh-TW'
                      ? 'Stripe 模擬測試扣款將自動核准（$0 真實支出）。'
                      : 'Stripe test charge will auto-approve ($0 real cost).'}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Action Button matching Screenshot 2 */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-2xl bg-[#3E423B] text-white font-medium text-sm hover:bg-stone-800 active:scale-[0.99] transition-all shadow-md flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>{tBooking('processingPayment')}</span>
              ) : (
                <span>{tBooking('confirmBooking')}</span>
              )}
            </button>
          </>
        )}
      </div>
    </dialog>
  );
};

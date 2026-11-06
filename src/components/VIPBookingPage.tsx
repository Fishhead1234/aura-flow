import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { formatCurrency } from '../i18n/auraI18n';
import { PaymentMethodType } from '../types/aura';
import {
  MapPin,
  Calendar,
  Clock,
  KeyRound,
  Ticket,
  CreditCard,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Users,
  QrCode,
} from 'lucide-react';
import { AuraLogoBadge } from './AuraLeafLogo';
import { QRShareModal, QRSharePayload } from './QRShareModal';

interface VIPBookingPageProps {
  inviteToken: string;
}

export const VIPBookingPage: React.FC<VIPBookingPageProps> = ({ inviteToken }) => {
  const {
    locale,
    currency,
    sessions,
    studios,
    studio,
    userPass,
    currentUser,
    confirmBooking,
    purchaseClassPack,
    navigateTo,
  } = useAuraStore();

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  // Find matching private session by inviteToken (fallback to first private session or first session)
  const session =
    sessions.find(
      (s) => s.inviteToken === inviteToken || `vip-${s.id}` === inviteToken
    ) ||
    sessions.find((s) => s.visibility === 'PRIVATE') ||
    sessions[0];

  const targetStudio =
    studios.find((st) => st.id === session?.studioId) || studio;

  const defaultInvitedStudent = session?.invitedStudents?.[0];
  const [studentName, setStudentName] = useState(
    defaultInvitedStudent?.name || currentUser.name || 'Maya Lin'
  );
  const [studentEmail, setStudentEmail] = useState(
    defaultInvitedStudent?.email || currentUser.email || 'maya@example.com'
  );
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const hasPassCredits = userPass && userPass.creditsLeft > 0;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    hasPassCredits ? 'PASS_CREDIT' : 'APPLE_PAY'
  );
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [qrPayload, setQrPayload] = useState<QRSharePayload | null>(null);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#141210] text-[#F5F2EB] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1E1A16] border border-[#3A332B] rounded-3xl p-6 text-center">
          <p className="text-sm text-[#A89F91]">
            {isZh ? '找不到此專屬邀請場次' : 'Private session invitation not found.'}
          </p>
          <button
            type="button"
            onClick={() => navigateTo({ path: 'public_studio', slug: studio.slug })}
            className="mt-4 px-5 py-2 rounded-full bg-[#C5A059] text-[#161412] text-xs font-semibold"
          >
            {isZh ? '返回課表' : 'Back to Schedule'}
          </button>
        </div>
      </div>
    );
  }

  const requiresPin = Boolean(session.pinCode && session.pinCode.trim().length > 0);
  const isAlreadyBooked =
    bookingCompleted ||
    session.bookedCount >= session.capacity ||
    Boolean(session.invitedStudents?.every((s) => s.status === 'BOOKED') && (session.invitedStudents?.length ?? 0) > 0);

  const datePart = session.startTime.substring(0, 10);
  const timePart = `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`;

  const presetLabel =
    session.privatePreset === '1_ON_1'
      ? isZh
        ? '1-on-1 單人私教專場'
        : '1-on-1 Private Session'
      : session.privatePreset === '1_ON_2'
      ? isZh
        ? '1-on-2 雙人私教包班'
        : '1-on-2 Duet Private Session'
      : isZh
      ? `私人小班包班 (${session.capacity} 人上限)`
      : `Small Group Private (${session.capacity} spots)`;

  const handleConfirmVipBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (requiresPin && enteredPin.trim() !== session.pinCode) {
      setPinError(
        isZh
          ? `PIN 碼不正確，請輸入教練提供之 4 位數密碼（示範提示：${session.pinCode}）`
          : `Incorrect 4-digit PIN code (Demo hint: ${session.pinCode})`
      );
      return;
    }

    // If student chose PASS_CREDIT but has 0 credits, top up a Private Pass automatically so 1 credit can be deducted
    if (paymentMethod === 'PASS_CREDIT' && (!userPass || userPass.creditsLeft <= 0)) {
      purchaseClassPack('pack-5');
    }

    const res = confirmBooking(
      session.id,
      paymentMethod,
      studentName.trim() || currentUser.name,
      studentEmail.trim() || currentUser.email
    );

    if (res.success) {
      setBookingCompleted(true);
      setBookingMessage(
        paymentMethod === 'PASS_CREDIT'
          ? isZh
            ? '✓ 已自動從您的私教課包扣抵 1 堂額度，專屬席次已鎖定！'
            : '✓ 1 session deducted from your Private Pass. Your VIP spot is locked in!'
          : isZh
          ? `✓ 已透過 ${paymentMethod.replace('_', ' ')} 完成付款，專屬席次已鎖定！`
          : `✓ Paid via ${paymentMethod.replace('_', ' ')}. Your VIP spot is locked in!`
      );
    } else {
      setPinError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#12100E] text-[#F5F2EB] py-8 px-4 pb-28 selection:bg-[#C5A059]/30">
      <div className="max-w-lg mx-auto">
        {/* Top Back / Studio Bar */}
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={() => navigateTo({ path: 'public_studio', slug: targetStudio.slug })}
            className="inline-flex items-center space-x-1.5 text-xs text-[#A89F91] hover:text-[#EAD8B1] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {isZh ? `返回 ${targetStudio.name} 公開課表` : `Back to ${targetStudio.name}`}
            </span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const originUrl =
                  typeof window !== 'undefined'
                    ? window.location.origin
                    : 'https://auraflow-bay.vercel.app';
                setQrPayload({
                  title: session.title,
                  subtitle: `${targetStudio.name} • ${session.roomName}`,
                  dateTimeText: `${datePart} • ${timePart}`,
                  coachName: session.instructor,
                  url: `${originUrl}/vip/${inviteToken}`,
                  badgeText: isZh
                    ? '👑 VIP 專屬私教 QR Code'
                    : '👑 VIP Private Session QR Code',
                  fileNamePrefix: `vip-${inviteToken}-qr`,
                });
              }}
              className="text-[11px] font-semibold text-[#C5A059] hover:text-[#EAD8B1] px-2.5 py-1 rounded-full bg-[#1C1917] border border-[#C5A059]/60 flex items-center space-x-1 transition-colors"
            >
              <QrCode className="w-3 h-3" />
              <span>{isZh ? '[ 📷 產生課程 QR Code ]' : '[ 📷 Generate VIP QR ]'}</span>
            </button>

            <span className="text-[11px] font-mono text-[#C5A059]/90 px-2.5 py-0.5 rounded-full bg-[#241E18] border border-[#3E3328]">
              /vip/{inviteToken}
            </span>
          </div>
        </div>

        {/* Main Dark-and-Gold VIP Invitation Card */}
        <div className="rounded-3xl bg-linear-to-b from-[#231E19] via-[#1C1814] to-[#15120F] border-2 border-[#C5A059]/60 shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden">
          {/* Top Gold Banner: 👑 專屬受邀席次 (Private Reserved Session) */}
          <div className="bg-linear-to-r from-[#C5A059] via-[#E2C178] to-[#B89047] px-5 py-3 text-[#161412] flex items-center justify-between">
            <div className="flex items-center space-x-2 font-semibold text-xs tracking-wide uppercase">
              <span className="text-sm">👑</span>
              <span>
                {isZh
                  ? '專屬受邀席次 (Private Reserved Session)'
                  : '👑 Private Reserved Session (VIP Invite-Only)'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#161412]/15 text-[#161412]">
              {presetLabel}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Studio & Class Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#342D25] pb-5">
              <div>
                <div className="flex items-center space-x-2 text-xs text-[#C5A059] mb-1">
                  <AuraLogoBadge size="sm" className="w-5 h-5" />
                  <span className="font-medium tracking-wider uppercase">
                    {targetStudio.name}
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F5F2EB] leading-snug">
                  {session.title}
                </h1>
                {defaultInvitedStudent && (
                  <p className="text-xs text-[#EAD8B1] mt-1.5 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>
                      {isZh
                        ? `專屬保留予：${defaultInvitedStudent.name}`
                        : `Exclusively reserved for ${defaultInvitedStudent.name}`}
                    </span>
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase tracking-wider text-[#8C8274]">
                  {isZh ? '私教單堂 / 課包' : 'VIP Session'}
                </div>
                <div className="text-xl font-mono font-semibold text-[#EAD8B1]">
                  {formatCurrency(session.price, currency, locale)}
                </div>
                <div className="text-[10px] text-[#C5A059]">
                  {isZh ? '或扣抵 1 堂私教課包' : 'or 1 Private Pass'}
                </div>
              </div>
            </div>

            {/* Coach Avatar + Studio Location + Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Coach Card */}
              <div className="p-3.5 rounded-2xl bg-[#181512] border border-[#322B24] flex items-center space-x-3">
                <img
                  src={session.instructorAvatar}
                  alt={session.instructor}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#C5A059]/60"
                />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#8C8274]">
                    {isZh ? '主理授課教練' : 'Lead Instructor'}
                  </div>
                  <div className="text-sm font-semibold text-[#F5F2EB]">
                    {session.instructor}
                  </div>
                  <div className="text-[11px] text-[#C5A059]">
                    {isZh ? '認證私教導師' : 'Certified Private Coach'}
                  </div>
                </div>
              </div>

              {/* Date, Time & Location Card */}
              <div className="p-3.5 rounded-2xl bg-[#181512] border border-[#322B24] space-y-1.5 text-xs">
                <div className="flex items-center space-x-2 text-[#EAD8B1]">
                  <Calendar className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span className="font-mono">{datePart}</span>
                </div>
                <div className="flex items-center space-x-2 text-[#F5F2EB]">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span className="font-mono">
                    {timePart} ({session.durationMins} mins)
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[#A89F91]">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span className="truncate">
                    {targetStudio.city || targetStudio.name} • {session.roomName}
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmed State vs. Active Booking Form */}
            {isAlreadyBooked ? (
              <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-600/60 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-block text-[11px] font-semibold px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 mb-1">
                    {isZh ? '✓ 已預約確認 (Booked)' : '✓ VIP Spot Confirmed (Booked)'}
                  </span>
                  <h2 className="font-serif text-xl text-[#F5F2EB]">
                    {isZh ? '您的專屬私教席次已確認！' : 'Your Private Session is Confirmed!'}
                  </h2>
                  <p className="text-xs text-emerald-200/90 mt-1">
                    {bookingMessage ||
                      (isZh
                        ? `${studentName} 您好，教練課表已即時更新為「✓ 已預約確認」。`
                        : `Hi ${studentName}, the coach's schedule has been updated to "✓ Booked".`)}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigateTo({ path: 'public_studio', slug: targetStudio.slug })}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#C5A059] text-[#161412] text-xs font-semibold hover:bg-[#D4AF37] transition-all"
                  >
                    {isZh ? '前往工作室課表頁' : 'View Studio Schedule'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo({ path: 'admin' })}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#26201A] border border-[#44392E] text-[#EAD8B1] text-xs font-medium hover:bg-[#322A22] transition-all"
                  >
                    {isZh ? '查看教練後台狀態 (✓ 已預約確認)' : 'View Coach Admin Roster Status'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmVipBooking} className="space-y-5">
                {/* Student Identity Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="vip-student-name"
                      className="block text-[11px] text-[#A89F91] mb-1 font-medium"
                    >
                      {isZh ? '受邀學員姓名 (Your Name)' : 'Invited Student Name'}
                    </label>
                    <input
                      id="vip-student-name"
                      name="studentName"
                      type="text"
                      required
                      autoComplete="name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#161310] border border-[#3A332B] text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="vip-student-email"
                      className="block text-[11px] text-[#A89F91] mb-1 font-medium"
                    >
                      {isZh ? '電子信箱 (接收預約憑證)' : 'Email for Confirmation Pass'}
                    </label>
                    <input
                      id="vip-student-email"
                      name="studentEmail"
                      type="email"
                      required
                      autoComplete="email"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#161310] border border-[#3A332B] text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                {/* Optional 4-Digit PIN Verification */}
                {requiresPin && (
                  <div className="p-4 rounded-2xl bg-[#181512] border border-[#C5A059]/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="vip-booking-pin"
                        className="text-xs font-semibold text-[#EAD8B1] flex items-center space-x-1.5"
                      >
                        <KeyRound className="w-4 h-4 text-[#C5A059]" />
                        <span>
                          {isZh
                            ? '請輸入 4 位數專屬通行 PIN 碼'
                            : 'Enter 4-Digit VIP Access PIN'}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setEnteredPin(session.pinCode || '')}
                        className="text-[10px] text-[#C5A059] hover:underline font-mono"
                      >
                        {isZh ? `[一鍵帶入示範密碼 ${session.pinCode}]` : `[Autofill Demo PIN: ${session.pinCode}]`}
                      </button>
                    </div>
                    <input
                      id="vip-booking-pin"
                      name="pinCode"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{4}"
                      maxLength={4}
                      required
                      autoComplete="one-time-code"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      value={enteredPin}
                      onChange={(e) =>
                        setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      placeholder="••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#12100E] border border-[#3A332B] text-center font-mono text-lg tracking-[0.5em] text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                )}

                {/* Payment / Private Pass Selector (Radio group per modern-web-guidance) */}
                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold text-[#EAD8B1] mb-1.5 flex items-center justify-between w-full">
                    <span>
                      {isZh
                        ? '選擇扣抵私教課包或行動支付 (Pass or Instant Pay)'
                        : 'Redeem Private Pass or Pay Direct'}
                    </span>
                    <span className="text-[11px] text-[#C5A059] font-normal">
                      {isZh
                        ? `目前課包餘額：${userPass?.creditsLeft ?? 0} 堂`
                        : `Pass Balance: ${userPass?.creditsLeft ?? 0} credits`}
                    </span>
                  </legend>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1: Private Pass / Class Pack Credit */}
                    <label
                      htmlFor="pay-pass-credit"
                      className={`p-3 rounded-2xl border cursor-pointer flex items-start space-x-2.5 transition-all ${
                        paymentMethod === 'PASS_CREDIT'
                          ? 'bg-[#2C241B] border-[#C5A059] text-[#F5F2EB]'
                          : 'bg-[#161310] border-[#322B24] text-[#A89F91] hover:border-[#4E4236]'
                      }`}
                    >
                      <input
                        id="pay-pass-credit"
                        type="radio"
                        name="paymentMethod"
                        value="PASS_CREDIT"
                        checked={paymentMethod === 'PASS_CREDIT'}
                        onChange={() => setPaymentMethod('PASS_CREDIT')}
                        className="mt-0.5 accent-[#C5A059]"
                      />
                      <div>
                        <div className="text-xs font-semibold flex items-center space-x-1.5">
                          <Ticket className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>
                            {isZh ? '私教課包點數扣抵 (1 堂)' : 'Private Pass Credit (1 Session)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8C8274] mt-0.5">
                          {userPass && userPass.creditsLeft > 0
                            ? isZh
                              ? `自動從現有課包扣抵 1 堂（剩餘 ${userPass.creditsLeft} 堂）`
                              : `Deducts 1 session (${userPass.creditsLeft} left)`
                            : isZh
                            ? '自動啟用私教課包並扣抵 1 堂'
                            : 'Auto-activates pack & deducts 1 credit'}
                        </p>
                      </div>
                    </label>

                    {/* Option 2: Apple Pay */}
                    <label
                      htmlFor="pay-apple-pay"
                      className={`p-3 rounded-2xl border cursor-pointer flex items-start space-x-2.5 transition-all ${
                        paymentMethod === 'APPLE_PAY'
                          ? 'bg-[#2C241B] border-[#C5A059] text-[#F5F2EB]'
                          : 'bg-[#161310] border-[#322B24] text-[#A89F91] hover:border-[#4E4236]'
                      }`}
                    >
                      <input
                        id="pay-apple-pay"
                        type="radio"
                        name="paymentMethod"
                        value="APPLE_PAY"
                        checked={paymentMethod === 'APPLE_PAY'}
                        onChange={() => setPaymentMethod('APPLE_PAY')}
                        className="mt-0.5 accent-[#C5A059]"
                      />
                      <div>
                        <div className="text-xs font-semibold flex items-center space-x-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Apple Pay ({formatCurrency(session.price, currency, locale)})</span>
                        </div>
                        <p className="text-[10px] text-[#8C8274] mt-0.5">
                          {isZh ? 'Stripe Connect 0% 抽成直連入帳' : 'Instant FaceID / TouchID checkout'}
                        </p>
                      </div>
                    </label>

                    {/* Option 3: Google Pay (GPay) */}
                    <label
                      htmlFor="pay-google-pay"
                      className={`p-3 rounded-2xl border cursor-pointer flex items-start space-x-2.5 transition-all ${
                        paymentMethod === 'GOOGLE_PAY'
                          ? 'bg-[#2C241B] border-[#C5A059] text-[#F5F2EB]'
                          : 'bg-[#161310] border-[#322B24] text-[#A89F91] hover:border-[#4E4236]'
                      }`}
                    >
                      <input
                        id="pay-google-pay"
                        type="radio"
                        name="paymentMethod"
                        value="GOOGLE_PAY"
                        checked={paymentMethod === 'GOOGLE_PAY'}
                        onChange={() => setPaymentMethod('GOOGLE_PAY')}
                        className="mt-0.5 accent-[#C5A059]"
                      />
                      <div>
                        <div className="text-xs font-semibold flex items-center space-x-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                          <span>GPay / Google Pay</span>
                        </div>
                        <p className="text-[10px] text-[#8C8274] mt-0.5">
                          {isZh ? '快速一鍵刷卡授權' : '1-tap Google Pay Express'}
                        </p>
                      </div>
                    </label>

                    {/* Option 4: LINE Pay */}
                    <label
                      htmlFor="pay-line-pay"
                      className={`p-3 rounded-2xl border cursor-pointer flex items-start space-x-2.5 transition-all ${
                        paymentMethod === 'LINE_PAY'
                          ? 'bg-[#2C241B] border-[#C5A059] text-[#F5F2EB]'
                          : 'bg-[#161310] border-[#322B24] text-[#A89F91] hover:border-[#4E4236]'
                      }`}
                    >
                      <input
                        id="pay-line-pay"
                        type="radio"
                        name="paymentMethod"
                        value="LINE_PAY"
                        checked={paymentMethod === 'LINE_PAY'}
                        onChange={() => setPaymentMethod('LINE_PAY')}
                        className="mt-0.5 accent-[#C5A059]"
                      />
                      <div>
                        <div className="text-xs font-semibold flex items-center space-x-1.5 text-emerald-400">
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>LINE Pay</span>
                        </div>
                        <p className="text-[10px] text-[#8C8274] mt-0.5">
                          {isZh ? '台灣最常用行動支付一鍵扣款' : 'Instant LINE Pay mobile checkout'}
                        </p>
                      </div>
                    </label>
                  </div>
                </fieldset>

                {/* Error Announcement */}
                <div aria-live="polite">
                  {pinError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/70 text-rose-200 text-xs">
                      {pinError}
                    </div>
                  )}
                </div>

                {/* Single-Click Booking Button: 確認並完成預約 (Confirm Booking) */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-[#C5A059] via-[#DFBE73] to-[#C5A059] hover:brightness-105 text-[#161412] font-bold text-sm shadow-lg transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isZh
                      ? '確認並完成預約 (Confirm Booking)'
                      : 'Confirm Booking (確認並完成預約)'}
                  </span>
                </button>
              </form>
            )}

            {/* Footer Privacy Note */}
            <div className="pt-3 border-t border-[#2E2720] flex items-center justify-between text-[11px] text-[#8C8274]">
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>
                  {isZh
                    ? '此為私人受邀場次，未顯示於公開課表'
                    : 'Private invite-only session • Hidden from public feed'}
                </span>
              </span>
              <span className="text-[#C5A059]">Aura Flow VIP</span>
            </div>
          </div>
        </div>

        <QRShareModal payload={qrPayload} onClose={() => setQrPayload(null)} />
      </div>
    </div>
  );
};


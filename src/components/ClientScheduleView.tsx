import React from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation, formatCurrency, formatTimeRange } from '../i18n/auraI18n';
import { Clock, SlidersHorizontal, Sparkles, AlertCircle, CheckCircle2, Ticket, MessageCircle } from 'lucide-react';
import { ClassSession } from '../types/aura';
import { AuraLeafBadge } from './AuraLeafLogo';
import { StudentChatModal } from './StudentChatModal';

export const ClientScheduleView: React.FC = () => {
  const {
    locale,
    currency,
    studio,
    sessions,
    selectedDate,
    setSelectedDate,
    activeCategory,
    setActiveCategory,
    openBookingDrawer,
    openWaitlistModal,
    userPass,
    purchaseClassPack,
    classPacks,
    openStudentChat,
  } = useAuraStore();

  const tCommon = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'common', key, params);
  const tBooking = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'booking', key, params);

  // Generate date strip for this week: Nov 2 to Nov 8, 2026
  const weekDays = [
    { dayName: 'Mon', dayNumber: 2, dateStr: '2026-11-02' },
    { dayName: 'Tue', dayNumber: 3, dateStr: '2026-11-03' },
    { dayName: 'Wed', dayNumber: 4, dateStr: '2026-11-04' },
    { dayName: 'Thu', dayNumber: 5, dateStr: '2026-11-05' },
    { dayName: 'Fri', dayNumber: 6, dateStr: '2026-11-06' },
    { dayName: 'Sat', dayNumber: 7, dateStr: '2026-11-07' },
    { dayName: 'Sun', dayNumber: 8, dateStr: '2026-11-08' },
  ];

  // Filter sessions for the active studio (fallback to all sessions if a studio has none yet)
  const studioSessions = sessions.filter((s) => s.studioId === studio.id);
  const baseSessions = studioSessions.length > 0 ? studioSessions : sessions;

  const categories = ['All', ...Array.from(new Set(baseSessions.map((s) => s.category)))];

  // Filter sessions by category
  const filteredSessions = baseSessions.filter((s) => {
    if (activeCategory !== 'All' && s.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-aura-bg text-aura-charcoal pb-24 selection:bg-aura-clay/20">
      {/* Mobile Frame Container (Responsive: centered on desktop with mobile viewport feel) */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-12">
        {/* Top Header matching Screenshot 1 */}
        <div className="flex items-center justify-between mb-6">
          <button
            aria-label="Clock History"
            className="w-9 h-9 rounded-full flex items-center justify-center text-aura-charcoal/80 hover:bg-stone-200/50 transition-colors"
          >
            <Clock className="w-5 h-5 stroke-[1.5]" />
          </button>

          <div className="flex flex-col items-center">
            <AuraLeafBadge size="sm" className="mb-1" />
            <h1 className="font-serif text-2xl font-normal tracking-wide text-aura-charcoal">
              {studio.name}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => openStudentChat()}
              aria-label="Direct Chat with Coach"
              className="w-9 h-9 rounded-full bg-stone-200/70 hover:bg-stone-300/80 flex items-center justify-center text-stone-700 transition-colors relative"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-300">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Client Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Studio Top Announcement Banner (Strictly Private to this Studio) */}
        {studio.announcementBanner && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/95 border border-amber-200/90 text-xs text-amber-950 flex items-center space-x-2 shadow-2xs">
            <Sparkles className="w-4 h-4 text-aura-clay shrink-0" />
            <span className="font-medium leading-snug">{studio.announcementBanner}</span>
          </div>
        )}

        {/* Active Pass Wallet Card with Contact Instructor CTA */}
        {userPass && userPass.creditsLeft > 0 && (
          <div className="mb-6 p-4 rounded-3xl bg-linear-to-br from-[#2D2824] to-[#1E1B18] text-white shadow-lg border border-[#443D36]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#EAD8B1]">
                  {tBooking('creditWallet')}
                </span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#3F362C] text-[#E0C99E] border border-[#5A4F44]">
                {tBooking('passesRemaining', { count: userPass.creditsLeft })}
              </span>
            </div>

            <div className="flex items-end justify-between pt-1">
              <div>
                <div className="text-sm font-medium text-stone-100">
                  {locale === 'zh-TW' ? '5 堂精選課包 • Sol Sanctuary' : '5-Class Pack • Sol Sanctuary'}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {tBooking('passExpiresOn', { date: locale === 'zh-TW' ? '2027年01月30日' : 'Jan 30, 2027' })}
                </div>
              </div>

              <button
                onClick={() => openStudentChat()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#161412] text-xs font-semibold transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{tBooking('messageInstructor')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Date Strip matching Screenshot 1 */}
        <div className="mb-6 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center space-x-2 min-w-max">
            {weekDays.map((day) => {
              const isSelected = selectedDate === day.dateStr;
              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all duration-200 ${
                    isSelected
                      ? 'bg-aura-clay text-white shadow-md scale-105'
                      : 'bg-transparent text-stone-700 hover:bg-stone-200/40'
                  }`}
                >
                  <span className={`text-xs ${isSelected ? 'font-medium text-white/90' : 'text-stone-500'}`}>
                    {day.dayName}
                  </span>
                  <span className="text-lg font-semibold tracking-tight mt-0.5">
                    {day.dayNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-aura-charcoal text-white shadow-xs'
                  : 'bg-stone-200/60 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat === 'All' ? tCommon('allCategories') : cat}
            </button>
          ))}
        </div>

        {/* Active Class Cards matching Screenshot 1 */}
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const spotsLeft = session.capacity - session.bookedCount;
            const isFull = spotsLeft <= 0;

            return (
              <div
                key={session.id}
                className="bg-white rounded-3xl p-5 shadow-xs border border-stone-200/60 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Header row: Title + Spots left badge */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-stone-900 leading-snug">
                      {session.title}
                    </h3>
                    <p className="text-xs font-mono text-stone-500 mt-0.5">
                      {formatTimeRange(session.startTime, session.endTime, locale)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isFull ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#383533] text-white">
                        {tCommon('classFull')}
                      </span>
                    ) : spotsLeft <= 3 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-aura-clay text-white shadow-xs">
                        {tCommon('spotsLeft', { count: spotsLeft })}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700">
                        {tCommon('spotsLeft', { count: spotsLeft })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags & Room info */}
                <div className="flex items-center space-x-2 text-xs text-stone-600 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 font-medium">
                    {session.category}
                  </span>
                  <span>•</span>
                  <span>{session.roomName}</span>
                  <span>•</span>
                  <span className="font-semibold text-stone-800">
                    {formatCurrency(session.price, currency, locale)}
                  </span>
                </div>

                {/* Instructor & Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex items-center space-x-2">
                    <img
                      src={session.instructorAvatar}
                      alt={session.instructor}
                      className="w-9 h-9 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <div className="text-sm font-medium text-stone-800 flex items-center space-x-1.5">
                        <span>{session.instructor}</span>
                        <button
                          onClick={() => openStudentChat(session.id, session.title)}
                          className="text-stone-400 hover:text-aura-clay transition-colors"
                          title={tBooking('messageInstructor')}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {locale === 'zh-TW' ? '資深認證師資' : 'Certified Coach'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isFull ? (
                      <button
                        onClick={() => openWaitlistModal(session)}
                        className="px-4 py-1.5 rounded-full text-xs font-medium bg-aura-charcoal text-white hover:bg-stone-800 transition-colors shadow-xs"
                      >
                        {tCommon('joinWaitlist')}
                      </button>
                    ) : (
                      <button
                        onClick={() => openBookingDrawer(session)}
                        className="px-5 py-1.5 rounded-full text-xs font-medium bg-aura-clay text-white hover:bg-[#A25A44] transition-colors shadow-xs"
                      >
                        {tCommon('book')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5-Class Pack Upsell Banner */}
        <div className="mt-8 p-5 rounded-3xl bg-amber-50/70 border border-amber-200 text-stone-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-1.5 text-amber-800 mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {tBooking('classPackUpsellTitle')}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                {tBooking('classPackUpsellSub')}
              </p>
              <button
                onClick={() => purchaseClassPack('pack-5')}
                className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-aura-clay text-white hover:bg-[#A25A44] transition-all shadow-xs"
              >
                {tBooking('buyPackCta', { price: formatCurrency(115, currency, locale) })}
              </button>
            </div>
            <div className="ml-4 w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-serif text-lg font-bold">
              5x
            </div>
          </div>
        </div>

        {/* Studio Cancellation & Free Policy Footer */}
        <div className="mt-6 text-center text-xs text-stone-500">
          <p>{tBooking('policyNotice', { hours: studio.cancelWindowHrs })}</p>
          <p className="text-[11px] text-stone-400 mt-1">
            {locale === 'zh-TW'
              ? '0% 平台抽成保證 • 款項直入 Stripe 直連帳戶'
              : '0% Platform Fee Guarantee • Direct payouts via Stripe Connect'}
          </p>

          {/* Discreet Powered by Aura Flow Acquisition Badge */}
          <div className="mt-5 pt-4 border-t border-stone-200/80">
            <button
              type="button"
              onClick={() => useAuraStore.getState().switchPersona('new_owner')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-stone-200/70 hover:bg-stone-300/70 text-[11px] text-stone-600 hover:text-stone-900 transition-colors"
            >
              <span>
                {locale === 'zh-TW'
                  ? 'Powered by Aura Flow • 獨立教練與精品工作室預約系統'
                  : 'Powered by Aura Flow • Boutique Studio Booking Engine'}
              </span>
              <span className="font-semibold text-aura-clay">
                {locale === 'zh-TW' ? '[免費開通 ↗]' : '[Launch Free ↗]'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* In-App Direct Student Chat Modal */}
      <StudentChatModal />
    </div>
  );
};

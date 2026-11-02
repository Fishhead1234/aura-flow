import React from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation, formatCurrency, formatTimeRange } from '../i18n/auraI18n';
import { Clock, SlidersHorizontal, Sparkles, AlertCircle, CheckCircle2, Ticket } from 'lucide-react';
import { ClassSession } from '../types/aura';

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

  const categories = ['All', 'Reformer', 'Flow', 'Yin Yoga', 'Sound Bath'];

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
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
            <div className="w-7 h-7 rounded-full border border-stone-400 flex items-center justify-center text-aura-charcoal mb-1">
              <span className="text-xs">🌿</span>
            </div>
            <h1 className="font-serif text-2xl font-normal tracking-wide text-aura-charcoal">
              {studio.name}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-300">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Client Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              aria-label="Filter"
              className="w-8 h-8 rounded-full flex items-center justify-center text-aura-charcoal/80 hover:bg-stone-200/50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>

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
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#7D8D7B] text-white">
                        {tCommon('spotsLeft', { count: spotsLeft })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub info */}
                <div className="flex items-center space-x-2 text-[11px] text-stone-500 mb-4">
                  <span>{session.roomName}</span>
                  <span>•</span>
                  <span>{session.level}</span>
                  <span>•</span>
                  <span className="font-medium text-stone-800">
                    {formatCurrency(session.price, currency, locale)}
                  </span>
                </div>

                {/* Instructor & Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={session.instructorAvatar}
                      alt={session.instructor}
                      className="w-9 h-9 rounded-full object-cover border border-stone-200"
                    />
                    <span className="text-sm font-medium text-stone-800">
                      {session.instructor}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openBookingDrawer(session)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium text-stone-600 border border-stone-300 hover:bg-stone-50 transition-colors"
                    >
                      {tCommon('edit')}
                    </button>

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
            0% Platform Fee Guarantee • Direct payouts via Stripe Connect
          </p>
        </div>
      </div>
    </div>
  );
};


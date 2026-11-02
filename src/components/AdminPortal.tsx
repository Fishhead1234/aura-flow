import React, { useState, useEffect } from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation, formatCurrency } from '../i18n/auraI18n';
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
} from 'lucide-react';
import { ClassCategory } from '../types/aura';

export const AdminPortal: React.FC = () => {
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
    addSession,
    deleteSession,
  } = useAuraStore();

  const [cancelCutoff, setCancelCutoff] = useState(studio.cancelWindowHrs);
  const [waitlistMins, setWaitlistMins] = useState(studio.waitlistMins);
  const [showNewClassModal, setShowNewClassModal] = useState(false);

  // New Class Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ClassCategory>('Reformer');
  const [newInstructor, setNewInstructor] = useState('Lena S.');
  const [newCapacity, setNewCapacity] = useState(8);
  const [newPrice, setNewPrice] = useState(28);
  const [newRoom, setNewRoom] = useState('Reformer Studio A');

  const tAdmin = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'admin', key, params);
  const tCommon = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'common', key, params);

  // Waterfall timer tick effect
  useEffect(() => {
    if (!activeWaterfallSessionId) return;
    const interval = setInterval(() => {
      tickWaterfallTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWaterfallSessionId, tickWaterfallTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudioPolicies(cancelCutoff, waitlistMins);
    alert('Studio policies updated successfully!');
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    addSession({
      title: newTitle || 'Dynamic Pilates Flow',
      category: newCategory,
      instructor: newInstructor,
      instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      startTime: '2026-11-04T08:00:00.000Z',
      endTime: '2026-11-04T08:50:00.000Z',
      durationMins: 50,
      capacity: Number(newCapacity),
      price: Number(newPrice),
      roomName: newRoom,
      level: 'All Levels',
    });
    setShowNewClassModal(false);
    setNewTitle('');
  };

  return (
    <div className="min-h-screen bg-[#161412] text-[#F5F2EB] pb-24 selection:bg-[#C5A059]/30">
      {/* Tablet-optimized Top Navigation Header matching Screenshot 3 */}
      <div className="border-b border-[#2D2824] bg-[#1E1B18]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand Monogram */}
          <div className="flex items-center space-x-4">
            <span className="font-serif text-xl tracking-wider text-[#C5A059] font-medium">
              Aura Flow
            </span>
          </div>

          {/* Center Tabs matching Screenshot 3 */}
          <div className="flex items-center space-x-1 sm:space-x-2 bg-[#282420] p-1 rounded-full border border-[#3A342E] overflow-x-auto no-scrollbar max-w-[65vw] sm:max-w-none">
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
          <div className="flex items-center space-x-3 text-xs text-[#A89F91]">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-[#2A2520] border border-[#3D352E] text-[11px] text-[#C5A059]">
              Development ▾
            </span>
            <div className="w-7 h-7 rounded-full bg-[#2A2520] border border-[#3D352E] flex items-center justify-center text-[#C5A059]">
              <Settings className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Stripe Direct Payouts Hero Banner matching Screenshot 3 */}
        <div className="rounded-3xl bg-linear-to-r from-[#29241F] to-[#221E1A] p-6 border border-[#3E372F] shadow-lg mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              {/* Stripe Icon Capsule */}
              <div className="w-12 h-12 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white shadow-md font-bold text-2xl font-sans shrink-0">
                S
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-medium text-[#F5F2EB] tracking-wide">
                    {tAdmin('stripeDirectPayouts')}
                  </h2>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-xs text-[#A89F91]">
                  <div>
                    <span className="block text-[11px] text-[#8C8274]">
                      {tAdmin('pendingPayouts')}
                    </span>
                    <span className="text-xl font-semibold text-[#F5F2EB] tracking-tight">
                      {formatCurrency(stripeOverview.pendingPayouts, currency, locale)}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-[#3E372F]" />
                  <div>
                    <span className="block text-[11px] text-[#8C8274]">
                      {tAdmin('nextPayoutDate')}
                    </span>
                    <span className="text-sm font-medium text-[#F5F2EB]">
                      Dec 29, 2026
                    </span>
                  </div>
                  <div className="h-8 w-px bg-[#3E372F] hidden sm:block" />
                  <div className="hidden sm:block">
                    <span className="block text-[11px] text-[#8C8274]">
                      {tAdmin('directPayoutAccount')}
                    </span>
                    <span className="text-sm font-medium text-[#C5A059] flex items-center space-x-1">
                      <span>{stripeOverview.connectedAccountName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 0% Platform Fees Badge */}
            <div className="flex items-center space-x-3">
              <span className="px-4 py-2 rounded-full bg-[#352D24] border border-[#524538] text-xs font-semibold text-[#D4AF37] tracking-wider shadow-xs">
                {tAdmin('platformTakeRate')}
              </span>
            </div>
          </div>
        </div>

        {/* SUB-TAB 1: SCHEDULE BUILDER & CAPACITY METERS matching Screenshot 3 */}
        {activeAdminTab === 'schedule' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-[#F5F2EB] tracking-wide">
                  {tAdmin('activeClassSchedule')}
                </h3>
                <p className="text-xs text-[#8C8274]">
                  Hard capacity enforcement, realtime booking counts, and waitlist status.
                </p>
              </div>

              <button
                onClick={() => setShowNewClassModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#C5A059] text-[#161412] text-xs font-semibold hover:bg-[#D4AF37] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tAdmin('createClass')}</span>
              </button>
            </div>

            {/* Grid of 6 Sessions matching Screenshot 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => {
                const fillRatio = Math.min(100, Math.round((session.bookedCount / session.capacity) * 100));
                const isFull = session.bookedCount >= session.capacity;

                return (
                  <div
                    key={session.id}
                    className="bg-[#221E1A] rounded-2xl p-5 border border-[#3A332B] hover:border-[#574B3E] transition-all relative overflow-hidden group shadow-md"
                  >
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

                    <div className="text-xs text-[#A89F91] mb-5">
                      Coach: <span className="text-[#E0D8CE] font-medium">{session.instructor}</span>
                    </div>

                    {/* Capacity Meter Bar matching Screenshot 3 */}
                    <div className="pt-2 border-t border-[#302B24]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#8C8274] text-[11px]">
                          {tAdmin('capacityMeters')}
                        </span>
                        <span
                          className={`text-xs font-semibold font-mono ${
                            isFull ? 'text-amber-400' : 'text-[#E0D8CE]'
                          }`}
                        >
                          {session.bookedCount}/{session.capacity} booked
                        </span>
                      </div>

                      {/* Glowing Gold Capacity Bar */}
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
                  Automated pass bundles that auto-decrement per booking and auto-refund on valid cancellations.
                </p>
              </div>

              <div className="text-xs px-3 py-1.5 rounded-full bg-[#2A241E] border border-[#44382C] text-[#C5A059]">
                0% Commission • All Payouts Direct to Stripe
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {classPacks.map((pack) => (
                <div
                  key={pack.id}
                  className={`bg-[#221E1A] rounded-2xl p-5 border relative overflow-hidden transition-all ${
                    pack.popularBadge ? 'border-[#C5A059]/60 ring-1 ring-[#C5A059]/40' : 'border-[#3A332B]'
                  }`}
                >
                  {pack.popularBadge && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C5A059] text-[#161412]">
                      {tAdmin('popularTag')}
                    </span>
                  )}
                  <h4 className="font-serif text-lg font-medium text-[#F5F2EB] mb-1">
                    {pack.name}
                  </h4>
                  <div className="text-2xl font-semibold text-[#C5A059] font-mono mb-2">
                    {formatCurrency(pack.price, currency, locale)}
                  </div>
                  <p className="text-xs text-[#8C8274] leading-relaxed mb-4">
                    {pack.description}
                  </p>
                  <div className="space-y-1.5 text-xs text-[#A89F91] pt-3 border-t border-[#302B24]">
                    <div>{tAdmin('creditsCount', { count: pack.credits })}</div>
                    <div>{tAdmin('validityDays', { days: pack.expiryDays })}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payout History */}
            <div className="bg-[#221E1A] rounded-2xl p-5 border border-[#3A332B]">
              <h4 className="text-sm font-medium text-[#F5F2EB] mb-3">
                Recent Stripe Connect Direct Payouts
              </h4>
              <div className="space-y-2">
                {stripeOverview.payoutHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#1A1714] border border-[#332D26] text-xs"
                  >
                    <div>
                      <span className="font-mono text-[#E0D8CE] font-medium">
                        {formatCurrency(item.amount, currency, locale)}
                      </span>
                      <span className="text-[#8C8274] ml-2">Initiated {item.date}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[11px] font-semibold">
                      PAID • Arrived {item.arrivalDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: LIVE ROSTERS & 30-MINUTE WAITLIST CASCADE SIMULATOR */}
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
                    {/* Simulated Fast-forward button */}
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
                      className="p-3.5 rounded-xl bg-[#1A1714] border border-[#332D26] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-[#F5F2EB]">
                            {booking.clientName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A241E] text-[#C5A059] border border-[#423930]">
                            {booking.paymentMethod === 'PASS_CREDIT' ? 'Pass Pass' : 'Stripe Paid'}
                          </span>
                        </div>
                        <div className="text-xs text-[#8C8274] mt-0.5">
                          {booking.sessionTitle} • {booking.sessionTime}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {booking.status === 'CHECKED_IN' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 text-xs border border-emerald-800 font-medium">
                            {tAdmin('checkedIn')}
                          </span>
                        ) : (
                          <button
                            onClick={() => checkInClient(booking.id)}
                            className="px-3 py-1 rounded-full bg-[#2A241E] border border-[#423930] text-xs text-[#E0D8CE] hover:bg-[#383028] transition-colors"
                          >
                            {tAdmin('checkIn')}
                          </button>
                        )}

                        <button
                          onClick={() => cancelBooking(booking.id)}
                          title="Simulate cancellation to test cascade"
                          className="px-2.5 py-1 rounded-full bg-red-950/40 border border-red-900/60 text-xs text-red-300 hover:bg-red-900/60 transition-colors"
                        >
                          {tAdmin('cancelBooking')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waitlist Queue & Modes */}
              <div className="bg-[#221E1A] rounded-2xl p-5 border border-[#3A332B]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-[#F5F2EB]">
                    {tAdmin('waitlistQueue')} ({waitlist.length})
                  </h3>
                  <span className="text-[11px] text-[#C5A059]">
                    VIP Pre-Auth auto-charges immediately on cancellation
                  </span>
                </div>

                <div className="space-y-3">
                  {waitlist.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-xl bg-[#1A1714] border border-[#332D26] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-[#2A241E] text-[#C5A059] flex items-center justify-center text-xs font-mono font-bold">
                            #{entry.priorityOrder}
                          </span>
                          <span className="text-sm font-medium text-[#F5F2EB]">
                            {entry.clientName}
                          </span>
                          {entry.mode === 'VIP_PREAUTH' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 font-bold flex items-center space-x-1">
                              <Zap className="w-2.5 h-2.5 fill-amber-300" />
                              <span>VIP Pre-Auth ($0 Hold)</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                              Standard Free Queue
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#8C8274] mt-1 pl-7">
                          {entry.clientPhone} • {entry.sessionTitle}
                        </div>
                      </div>

                      <div>
                        {entry.status === 'WAITING' && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-[#24201C] text-[#8C8274] border border-[#383129]">
                            Waiting
                          </span>
                        )}
                        {entry.status === 'OFFERED' && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold animate-pulse">
                            30m Window Open
                          </span>
                        )}
                        {entry.status === 'CLAIMED' && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Claimed
                          </span>
                        )}
                        {entry.status === 'EXPIRED' && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-900">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 4: STUDIO POLICIES & RULES */}
        {activeAdminTab === 'policies' && (
          <div className="max-w-2xl bg-[#221E1A] rounded-2xl p-6 border border-[#3A332B]">
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
        )}
      </div>

      {/* New Class Modal */}
      {showNewClassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#221E1A] rounded-3xl p-6 border border-[#3A332B] w-full max-w-md text-[#F5F2EB] shadow-2xl">
            <h3 className="font-serif text-xl font-medium text-[#C5A059] mb-4">
              {tAdmin('createClass')}
            </h3>
            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A89F91] mb-1">{tAdmin('className')}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Athletic Reformer Burn"
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89F91] mb-1">{tAdmin('category')}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ClassCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB]"
                  >
                    <option value="Reformer">Reformer</option>
                    <option value="Flow">Flow</option>
                    <option value="Sound Bath">Sound Bath</option>
                    <option value="Yin Yoga">Yin Yoga</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#A89F91] mb-1">{tAdmin('instructor')}</label>
                  <input
                    type="text"
                    required
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89F91] mb-1">{tAdmin('hardCapacity')}</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB]"
                  />
                </div>
                <div>
                  <label className="block text-[#A89F91] mb-1">{tAdmin('price')}</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewClassModal(false)}
                  className="px-4 py-2 rounded-full border border-[#3A332B] text-[#A89F91]"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#C5A059] text-[#161412] font-semibold"
                >
                  {tAdmin('saveSession')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


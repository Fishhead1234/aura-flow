import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { formatCurrency } from '../i18n/auraI18n';
import {
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  Search,
  ShieldCheck,
  Calendar,
  Users,
} from 'lucide-react';
import { AuraLeafBadge } from './AuraLeafLogo';

export const ExploreStudiosView: React.FC = () => {
  const {
    studios,
    sessions,
    locale,
    currency,
    navigateTo,
    switchPersona,
    boundStudioSlug,
    studio,
    setStudentOnboardingOpen,
  } = useAuraStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  // Only show studios that have opted into public discovery (discoverable !== false)
  const discoverableStudios = studios.filter((s) => s.discoverable !== false);

  const cities = [
    { id: 'ALL', label: isZh ? '全部城市' : 'All Cities' },
    { id: 'Taipei', label: isZh ? '台北 Taipei' : 'Taipei' },
    { id: 'Taichung', label: isZh ? '台中 Taichung' : 'Taichung' },
  ];

  const filteredStudios = discoverableStudios.filter((s) => {
    const matchesCity =
      selectedCity === 'ALL' || (s.city || '').toLowerCase().includes(selectedCity.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-aura-bg text-aura-charcoal pb-28">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-12">
        {/* Hero Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/80 text-[11px] font-semibold text-amber-900 mb-3">
            <Compass className="w-3.5 h-3.5 text-aura-clay" />
            <span>{isZh ? '探索精選課程 (Explore Studios)' : 'Explore Curated Studios & Classes'}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
            {isZh ? '探索您城市中的精品運動空間' : 'Discover Boutique Movement Sanctuaries'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            {isZh
              ? '嚴選認證器械皮拉提、瑜珈流動、頌缽音療與私人教練工作室 • 0% 平台手續費'
              : 'Book Reformer Pilates, Vinyasa Flow, Sound Bath & Private Coaching directly with 0% booking fees.'}
          </p>
        </div>

        {/* Search & City Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-7">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isZh
                  ? '搜尋教室名稱、皮拉提、頌缽音療...'
                  : 'Search studios, Reformer Pilates, Sound Bath...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay shadow-2xs"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {cities.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCity(c.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium shrink-0 transition-all ${
                  selectedCity === c.id
                    ? 'bg-aura-charcoal text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Directory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredStudios.map((st) => {
            const publicSessions = sessions.filter((s) => s.visibility !== 'PRIVATE');
            const studioSessions = publicSessions.filter((s) => s.studioId === st.id);
            const previewSessions = studioSessions.length > 0 ? studioSessions.slice(0, 2) : publicSessions.slice(0, 2);

            return (
              <div
                key={st.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Studio Brand + City */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <AuraLeafBadge size="md" />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h2 className="font-serif text-xl font-semibold text-stone-900">
                            {st.name}
                          </h2>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-stone-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-aura-clay" />
                          <span>{st.city || (isZh ? '台北市 • 大安區' : 'Taipei • Da-an')}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      {isZh ? '開放預約中' : 'Open for Booking'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 mb-3 leading-relaxed">{st.tagline}</p>

                  {/* Studio Announcement Banner Preview */}
                  {st.announcementBanner && (
                    <div className="mb-4 px-3 py-2 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                      {st.announcementBanner}
                    </div>
                  )}

                  {/* Upcoming Sessions Preview */}
                  <div className="space-y-2 mb-5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      {isZh ? '本週熱門時段' : 'Featured Upcoming Sessions'}
                    </div>
                    {previewSessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-medium text-stone-900">{sess.title}</div>
                          <div className="text-[11px] text-stone-500">
                            {sess.instructor} • {sess.roomName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-aura-clay">
                            {formatCurrency(sess.price, currency, locale)}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {Math.max(1, sess.capacity - sess.bookedCount)}{' '}
                            {isZh ? '名額' : 'spots'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button: Enter Private Studio Page */}
                <button
                  type="button"
                  onClick={() => navigateTo({ path: 'public_studio', slug: st.slug })}
                  className="w-full py-3 px-4 rounded-2xl bg-aura-charcoal hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs"
                >
                  <span>
                    {isZh
                      ? `進入 ${st.name} 獨立預約頁`
                      : `View ${st.name} Schedule & Book`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Instructor Acquisition Banner at Bottom */}
        <div className="mt-10 p-6 rounded-3xl bg-[#1C1917] text-[#F5F2EB] border border-[#3A332B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#C5A059] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isZh ? '您是獨立教練或工作室主理人嗎？' : 'Are you an independent coach or studio owner?'}</span>
            </div>
            <h3 className="font-serif text-lg font-medium text-white">
              {isZh
                ? '3 分鐘免費建立您的專屬預約網站，享 0% 平台抽成'
                : 'Launch your own private booking studio in 3 minutes with 0% commission'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => switchPersona('new_owner')}
            className="px-5 py-2.5 rounded-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#161412] text-xs font-semibold shrink-0 transition-all shadow-md"
          >
            {isZh ? '免費開通教練後台 ↗' : 'Launch Studio Free ↗'}
          </button>
        </div>
      </div>

      {/* Mobile Student Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-[#F7F4EE]/95 backdrop-blur-md border-t border-stone-200 px-6 py-2 flex items-center justify-around">
        <button
          type="button"
          onClick={() =>
            navigateTo({
              path: 'public_studio',
              slug: boundStudioSlug || studio.slug || 'sol-sanctuary',
            })
          }
          className="flex flex-col items-center space-y-0.5 text-stone-500 hover:text-stone-900 font-medium text-[11px]"
        >
          <Calendar className="w-4 h-4" />
          <span>{isZh ? '專屬課表' : 'My Studio'}</span>
        </button>

        <button
          type="button"
          onClick={() => navigateTo({ path: 'explore' })}
          className="flex flex-col items-center space-y-0.5 text-aura-clay font-semibold text-[11px]"
        >
          <Compass className="w-4 h-4" />
          <span>{isZh ? '探索 (Explore)' : 'Explore'}</span>
        </button>

        <button
          type="button"
          onClick={() => setStudentOnboardingOpen(true)}
          className="flex flex-col items-center space-y-0.5 text-stone-500 hover:text-stone-900 font-medium text-[11px]"
        >
          <Users className="w-4 h-4" />
          <span>{isZh ? '綁定教練' : 'Bind Coach'}</span>
        </button>
      </nav>
    </div>
  );
};


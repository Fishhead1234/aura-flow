import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { AuraLogoBadge } from './AuraLeafLogo';
import {
  Search,
  QrCode,
  Sparkles,
  ArrowRight,
  Check,
  ShieldCheck,
  Compass,
  X,
  Camera,
} from 'lucide-react';

export const StudentOnboardingModal: React.FC = () => {
  const {
    isStudentOnboardingOpen,
    setStudentOnboardingOpen,
    setQrScannerOpen,
    studios,
    bindStudentToCoach,
    switchPersona,
    navigateTo,
    locale,
  } = useAuraStore();

  const [query, setQuery] = useState('');

  if (!isStudentOnboardingOpen) return null;

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  // Quick suggestion chips of top studios as requested
  const suggestionChips = [
    {
      slug: 'sol-sanctuary',
      coachName: 'Elena Rostova',
      studioName: 'Sol Sanctuary',
      code: 'SOL88',
      label: 'Elena Rostova - Sol Sanctuary',
    },
    {
      slug: 'core-pulse',
      coachName: 'Marcus K.',
      studioName: 'Core Pulse',
      code: 'CORE99',
      label: 'Marcus - Core Pulse',
    },
    {
      slug: 'kora-sound-yoga',
      coachName: 'Chloe M.',
      studioName: 'Kōra Sound & Yin Sanctuary',
      code: 'KORA77',
      label: 'Chloe - Kōra Sound & Yin',
    },
  ];

  // Filter studios based on search input (coach name, studio name, or code)
  const trimmed = query.trim().toLowerCase();
  const matchedStudios = studios.filter((s) => {
    if (!trimmed) return false;
    return (
      s.name.toLowerCase().includes(trimmed) ||
      s.slug.toLowerCase().includes(trimmed) ||
      (s.coachName || '').toLowerCase().includes(trimmed) ||
      (s.studioCode || '').toLowerCase().includes(trimmed)
    );
  });

  const handleSelectCoach = (slug: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auraflow_has_launched', 'true');
    }
    bindStudentToCoach(slug);
  };

  const handleOpenQrScanner = () => {
    setQrScannerOpen(true);
  };

  const handleExplorePublicFeed = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auraflow_has_launched', 'true');
    }
    setStudentOnboardingOpen(false);
    switchPersona('new_student');
    navigateTo({ path: 'explore' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1C1917] text-[#F5F2EB] border border-[#3A332B] shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close button */}
        <button
          type="button"
          onClick={() => setStudentOnboardingOpen(false)}
          aria-label="Close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#2A241E] hover:bg-[#383028] flex items-center justify-center text-[#A89F91] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <AuraLogoBadge size="md" className="w-11 h-11 shrink-0" />
          <div>
            <span className="inline-flex items-center space-x-1 text-[10px] font-semibold uppercase tracking-wider text-[#C5A059]">
              <Sparkles className="w-3 h-3" />
              <span>{isZh ? '學員專屬導覽 (Student Setup)' : 'Student Welcome'}</span>
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#F5F2EB]">
              {isZh ? '歡迎來到 Aura Flow' : 'Welcome to Aura Flow'}
            </h2>
          </div>
        </div>

        {/* OPTION 1 (PRIMARY CARD): I HAVE A COACH / STUDIO */}
        <div className="p-5 rounded-2xl bg-[#24201C] border-2 border-[#C5A059]/60 shadow-lg space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#C5A059] mb-1">
                <span>🧘</span>
                <span>
                  {isZh
                    ? '我已有配合的教練 / 工作室 (I have a coach)'
                    : '🧘 I have a coach / studio (我已有配合的教練)'}
                </span>
              </div>
              <p className="text-xs text-[#A89F91] leading-relaxed">
                {isZh
                  ? '直接綁定您的專屬教練，首頁將設為該教室的獨立預約課表（純淨無其他廣告干擾）。'
                  : 'Bind your coach to make their private, ad-free studio schedule your default home screen.'}
              </p>
            </div>
          </div>

          {/* Instant Search / Code Input Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C8274] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isZh
                  ? '請輸入教練姓名、工作室名稱或專屬代碼 (例如 Elena / Sol Sanctuary)'
                  : 'Enter coach name, studio name or code (e.g. Elena or Sol Sanctuary)'
              }
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181614] border border-[#3E352B] text-xs text-[#F5F2EB] placeholder:text-[#706658] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Instant Search Results */}
          {trimmed && (
            <div className="space-y-2 pt-1">
              {matchedStudios.length > 0 ? (
                matchedStudios.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectCoach(st.slug)}
                    className="w-full p-3 rounded-xl bg-[#1C1917] hover:bg-[#2E271F] border border-[#C5A059]/50 flex items-center justify-between text-left transition-all"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#F5F2EB] flex items-center space-x-1.5">
                        <span>{st.coachName ? `${st.coachName} — ${st.name}` : st.name}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-[#8C8274] mt-0.5">
                        {st.city} • Code: <span className="font-mono text-[#C5A059]">{st.studioCode || st.slug}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#C5A059] text-[#161412] text-[11px] font-semibold">
                      {isZh ? '綁定並進入 →' : 'Bind & Enter →'}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-[11px] text-[#8C8274] px-2 py-1">
                  {isZh
                    ? '找不到相符結果，可點選下方熱門教練標籤直接綁定：'
                    : 'No exact match — tap a studio chip below to bind:'}
                </div>
              )}
            </div>
          )}

          {/* Quick Suggestion Chips of Top Studios */}
          <div>
            <div className="text-[11px] font-medium text-[#8C8274] mb-2">
              {isZh ? '熱門合作教練與工作室（點擊立即綁定）：' : 'Quick select a verified coach / studio:'}
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestionChips.map((chip) => (
                <button
                  key={chip.slug}
                  type="button"
                  onClick={() => handleSelectCoach(chip.slug)}
                  className="px-3 py-1.5 rounded-full bg-[#181614] hover:bg-[#C5A059] text-[#E0D8CE] hover:text-[#161412] border border-[#3E352B] hover:border-[#C5A059] text-xs font-medium transition-all flex items-center space-x-1.5 shadow-2xs"
                >
                  <span>[{chip.label}]</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Scan Coach Exclusive QR Code Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleOpenQrScanner}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2E2822] hover:bg-[#383028] border border-[#4A4035] text-xs font-medium text-[#EAD8B1] flex items-center justify-center space-x-2 transition-all"
            >
              <QrCode className="w-4 h-4 text-[#C5A059]" />
              <span>
                {isZh
                  ? '📷 掃描教練專屬 QR Code (Scan Coach QR Code)'
                  : '📷 Scan Coach Exclusive QR Code (掃描教練專屬 QR Code)'}
              </span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center space-x-3 text-[11px] text-[#706658]">
          <div className="flex-1 h-px bg-[#302B24]" />
          <span>{isZh ? '或者 (OR)' : 'OR'}</span>
          <div className="flex-1 h-px bg-[#302B24]" />
        </div>

        {/* OPTION 2 (SECONDARY PILL / BUTTON): EXPLORE CLASSES */}
        <button
          type="button"
          onClick={handleExplorePublicFeed}
          className="w-full py-3.5 px-5 rounded-2xl bg-[#24201C] hover:bg-[#2E2924] border border-[#3E352B] text-[#E0D8CE] text-xs sm:text-sm font-medium flex items-center justify-between transition-all"
        >
          <div className="flex items-center space-x-2.5 text-left">
            <Compass className="w-4 h-4 text-[#C5A059] shrink-0" />
            <div>
              <div className="font-semibold text-[#F5F2EB]">
                {isZh
                  ? '🔍 我想探索推薦課程與新名師 (Explore classes)'
                  : '🔍 Explore Recommended Classes & New Instructors'}
              </div>
              <div className="text-[11px] text-[#8C8274] mt-0.5">
                {isZh
                  ? '依城市區域與課程分類（器械皮拉提、瑜珈、音療）自由瀏覽'
                  : 'Browse public studios filtered by district and movement category'}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#C5A059] shrink-0" />
        </button>
      </div>
    </div>
  );
};


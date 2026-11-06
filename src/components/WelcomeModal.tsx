import React from 'react';
import { useAuraStore } from '../store/auraStore';
import { AuraLogoBadge } from './AuraLeafLogo';
import { Sparkles, ArrowRight, ShieldCheck, Calendar, Compass, Globe } from 'lucide-react';
import { SupportedLocale } from '../types/aura';

export const WelcomeModal: React.FC = () => {
  const {
    isWelcomeModalOpen,
    setWelcomeModalOpen,
    setStudentOnboardingOpen,
    switchPersona,
    locale,
    setLocale,
  } = useAuraStore();

  if (!isWelcomeModalOpen) return null;

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  const handleStartAsStudent = () => {
    setWelcomeModalOpen(false);
    setStudentOnboardingOpen(true);
  };

  const handleStartAsInstructor = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auraflow_has_launched', 'true');
    }
    switchPersona('new_owner');
    setWelcomeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#1C1917] text-[#F5F2EB] border border-[#3A332B] shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Language Toggle Pill in Top Right */}
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#2A241E] border border-[#3E352B] text-[11px] font-medium text-[#C5A059]">
            <Sparkles className="w-3 h-3" />
            <span>{isZh ? 'iOS & Android 雙端合一系統' : 'Unified Student & Studio App'}</span>
          </span>

          <button
            type="button"
            onClick={() => setLocale((locale === 'zh-TW' ? 'en' : 'zh-TW') as SupportedLocale)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#26211C] hover:bg-[#322B24] border border-[#3E352B] text-[11px] text-[#E0D8CE] transition-colors"
          >
            <Globe className="w-3 h-3 text-[#C5A059]" />
            <span>{locale === 'zh-TW' ? 'EN' : '繁體中文'}</span>
          </button>
        </div>

        {/* Center Brand Identity */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <AuraLogoBadge size="lg" className="w-20 h-20 shadow-xl ring-2 ring-[#C5A059]/40" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-[#F5F2EB]">
            Aura Flow
          </h2>
          <p className="text-xs sm:text-sm text-[#A89F91] mt-1.5 leading-relaxed">
            {isZh
              ? '精品運動工作室、器械皮拉提與私人教練專屬預約平台'
              : 'Boutique Fitness, Reformer Pilates & Private Studio Booking Engine'}
          </p>
        </div>

        {/* Value Highlights */}
        <div className="space-y-2.5 mb-7 bg-[#24201C] p-4 rounded-2xl border border-[#332C25] text-xs">
          <div className="flex items-center space-x-2.5 text-[#E0D8CE]">
            <Compass className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>
              {isZh
                ? '學員免註冊繁瑣流程，一鍵探索並預約城市精選課程'
                : '1-tap class booking, automated waitlists & pass wallets for students'}
            </span>
          </div>
          <div className="flex items-center space-x-2.5 text-[#E0D8CE]">
            <Calendar className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>
              {isZh
                ? '教練免費建立專屬課表與規則，發布接單再享 14 天免費試用'
                : 'Coaches build schedules & rules 100% free — pay only when going live'}
            </span>
          </div>
          <div className="flex items-center space-x-2.5 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isZh
                ? '0% 平台交易抽成 • 支援 Apple Pay / LINE Pay / 街口 / 轉帳'
                : '0% Platform Commission • Direct Stripe, Apple Pay & LINE Pay'}
            </span>
          </div>
        </div>

        {/* Role Selection CTAs */}
        <div className="space-y-3">
          {/* Primary CTA: Explore & Book Classes (Student) */}
          <button
            type="button"
            onClick={handleStartAsStudent}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#C5A059] hover:bg-[#D4AF37] text-[#161412] font-semibold text-sm flex items-center justify-between shadow-lg transition-all active:scale-[0.99]"
          >
            <div className="text-left">
              <div>{isZh ? '我是學員 • 開始預約課程 (I\'m a Student)' : 'I\'m a Student • Explore & Book Classes'}</div>
              <div className="text-[11px] font-normal text-[#161412]/80">
                {isZh ? '綁定您的專屬配合教練，或探索城市推薦課程' : 'Connect with your coach or discover studios nearby'}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          {/* Secondary Outline CTA: Studio Portal (Instructor) */}
          <button
            type="button"
            onClick={handleStartAsInstructor}
            className="w-full py-3.5 px-5 rounded-2xl bg-transparent hover:bg-[#28231E] text-[#F5F2EB] border border-[#5A4F44] font-medium text-sm flex items-center justify-between transition-all active:scale-[0.99]"
          >
            <div className="text-left">
              <div className="text-[#EAD8B1]">
                {isZh ? '我是授課教練 / 經營工作室 (Studio Portal)' : 'I am an Instructor / Studio Owner (Studio Portal)'}
              </div>
              <div className="text-[11px] font-normal text-[#8C8274]">
                {isZh ? '免費體驗 3 步驟建立專屬品牌預約頁' : 'Free 3-step studio setup • No credit card required'}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#C5A059] shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useRef } from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation } from '../i18n/auraI18n';
import { SupportedLocale, SupportedCurrency, CURRENCY_CONFIGS } from '../types/aura';
import {
  Menu,
  X,
  Globe,
  Coins,
  ChevronRight,
  ExternalLink,
  Shield,
  Sparkles,
  Ticket,
  Download,
  Smartphone,
  Compass,
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { AuraLeafBadge } from './AuraLeafLogo';

export const Navbar: React.FC = () => {
  const {
    locale,
    setLocale,
    currency,
    setCurrency,
    currentRoute,
    navigateTo,
    studio,
    userPass,
    isMobileDrawerOpen,
    setMobileDrawerOpen,
    setDevPinModalOpen,
  } = useAuraStore();

  const tapTimesRef = useRef<number[]>([]);

  const handleLogoTap = () => {
    const now = Date.now();
    tapTimesRef.current = [...tapTimesRef.current.filter((t) => now - t < 4000), now];
    if (tapTimesRef.current.length >= 9) {
      tapTimesRef.current = [];
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 40, 40]);
        } catch (_) {}
      }
      setDevPinModalOpen(true);
      return;
    }
    navigateTo({ path: 'public_studio', slug: studio.slug || 'sol-sanctuary' });
  };

  const { canInstall, isPromptAvailable, isInstalled, triggerInstall } = usePwaInstall();

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'common', key, params);

  const isAdminRoute = currentRoute.path === 'admin';
  const isOnboardingRoute = currentRoute.path === 'onboarding';

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  const languages: { code: SupportedLocale; flag: string; label: string }[] = [
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'zh-TW', flag: '🇹🇼', label: '繁體中文' },
    { code: 'zh-CN', flag: '🇨🇳', label: '简体中文' },
    { code: 'ja', flag: '🇯🇵', label: '日本語' },
  ];

  const currencies: { code: SupportedCurrency; symbol: string; label: string; flag: string }[] = [
    { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸' },
    { code: 'TWD', symbol: 'NT$', label: 'New Taiwan Dollar', flag: '🇹🇼' },
    { code: 'HKD', symbol: 'HK$', label: 'Hong Kong Dollar', flag: '🇭🇰' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', flag: '🇸🇬' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-aura-bg/95 border-b border-aura-clay/20 transition-all">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand & Studio Logo (Clean on both mobile & desktop) */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer shrink-0 select-none"
            onClick={handleLogoTap}
          >
            <AuraLeafBadge size="md" customLogo={studio.logoUrl} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-lg sm:text-xl font-semibold tracking-wide text-aura-charcoal">
                  {studio.name || 'Sol Sanctuary'}
                </span>
                {isAdminRoute && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                    Admin Portal
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* DESKTOP BAR (>= 768px): Currency, Language, Instructor Link & Optional PWA Install */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Optional PWA Install Button for Desktop */}
            {canInstall && (
              <button
                onClick={triggerInstall}
                aria-label="Install App"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-stone-900 text-amber-300 border border-stone-800 shadow-xs hover:bg-stone-800 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* Currency Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                className="appearance-none bg-stone-100/90 text-stone-800 text-xs font-medium pl-3 pr-7 py-1.5 rounded-full border border-stone-300 focus:outline-none focus:ring-1 focus:ring-aura-clay cursor-pointer"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 pointer-events-none text-[10px] text-stone-500">▼</span>
            </div>

            {/* Language Selector */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Language"
                value={locale}
                onChange={(e) => setLocale(e.target.value as SupportedLocale)}
                className="appearance-none bg-stone-100/90 text-stone-800 text-xs font-medium pl-3 pr-7 py-1.5 rounded-full border border-stone-300 focus:outline-none focus:ring-1 focus:ring-aura-clay cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 pointer-events-none text-[10px] text-stone-500">▼</span>
            </div>

            {/* Public Explore Studios Directory Pill */}
            {!isAdminRoute && (
              <button
                type="button"
                onClick={() => navigateTo({ path: 'explore' })}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  currentRoute.path === 'explore'
                    ? 'bg-aura-charcoal text-white shadow-xs'
                    : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/80'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-aura-clay" />
                <span>{locale === 'zh-TW' ? '探索精選課程' : 'Explore Studios'}</span>
              </button>
            )}

            {/* Context-aware Route Link */}
            {isAdminRoute ? (
              <button
                onClick={() => navigateTo({ path: 'public_studio', slug: studio.slug || 'sol-sanctuary' })}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-aura-clay text-white shadow-xs hover:bg-[#A25A44] transition-all"
              >
                <span>{t('viewPublicBookingPage')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => navigateTo({ path: 'admin' })}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-stone-700 bg-stone-200/80 hover:bg-stone-300/80 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-stone-600" />
                <span>
                  {locale === 'zh-TW'
                    ? '切換至教室管理後台'
                    : 'Switch to Studio Portal'}
                </span>
              </button>
            )}
          </div>

          {/* MOBILE BAR (< 768px): Subtle Install Button + Hamburger Menu */}
          <div className="flex md:hidden items-center space-x-2">
            {canInstall && (
              <button
                onClick={triggerInstall}
                aria-label="Install App"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-stone-900 text-amber-300 text-xs font-medium border border-stone-800 shadow-2xs hover:bg-stone-800 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              className="w-10 h-10 rounded-full bg-stone-200/70 border border-stone-300/80 flex items-center justify-center text-aura-charcoal hover:bg-stone-300 transition-colors shadow-2xs"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER (< 768px) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Slide-over panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-[#F7F4EE] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto no-scrollbar z-10 animate-slide-in-right">
            <div>
              {/* Header with Title and Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-300">
                <div className="flex items-center space-x-2.5">
                  <AuraLeafBadge size="sm" />
                  <span className="font-serif text-lg font-semibold text-aura-charcoal">
                    {studio.name || 'Sol Sanctuary'}
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close Navigation Menu"
                  className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student active pass banner (if user has active pass) */}
              {userPass && userPass.creditsLeft > 0 && (
                <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ticket className="w-4 h-4 text-aura-clay" />
                    <div>
                      <div className="text-xs font-semibold text-stone-900">{userPass.packName}</div>
                      <div className="text-[11px] text-stone-600">{userPass.creditsLeft} classes remaining</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-medium">
                    Active
                  </span>
                </div>
              )}

              {/* PWA INSTALL CARD IN DRAWER (if not already installed) */}
              {!isInstalled && (
                <div className="mt-4 p-3.5 rounded-2xl bg-stone-100/90 border border-stone-300/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-aura-clay" />
                      <span className="text-xs font-semibold text-stone-900">Install Mobile App</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Android PWA
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mb-2.5 leading-relaxed">
                    Install Aura Flow on your Android device for 1-tap booking and full-screen experience.
                  </p>
                  <button
                    onClick={() => {
                      triggerInstall();
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-stone-900 text-amber-300 text-xs font-medium hover:bg-stone-800 transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isPromptAvailable ? 'Install App' : 'Add to Android Home Screen'}</span>
                  </button>
                </div>
              )}

              {/* 1. LANGUAGE SELECTOR */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Language / 語言</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => {
                    const isSelected = locale === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLocale(lang.code);
                        }}
                        className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-aura-clay text-white border-aura-clay shadow-xs font-semibold'
                            : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-100'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. CURRENCY SELECTOR */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Currency / 幣別</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {currencies.map((curr) => {
                    const isSelected = currency === curr.code;
                    return (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setCurrency(curr.code);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-xs font-semibold'
                            : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span>{curr.flag}</span>
                          <span>{curr.code}</span>
                        </div>
                        <span className="font-mono text-xs">{curr.symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. INSTRUCTOR PORTAL / SWITCH VIEW LINK */}
              <div className="mt-8 pt-6 border-t border-stone-300 space-y-2.5">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                  {locale === 'zh-TW' ? '身分與探索切換' : 'Navigation & Portal'}
                </div>

                {/* Explore Studios Directory Button */}
                <button
                  onClick={() => {
                    navigateTo({ path: 'explore' });
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-100/80 border border-amber-300 text-stone-900 font-medium text-xs hover:bg-amber-200/70 transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <Compass className="w-4 h-4 text-aura-clay" />
                    <span>
                      {locale === 'zh-TW'
                        ? '探索精選課程 (Explore Studios)'
                        : 'Explore Studios & Classes'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {isAdminRoute ? (
                  <button
                    onClick={() => {
                      navigateTo({ path: 'public_studio', slug: studio.slug || 'sol-sanctuary' });
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-aura-clay text-white font-medium text-xs shadow-md hover:bg-[#A25A44] transition-all"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {locale === 'zh-TW'
                          ? '切換至學員預約前台'
                          : 'Switch to Student Booking View'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigateTo({ path: 'admin' });
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-900 text-amber-300 font-medium text-xs shadow-md hover:bg-stone-800 transition-all"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Shield className="w-4 h-4" />
                      <span>
                        {locale === 'zh-TW'
                          ? '切換至教室管理後台 (Switch to Studio Portal)'
                          : 'Switch to Studio Portal (切換至教室管理後台)'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {/* Create New Studio Link */}
                <button
                  onClick={() => {
                    navigateTo({ path: 'onboarding' });
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-200/80 text-stone-700 text-xs font-medium hover:bg-stone-300 transition-colors"
                >
                  <span>
                    {locale === 'zh-TW'
                      ? '我是新教練 • 免費建立專屬工作室 (3 步驟)'
                      : 'New Studio Onboarding (Free 3-Step Setup)'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom info */}
            <div className="pt-6 border-t border-stone-200 text-center text-[11px] text-stone-500 space-y-1">
              <p>Aura Flow • $29/mo Flat • 0% Transaction Commission</p>
              <p className="text-[10px] text-stone-400">Direct-to-coach payouts via Stripe Connect</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useEffect } from 'react';
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
} from 'lucide-react';

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
  } = useAuraStore();

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
            className="flex items-center space-x-2.5 cursor-pointer shrink-0"
            onClick={() => navigateTo({ path: 'public_studio', slug: studio.slug || 'sol-sanctuary' })}
          >
            <div className="w-9 h-9 rounded-full bg-aura-clay/15 border border-aura-clay/30 flex items-center justify-center text-aura-clay shadow-xs">
              <span className="font-serif text-lg font-bold">{studio.logoMark || '🌿'}</span>
            </div>
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

          {/* DESKTOP BAR (>= 768px): Currency, Language, Instructor Link */}
          <div className="hidden md:flex items-center space-x-3">
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

            {/* Context-aware Route Link */}
            {isAdminRoute ? (
              <button
                onClick={() => navigateTo({ path: 'public_studio', slug: studio.slug || 'sol-sanctuary' })}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-aura-clay text-white shadow-xs hover:bg-[#A25A44] transition-all"
              >
                <span>View Public Booking Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => navigateTo({ path: 'admin' })}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-stone-700 bg-stone-200/80 hover:bg-stone-300/80 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-stone-600" />
                <span>Instructor Portal</span>
              </button>
            )}
          </div>

          {/* MOBILE BAR (< 768px): Hamburger Menu Button ONLY */}
          <div className="flex md:hidden items-center">
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
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🌿</span>
                  <span className="font-serif text-lg font-semibold text-aura-charcoal">
                    {studio.name || 'Sol Sanctuary'}
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close Menu"
                  className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. LANGUAGE SELECTOR */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Language / 語言 / 言語</span>
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
              <div className="mt-8 pt-6 border-t border-stone-300">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                  Access Portal
                </div>

                {isAdminRoute ? (
                  <button
                    onClick={() => {
                      navigateTo({ path: 'public_studio', slug: studio.slug || 'sol-sanctuary' });
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-aura-clay text-white font-medium text-xs shadow-md hover:bg-[#A25A44] transition-all"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Switch to Student Booking View</span>
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
                      <span>Instructor Portal / Admin Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {/* Create New Studio Link */}
                <button
                  onClick={() => {
                    navigateTo({ path: 'onboarding' });
                  }}
                  className="w-full mt-2.5 flex items-center justify-between p-3 rounded-2xl bg-stone-200/80 text-stone-700 text-xs font-medium hover:bg-stone-300 transition-colors"
                >
                  <span>New Studio Onboarding (3-Step Wizard)</span>
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

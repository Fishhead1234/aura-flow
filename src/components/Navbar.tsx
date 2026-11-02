import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation } from '../i18n/auraI18n';
import { SupportedLocale, SupportedCurrency, CURRENCY_CONFIGS } from '../types/aura';
import {
  Globe,
  Coins,
  LayoutDashboard,
  Calendar,
  Ticket,
  ChevronDown,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    locale,
    setLocale,
    currency,
    setCurrency,
    viewMode,
    setViewMode,
    userPass,
  } = useAuraStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'common', key, params);

  const currentCurrency = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;

  const localeLabels: Record<SupportedLocale, { flag: string; label: string; short: string }> = {
    'en': { flag: '🇺🇸', label: 'English', short: 'EN' },
    'zh-TW': { flag: '🇹🇼', label: '繁體中文', short: '繁中' },
    'zh-CN': { flag: '🇨🇳', label: '简体中文', short: '简中' },
    'ja': { flag: '🇯🇵', label: '日本語', short: '日本' },
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-aura-bg/95 border-b border-aura-clay/20 transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Monogram */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer shrink-0"
            onClick={() => setViewMode('client')}
          >
            <div className="w-9 h-9 rounded-full bg-aura-clay/15 border border-aura-clay/30 flex items-center justify-center text-aura-clay shadow-xs">
              <span className="font-serif text-lg font-bold">🌿</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif text-lg sm:text-xl font-semibold tracking-wide text-aura-charcoal">
                  {t('brandName')}
                </span>
                <span className="hidden md:inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-aura-sage/20 text-emerald-800 border border-aura-sage/40">
                  0% Fee
                </span>
              </div>
              <p className="text-[10px] text-aura-charcoal/60 hidden lg:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Desktop Right Controls (hidden on mobile, shown on md+) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Client Pass Wallet Pill */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium shadow-xs">
              <Ticket className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-semibold">{userPass.creditsLeft}</span>
              <span>Passes left</span>
            </div>

            {/* View Switcher Toggle */}
            <div className="flex items-center bg-stone-200/80 p-1 rounded-full border border-stone-300">
              <button
                onClick={() => setViewMode('client')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  viewMode === 'client'
                    ? 'bg-aura-clay text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('clientView')}</span>
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  viewMode === 'admin'
                    ? 'bg-stone-900 text-amber-400 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t('adminView')}</span>
              </button>
            </div>

            {/* Currency Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                className="appearance-none bg-stone-100/90 text-stone-800 text-xs font-medium pl-2.5 pr-6 py-1.5 rounded-full border border-stone-300 focus:outline-none focus:ring-1 focus:ring-aura-clay cursor-pointer"
              >
                {Object.keys(CURRENCY_CONFIGS).map((curr) => {
                  const conf = CURRENCY_CONFIGS[curr as SupportedCurrency];
                  return (
                    <option key={curr} value={curr}>
                      {conf.flag} {curr} ({conf.symbol})
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-500 absolute right-2 pointer-events-none" />
            </div>

            {/* Language Selector */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Language"
                value={locale}
                onChange={(e) => setLocale(e.target.value as SupportedLocale)}
                className="appearance-none bg-stone-100/90 text-stone-800 text-xs font-medium pl-2.5 pr-6 py-1.5 rounded-full border border-stone-300 focus:outline-none focus:ring-1 focus:ring-aura-clay cursor-pointer"
              >
                <option value="en">🇺🇸 English</option>
                <option value="zh-TW">🇹🇼 繁體中文</option>
                <option value="zh-CN">🇨🇳 简体中文</option>
                <option value="ja">🇯🇵 日本語</option>
              </select>
              <ChevronDown className="w-3 h-3 text-stone-500 absolute right-2 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Right Controls: Compact Language + Currency + Menu (Visible on mobile) */}
          <div className="flex md:hidden items-center space-x-1.5">
            {/* Mobile Language Selector Pill */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Language"
                value={locale}
                onChange={(e) => setLocale(e.target.value as SupportedLocale)}
                className="appearance-none bg-stone-100 text-stone-800 text-xs font-semibold pl-2 pr-5 py-1.5 rounded-full border border-stone-300 focus:outline-none focus:ring-1 focus:ring-aura-clay cursor-pointer"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="zh-TW">🇹🇼 繁中</option>
                <option value="zh-CN">🇨🇳 简中</option>
                <option value="ja">🇯🇵 日語</option>
              </select>
              <ChevronDown className="w-3 h-3 text-stone-600 absolute right-1.5 pointer-events-none" />
            </div>

            {/* Mobile Currency Selector Pill */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                className="appearance-none bg-stone-100 text-stone-800 text-xs font-semibold pl-2 pr-5 py-1.5 rounded-full border border-stone-300 focus:outline-none focus:ring-1 focus:ring-aura-clay cursor-pointer"
              >
                {Object.keys(CURRENCY_CONFIGS).map((curr) => {
                  const conf = CURRENCY_CONFIGS[curr as SupportedCurrency];
                  return (
                    <option key={curr} value={curr}>
                      {conf.symbol} {curr}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-600 absolute right-1.5 pointer-events-none" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="w-8 h-8 rounded-full bg-stone-200/80 flex items-center justify-center text-stone-700 hover:bg-stone-300 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile View Mode Switcher Strip (Always visible on mobile without opening dropdown) */}
        <div className="flex md:hidden items-center justify-between pt-2.5 mt-2 border-t border-stone-200/60 gap-2">
          {/* Segmented Mode Control */}
          <div className="flex-1 flex items-center bg-stone-200/80 p-0.5 rounded-full border border-stone-300">
            <button
              onClick={() => setViewMode('client')}
              className={`flex-1 flex items-center justify-center space-x-1 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'client'
                  ? 'bg-aura-clay text-white shadow-xs'
                  : 'text-stone-700'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{t('clientView')}</span>
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`flex-1 flex items-center justify-center space-x-1 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'admin'
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'text-stone-700'
              }`}
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>{t('adminView')}</span>
            </button>
          </div>

          {/* Pass Balance Badge on Mobile */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold shrink-0">
            <Ticket className="w-3 h-3 text-amber-700" />
            <span>{userPass.creditsLeft} Passes</span>
          </div>
        </div>

        {/* Mobile Slide-down Quick Sheet for Extra Settings */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-3.5 rounded-2xl bg-white border border-stone-200 shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t('language')} & {t('currency')}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">{t('language')}</label>
                <div className="space-y-1">
                  {(['en', 'zh-TW', 'zh-CN', 'ja'] as SupportedLocale[]).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocale(loc);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs text-left ${
                        locale === loc
                          ? 'bg-aura-clay text-white font-medium shadow-xs'
                          : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                      }`}
                    >
                      <span>{localeLabels[loc].flag}</span>
                      <span>{localeLabels[loc].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">{t('currency')}</label>
                <div className="space-y-1">
                  {(['USD', 'TWD', 'HKD', 'JPY', 'SGD', 'EUR', 'GBP'] as SupportedCurrency[]).map((curr) => {
                    const conf = CURRENCY_CONFIGS[curr];
                    return (
                      <button
                        key={curr}
                        onClick={() => {
                          setCurrency(curr);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs text-left ${
                          currency === curr
                            ? 'bg-stone-900 text-amber-400 font-medium shadow-xs'
                            : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                        }`}
                      >
                        <span>{conf.flag}</span>
                        <span>{curr} ({conf.symbol})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span>0% Platform Take-Rate</span>
              <span>v1.0.0</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

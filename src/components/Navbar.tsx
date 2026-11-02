import React from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation } from '../i18n/auraI18n';
import { SupportedLocale, SupportedCurrency, CURRENCY_CONFIGS } from '../types/aura';
import { Sparkles, Globe, CreditCard, LayoutDashboard, Calendar, Ticket } from 'lucide-react';

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

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'common', key, params);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-aura-bg/90 border-b border-aura-clay/20 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Monogram */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setViewMode('client')}>
          <div className="w-10 h-10 rounded-full bg-aura-clay/15 border border-aura-clay/30 flex items-center justify-center text-aura-clay shadow-sm">
            <span className="font-serif text-xl font-bold tracking-tight">🌿</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl font-semibold tracking-wide text-aura-charcoal">
                {t('brandName')}
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-aura-sage/20 text-emerald-800 border border-aura-sage/40">
                0% Platform Fee
              </span>
            </div>
            <p className="text-[11px] text-aura-charcoal/60 hidden md:block">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* View Switcher & Quick Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Client Pass Wallet Pill */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium shadow-xs">
            <Ticket className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-semibold">{userPass.creditsLeft}</span>
            <span className="hidden sm:inline">Passes left</span>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="flex items-center bg-stone-200/70 p-1 rounded-full border border-stone-300">
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
            <span className="absolute right-2 pointer-events-none text-[10px] text-stone-500">▼</span>
          </div>

          {/* Language Selector */}
          <div className="relative inline-flex items-center">
            <select
              aria-label="Language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as SupportedLocale)}
              className="appearance-none bg-stone-100/90 text-stone-800 text-xs font-medium pl-2.5 pr-6 py-1.5 rounded-full border border-stone-300 focus:outline-none focus:ring-1 focus:ring-aura-clay cursor-pointer"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="zh-TW">🇹🇼 繁中</option>
              <option value="zh-CN">🇨🇳 简中</option>
              <option value="ja">🇯🇵 日本語</option>
            </select>
            <span className="absolute right-2 pointer-events-none text-[10px] text-stone-500">▼</span>
          </div>
        </div>
      </div>
    </header>
  );
};


import { SupportedLocale, SupportedCurrency, CURRENCY_CONFIGS } from '../types/aura';

import enCommon from '../locales/en/common.json';
import enBooking from '../locales/en/booking.json';
import enAdmin from '../locales/en/admin.json';

import zhTWCommon from '../locales/zh-TW/common.json';
import zhTWBooking from '../locales/zh-TW/booking.json';
import zhTWAdmin from '../locales/zh-TW/admin.json';

import zhCNCommon from '../locales/zh-CN/common.json';
import zhCNBooking from '../locales/zh-CN/booking.json';
import zhCNAdmin from '../locales/zh-CN/admin.json';

import jaCommon from '../locales/ja/common.json';
import jaBooking from '../locales/ja/booking.json';
import jaAdmin from '../locales/ja/admin.json';

type LocaleNamespace = 'common' | 'booking' | 'admin';

const TRANSLATIONS: Record<SupportedLocale, Record<LocaleNamespace, Record<string, string>>> = {
  'en': {
    common: enCommon,
    booking: enBooking,
    admin: enAdmin,
  },
  'zh-TW': {
    common: zhTWCommon,
    booking: zhTWBooking,
    admin: zhTWAdmin,
  },
  'zh-CN': {
    common: zhCNCommon,
    booking: zhCNBooking,
    admin: zhCNAdmin,
  },
  'ja': {
    common: jaCommon,
    booking: jaBooking,
    admin: jaAdmin,
  },
};

export function getTranslation(
  locale: SupportedLocale,
  namespace: LocaleNamespace,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[locale]?.[namespace] || TRANSLATIONS['en'][namespace];
  let text = dict[key] || TRANSLATIONS['en'][namespace][key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }

  return text;
}

/**
 * Format currency using native Intl.NumberFormat based on selected studio currency
 */
export function formatCurrency(amount: number, currency: SupportedCurrency = 'USD', locale: SupportedLocale = 'en'): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;
  const convertedAmount = amount * config.rateToUSD;

  try {
    return new Intl.NumberFormat(config.localeDefault || locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: ['JPY'].includes(currency) ? 0 : 2,
      maximumFractionDigits: ['JPY'].includes(currency) ? 0 : 2,
    }).format(convertedAmount);
  } catch {
    return `${config.symbol}${convertedAmount.toFixed(['JPY'].includes(currency) ? 0 : 2)}`;
  }
}

/**
 * Format session times using native Intl.DateTimeFormat
 */
export function formatTimeRange(startIso: string, endIso: string, locale: SupportedLocale = 'en'): string {
  try {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const timeFormatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
  } catch {
    return '08:00 - 08:50';
  }
}

/**
 * Format date for the horizontal strip (e.g. Mon 2, 星期一 2)
 */
export function formatDateForStrip(date: Date, locale: SupportedLocale = 'en'): { dayName: string; dayNumber: number; fullDate: string } {
  try {
    const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    const dayNumber = date.getDate();
    const fullDate = date.toISOString().split('T')[0];
    return { dayName, dayNumber, fullDate };
  } catch {
    return { dayName: 'Mon', dayNumber: date.getDate(), fullDate: date.toISOString().split('T')[0] };
  }
}


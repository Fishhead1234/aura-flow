import { SupportedLocale, SupportedCurrency, CURRENCY_CONFIGS, ClassPack } from '../types/aura';

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
  let text = dict[key] || TRANSLATIONS['en'][namespace]?.[key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }

  return text;
}

/**
 * Format currency with strict per-currency conventions requested by design:
 * - TWD: 'NT$ 3,680' (no decimals, standard NT$ prefix with space)
 * - USD: '$115.00' (2 decimals)
 * - JPY: '¥3,680' (no decimals)
 * - HKD: 'HK$ 897.00'
 * - SGD: 'S$ 155.25'
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'USD',
  locale: SupportedLocale = 'en'
): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;
  const rate = config.rateToUSD || 1.0;
  const converted = amount * rate;

  if (currency === 'TWD') {
    return `NT$ ${Math.round(converted).toLocaleString('en-US')}`;
  }
  if (currency === 'JPY') {
    return `¥${Math.round(converted).toLocaleString('en-US')}`;
  }
  if (currency === 'USD') {
    return `$${converted.toFixed(2)}`;
  }
  if (currency === 'HKD') {
    return `HK$ ${converted.toFixed(2)}`;
  }
  if (currency === 'SGD') {
    return `S$ ${converted.toFixed(2)}`;
  }

  try {
    return new Intl.NumberFormat(config.localeDefault || locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  } catch {
    return `${config.symbol}${converted.toFixed(2)}`;
  }
}

/**
 * Format date properly localized (e.g. '2026年12月29日' in Chinese)
 */
export function formatDateLocalized(dateStr: string, locale: SupportedLocale = 'en'): string {
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return dateStr;

    if (locale === 'zh-TW' || locale === 'zh-CN' || locale === 'ja') {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      return `${year}年${month}月${day}日`;
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
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
export function formatDateForStrip(
  date: Date,
  locale: SupportedLocale = 'en'
): { dayName: string; dayNumber: number; fullDate: string } {
  try {
    const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    const dayNumber = date.getDate();
    const fullDate = date.toISOString().split('T')[0];
    return { dayName, dayNumber, fullDate };
  } catch {
    return { dayName: 'Mon', dayNumber: date.getDate(), fullDate: date.toISOString().split('T')[0] };
  }
}

/**
 * Dynamic localized pack name matching user requirement:
 * 5-Class Pack -> "5 堂精選課包"
 * 10-Class Committed Pack -> "10 堂進階優惠課包"
 * Single Drop-In Pass -> "單堂體驗通行證"
 */
export function getPackDisplayName(name: string, locale: SupportedLocale = 'en'): string {
  if (locale === 'zh-TW') {
    if (name === '5-Class Pack' || name === '5 堂精選課包') return '5 堂精選課包';
    if (name === '10-Class Committed Pack' || name === '10 堂進階優惠課包') return '10 堂進階優惠課包';
    if (name === 'Single Drop-In Pass' || name === '單堂體驗通行證') return '單堂體驗通行證';
  }
  if (locale === 'zh-CN') {
    if (name === '5-Class Pack' || name === '5 堂精选课包') return '5 堂精选课包';
    if (name === '10-Class Committed Pack' || name === '10 堂进阶优惠课包') return '10 堂进阶优惠课包';
    if (name === 'Single Drop-In Pass' || name === '单堂体验通行证') return '单堂体验通行证';
  }
  if (locale === 'ja') {
    if (name === '5-Class Pack' || name === '5回チケット') return '5回チケット';
    if (name === '10-Class Committed Pack' || name === '10回チケット') return '10回チケット';
    if (name === 'Single Drop-In Pass' || name === 'ドロップインチケット') return 'ドロップインチケット';
  }
  if (locale === 'en') {
    if (name === '5 堂精選課包') return '5-Class Pack';
    if (name === '10 堂進階優惠課包') return '10-Class Committed Pack';
    if (name === '單堂體驗通行證') return 'Single Drop-In Pass';
  }
  return name;
}

/**
 * Dynamic localized pack description that eliminates hardcoded USD $25 in TWD mode
 */
export function getPackDisplayDescription(
  pack: ClassPack,
  currency: SupportedCurrency = 'USD',
  locale: SupportedLocale = 'en'
): string {
  // If user edited to a custom description not matching default, keep custom description
  const isDefaultDesc =
    !pack.description ||
    pack.description.includes('Save $25') ||
    pack.description.includes('Maximum transformation') ||
    pack.description.includes('Flexible drop-in') ||
    pack.description.includes('立省') ||
    pack.description.includes('單堂彈性體驗');

  if (!isDefaultDesc) {
    return pack.description;
  }

  const orig = pack.originalPrice || (pack.credits === 5 ? 140 : pack.credits === 10 ? 280 : pack.price);
  const savings = Math.max(0, orig - pack.price);

  if (pack.credits === 5) {
    if (locale === 'zh-TW') {
      return `立省 ${formatCurrency(savings, currency, locale)} • 全面開放器械皮拉提與動態流動課程。`;
    }
    if (locale === 'zh-CN') {
      return `立省 ${formatCurrency(savings, currency, locale)} • 全面开放器械普拉提与动态流动课程。`;
    }
    if (locale === 'ja') {
      return `${formatCurrency(savings, currency, locale)} お得 • ピラティスおよびヨガ全レッスン利用可能。`;
    }
    return `Save ${formatCurrency(savings, currency, locale)} on your journey. Full access to Reformer & Flow sessions.`;
  }

  if (pack.credits === 10) {
    if (locale === 'zh-TW') {
      return `立省 ${formatCurrency(savings, currency, locale)} • 深度進階蛻變，享專屬貴賓體驗通行證。`;
    }
    if (locale === 'zh-CN') {
      return `立省 ${formatCurrency(savings, currency, locale)} • 深度进阶蜕变，享专属贵宾体验通行证。`;
    }
    if (locale === 'ja') {
      return `${formatCurrency(savings, currency, locale)} お得 • 継続的な集中レッスンに最適。`;
    }
    return `Save ${formatCurrency(savings, currency, locale)} on your journey. Maximum transformation. Includes complimentary guest pass.`;
  }

  if (pack.credits === 1) {
    if (locale === 'zh-TW') return '單堂彈性體驗，無綁約長期負擔。';
    if (locale === 'zh-CN') return '单堂弹性体验，无绑约长期负担。';
    if (locale === 'ja') return '1回ごとの単発レッスン受講。';
    return 'Flexible drop-in pass with no long-term commitment.';
  }

  if (savings > 0) {
    if (locale === 'zh-TW') return `立省 ${formatCurrency(savings, currency, locale)} • 享有 ${pack.credits} 堂課堂優惠點數。`;
    return `Save ${formatCurrency(savings, currency, locale)} • Includes ${pack.credits} class pass credits.`;
  }

  return pack.description || `${pack.credits} credits valid for ${pack.expiryDays} days.`;
}

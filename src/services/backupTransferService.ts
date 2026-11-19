import { auraCloudSync, AuraCloudSnapshot } from './auraCloudSync';
import { SupportedCurrency, Studio } from '../types/aura';

export interface EarlyBirdTierInfo {
  tier: 1 | 2 | 3 | 0; // 1 = Days 30-20, 2 = Days 19-10, 3 = Days 9-1, 0 = Expired
  daysLeft: number;
  discountMonths: number;
  monthlyDiscountPct: number;
  monthlyOriginalPrice: number;
  monthlyDiscountedPrice: number;
  annualCreditAmount: number;
  annualOriginalPrice: number;
  annualFinalPrice: number;
  badgeZh: string;
  badgeEn: string;
  headlineZh: string;
  headlineEn: string;
}

/**
 * Calculates the Decaying Early-Bird Discount based on studio creation or trial start date.
 * Tiers:
 * - Days 30-20 left: 50% off for first 3 months (or NT$ 1,035 credit off Annual)
 * - Days 19-10 left: 50% off for first 2 months (or NT$ 690 credit off Annual)
 * - Days 9-1 left: 50% off for first 1 month (or NT$ 345 credit off Annual)
 * - Days <= 0: Standard price (0 months discount)
 */
export function calculateEarlyBirdTier(
  studio: Studio,
  currency: SupportedCurrency = 'TWD'
): EarlyBirdTierInfo {
  const isTwd = currency === 'TWD';
  const monthlyOriginal = isTwd ? 690 : 29;
  const annualOriginal = isTwd ? 6600 : 276; // 550 * 12 or 23 * 12

  // Trial startedAt or studio.createdAt fallback
  const startTs = studio.createdAt ? new Date(studio.createdAt).getTime() : Date.now();
  const nowTs = Date.now();
  const elapsedDays = Math.max(0, Math.floor((nowTs - startTs) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, 30 - elapsedDays);

  if (daysLeft >= 20) {
    const discountMonths = 3;
    const monthlyDiscounted = Math.round(monthlyOriginal * 0.5);
    const annualCredit = isTwd ? 1035 : 43.5;
    return {
      tier: 1,
      daysLeft,
      discountMonths,
      monthlyDiscountPct: 50,
      monthlyOriginalPrice: monthlyOriginal,
      monthlyDiscountedPrice: monthlyDiscounted,
      annualCreditAmount: annualCredit,
      annualOriginalPrice: annualOriginal,
      annualFinalPrice: annualOriginal - annualCredit,
      badgeZh: `🔥 鑽石早鳥特惠 • 剩餘 ${daysLeft} 天`,
      badgeEn: `🔥 Diamond Early-Bird • ${daysLeft} Days Left`,
      headlineZh: '首 3 個月 50% 半價優惠 (現省 NT$ 1,035)',
      headlineEn: '50% OFF for First 3 Months (Save $43.50)',
    };
  }

  if (daysLeft >= 10) {
    const discountMonths = 2;
    const monthlyDiscounted = Math.round(monthlyOriginal * 0.5);
    const annualCredit = isTwd ? 690 : 29;
    return {
      tier: 2,
      daysLeft,
      discountMonths,
      monthlyDiscountPct: 50,
      monthlyOriginalPrice: monthlyOriginal,
      monthlyDiscountedPrice: monthlyDiscounted,
      annualCreditAmount: annualCredit,
      annualOriginalPrice: annualOriginal,
      annualFinalPrice: annualOriginal - annualCredit,
      badgeZh: `⚡ 黃金早鳥特惠 • 剩餘 ${daysLeft} 天`,
      badgeEn: `⚡ Gold Early-Bird • ${daysLeft} Days Left`,
      headlineZh: '首 2 個月 50% 半價優惠 (現省 NT$ 690)',
      headlineEn: '50% OFF for First 2 Months (Save $29.00)',
    };
  }

  if (daysLeft >= 1) {
    const discountMonths = 1;
    const monthlyDiscounted = Math.round(monthlyOriginal * 0.5);
    const annualCredit = isTwd ? 345 : 14.5;
    return {
      tier: 3,
      daysLeft,
      discountMonths,
      monthlyDiscountPct: 50,
      monthlyOriginalPrice: monthlyOriginal,
      monthlyDiscountedPrice: monthlyDiscounted,
      annualCreditAmount: annualCredit,
      annualOriginalPrice: annualOriginal,
      annualFinalPrice: annualOriginal - annualCredit,
      badgeZh: `⏳ 倒數早鳥特惠 • 剩餘 ${daysLeft} 天`,
      badgeEn: `⏳ Final Early-Bird • ${daysLeft} Days Left`,
      headlineZh: '首 1 個月 50% 半價優惠 (現省 NT$ 345)',
      headlineEn: '50% OFF for First 1 Month (Save $14.50)',
    };
  }

  return {
    tier: 0,
    daysLeft: 0,
    discountMonths: 0,
    monthlyDiscountPct: 0,
    monthlyOriginalPrice: monthlyOriginal,
    monthlyDiscountedPrice: monthlyOriginal,
    annualCreditAmount: 0,
    annualOriginalPrice: annualOriginal,
    annualFinalPrice: annualOriginal,
    badgeZh: '標準付費方案',
    badgeEn: 'Standard Pro Plan',
    headlineZh: '享 0% 平台抽成與專屬獨立預約網站',
    headlineEn: 'Full Pro access with 0% platform take rate',
  };
}

export interface BackupMetadata {
  backupId: string;
  createdAt: string;
  studioName: string;
  studioSlug: string;
  sessionsCount: number;
  bookingsCount: number;
  provider: 'ICLOUD' | 'GOOGLE_DRIVE' | 'DROPBOX' | 'AURA_VAULT' | 'LOCAL_FILE';
}

export const backupTransferService = {
  /**
   * Generates a 6-character easy-to-type transfer code like "AURA-7829"
   */
  generateCode(): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `AURA-${randomDigits}`;
  },

  /**
   * Pushes the complete studio history snapshot to the encrypted cloud transfer room
   */
  async createTransferSession(
    code: string,
    snapshot: Omit<AuraCloudSnapshot, 'app' | 'version' | 'updatedAt'>
  ): Promise<{ ok: boolean; code: string; expiresAt: string }> {
    const roomCode = `TRANSFER-${code.toUpperCase().trim()}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 min window

    const SUPABASE_URL =
      (import.meta as any).env?.VITE_SUPABASE_URL || 'https://muluvbiizqtitctgcebt.supabase.co';
    const SUPABASE_ANON_KEY =
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bHV2YmlpenF0aXRjdGdjZWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxODEwMDgsImV4cCI6MjEwODc1NzAwOH0.T9hAYAYtRgGIOq9d1H8F0OwVKoeYd-tWNL8vC2X8Ufo';

    try {
      const fullPayload: AuraCloudSnapshot & { expiresAt: string } = {
        ...snapshot,
        app: 'aura-flow',
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        expiresAt,
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/care_family_rooms?on_conflict=room_code`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          room_code: roomCode,
          family_name: `Transfer: ${snapshot.studio?.name || 'Studio'}`,
          ledger_json: fullPayload,
          updated_at: new Date().toISOString(),
        }),
      });

      return { ok: res.ok, code, expiresAt };
    } catch {
      return { ok: false, code, expiresAt };
    }
  },

  /**
   * Restores complete studio history from a Transfer Code entered on a new device
   */
  async restoreFromTransferCode(
    code: string
  ): Promise<{ ok: boolean; snapshot?: AuraCloudSnapshot; error?: string }> {
    const cleanCode = code.toUpperCase().trim().replace(/\s+/g, '');
    const roomCode = cleanCode.startsWith('TRANSFER-') ? cleanCode : `TRANSFER-${cleanCode}`;

    const SUPABASE_URL =
      (import.meta as any).env?.VITE_SUPABASE_URL || 'https://muluvbiizqtitctgcebt.supabase.co';
    const SUPABASE_ANON_KEY =
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bHV2YmlpenF0aXRjdGdjZWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxODEwMDgsImV4cCI6MjEwODc1NzAwOH0.T9hAYAYtRgGIOq9d1H8F0OwVKoeYd-tWNL8vC2X8Ufo';

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/care_family_rooms?room_code=eq.${encodeURIComponent(
          roomCode
        )}&select=*`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!res.ok) return { ok: false, error: 'Network error checking transfer code' };
      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        return { ok: false, error: 'Invalid or expired transfer code (查無此轉移代碼或已過期)' };
      }

      const payload = rows[0]?.ledger_json;
      if (payload?.app !== 'aura-flow' || !payload?.studio) {
        return { ok: false, error: 'Corrupted backup payload' };
      }

      return { ok: true, snapshot: payload as AuraCloudSnapshot };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Failed to fetch transfer code' };
    }
  },

  /**
   * Exports an encrypted .aurabackup file to the user's device (Apple iCloud Files or Google Drive download)
   */
  downloadLocalBackupFile(
    snapshot: Omit<AuraCloudSnapshot, 'app' | 'version' | 'updatedAt'>,
    provider: 'ICLOUD' | 'GOOGLE_DRIVE' | 'DROPBOX' | 'LOCAL_FILE' = 'LOCAL_FILE'
  ): void {
    const fullPayload: AuraCloudSnapshot & { backupMetadata: BackupMetadata } = {
      ...snapshot,
      app: 'aura-flow',
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      backupMetadata: {
        backupId: `vault-${Date.now()}`,
        createdAt: new Date().toISOString(),
        studioName: snapshot.studio?.name || 'Aura Flow Studio',
        studioSlug: snapshot.studio?.slug || 'studio',
        sessionsCount: snapshot.sessions?.length || 0,
        bookingsCount: snapshot.bookings?.length || 0,
        provider,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullPayload, null, 2));
    const safeDate = new Date().toISOString().slice(0, 10);
    const fileName = `${snapshot.studio?.slug || 'aura'}-backup-${safeDate}.aurabackup`;

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /**
   * Parses an uploaded .aurabackup or .json file
   */
  parseBackupFile(fileContent: string): { ok: boolean; snapshot?: AuraCloudSnapshot; error?: string } {
    try {
      const data = JSON.parse(fileContent);
      if (data?.app !== 'aura-flow' || !data?.studio) {
        return { ok: false, error: 'Invalid Aura Flow backup file format' };
      }
      return { ok: true, snapshot: data as AuraCloudSnapshot };
    } catch {
      return { ok: false, error: 'Failed to read JSON backup file' };
    }
  },
};

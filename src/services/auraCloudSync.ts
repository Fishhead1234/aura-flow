import {
  Studio,
  ClassSession,
  ClassPack,
  ClientPass,
  Booking,
  WaitlistEntry,
  CreditLedgerEntry,
  StripeConnectOverview,
  Conversation,
  ChatMessage,
  RosterBroadcast,
} from '../types/aura';

export interface AuraCloudSnapshot {
  app: 'aura-flow';
  version: string;
  updatedAt: string;
  studios: Studio[];
  studio: Studio;
  activeStudioId: string;
  sessions: ClassSession[];
  classPacks: ClassPack[];
  userPass: ClientPass;
  bookings: Booking[];
  waitlist: WaitlistEntry[];
  creditLedger: CreditLedgerEntry[];
  stripeOverview: StripeConnectOverview;
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  broadcastHistory: RosterBroadcast[];
}

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://muluvbiizqtitctgcebt.supabase.co';
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bHV2YmlpenF0aXRjdGdjZWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxODEwMDgsImV4cCI6MjEwODc1NzAwOH0.T9hAYAYtRgGIOq9d1H8F0OwVKoeYd-tWNL8vC2X8Ufo';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pzmszFbzWinm5_pJ4SJKWg_joAgjGI3';

const CLOUD_DOC_CODE = 'AURA-FLOW-CLOUD-V1';

function buildHeaders(key: string, extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function supabaseFetch(
  endpoint: string,
  init: Omit<RequestInit, 'headers'>,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  const res = await fetch(endpoint, {
    ...init,
    headers: buildHeaders(SUPABASE_ANON_KEY, extraHeaders),
  });
  if (res.status === 401) {
    return fetch(endpoint, {
      ...init,
      headers: buildHeaders(SUPABASE_PUBLISHABLE_KEY, extraHeaders),
    });
  }
  return res;
}

export const auraCloudSync = {
  async pullState(): Promise<{
    ok: boolean;
    snapshot?: AuraCloudSnapshot;
    updatedAt?: string;
  }> {
    try {
      const endpoint = `${SUPABASE_URL}/rest/v1/care_family_rooms?room_code=eq.${encodeURIComponent(
        CLOUD_DOC_CODE
      )}&select=*`;
      const res = await supabaseFetch(endpoint, { method: 'GET' });
      if (!res.ok) return { ok: false };

      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0]?.ledger_json?.app === 'aura-flow') {
        return {
          ok: true,
          snapshot: rows[0].ledger_json as AuraCloudSnapshot,
          updatedAt: rows[0].updated_at,
        };
      }
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },

  async pushState(snapshot: Omit<AuraCloudSnapshot, 'app' | 'version' | 'updatedAt'>): Promise<{
    ok: boolean;
    updatedAt?: string;
  }> {
    try {
      const nowIso = new Date().toISOString();
      const fullPayload: AuraCloudSnapshot = {
        ...snapshot,
        app: 'aura-flow',
        version: '1.0.0',
        updatedAt: nowIso,
      };

      const endpoint = `${SUPABASE_URL}/rest/v1/care_family_rooms?on_conflict=room_code`;
      const res = await supabaseFetch(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify({
            room_code: CLOUD_DOC_CODE,
            family_name: snapshot.studio?.name || 'Aura Flow Studio',
            ledger_json: fullPayload,
            updated_at: nowIso,
          }),
        },
        {
          Prefer: 'resolution=merge-duplicates,return=minimal',
        }
      );

      return { ok: res.ok, updatedAt: nowIso };
    } catch {
      return { ok: false };
    }
  },
};

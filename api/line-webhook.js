// Vercel Serverless Function: Inbound LINE Official Account (LINE OA) Webhook -> Supabase Cloud Inbox
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://muluvbiizqtitctgcebt.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bHV2YmlpenF0aXRjdGdjZWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxODEwMDgsImV4cCI6MjEwODc1NzAwOH0.T9hAYAYtRgGIOq9d1H8F0OwVKoeYd-tWNL8vC2X8Ufo';
const CLOUD_DOC_CODE = 'AURA-FLOW-CLOUD-V1';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, webhook: 'Aura Flow LINE OA Webhook Ready' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const events = req.body?.events || [];
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(200).json({ ok: true });
    }

    // Fetch current cloud snapshot from Supabase
    const getRes = await fetch(
      `${SUPABASE_URL}/rest/v1/care_family_rooms?room_code=eq.${encodeURIComponent(CLOUD_DOC_CODE)}&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const rows = getRes.ok ? await getRes.json() : [];
    const snapshot = rows?.[0]?.ledger_json;

    if (snapshot && snapshot.app === 'aura-flow') {
      const conversations = Array.isArray(snapshot.conversations) ? [...snapshot.conversations] : [];
      const messages = { ...(snapshot.messages || {}) };

      for (const ev of events) {
        if (ev.type === 'message' && ev.message?.type === 'text') {
          const lineUserId = ev.source?.userId || `line_${Date.now()}`;
          const text = ev.message.text;

          let conv = conversations.find((c) => c.lineUserId === lineUserId || c.channel === 'LINE_OA');
          const convId = conv ? conv.id : `conv-line-${lineUserId.slice(-6)}`;

          if (!conv) {
            conv = {
              id: convId,
              studioId: snapshot.studio?.id || 'studio-sol-01',
              studentId: lineUserId,
              studentName: `LINE 學員 (${lineUserId.slice(-4)})`,
              studentEmail: `${lineUserId.slice(-6)}@line.user`,
              lineUserId,
              sessionTitle: 'LINE 官方帳號諮詢',
              lastMessage: text,
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unreadCount: 1,
              channel: 'LINE_OA',
            };
            conversations.unshift(conv);
          } else {
            conv.lastMessage = text;
            conv.lastMessageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            conv.unreadCount = (conv.unreadCount || 0) + 1;
            conv.lineUserId = lineUserId;
          }

          const existingMsgs = messages[convId] || [];
          messages[convId] = [
            ...existingMsgs,
            {
              id: `msg-line-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              conversationId: convId,
              senderRole: 'STUDENT',
              senderName: conv.studentName,
              content: text,
              channel: 'LINE_OA',
              createdAt: new Date().toISOString(),
              isRead: false,
            },
          ];
        }
      }

      const nowIso = new Date().toISOString();
      const updatedSnapshot = {
        ...snapshot,
        conversations,
        messages,
        updatedAt: nowIso,
      };

      await fetch(`${SUPABASE_URL}/rest/v1/care_family_rooms?on_conflict=room_code`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          room_code: CLOUD_DOC_CODE,
          family_name: snapshot.studio?.name || 'Aura Flow Studio',
          ledger_json: updatedSnapshot,
          updated_at: nowIso,
        }),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(200).json({ ok: true, warning: err.message });
  }
}

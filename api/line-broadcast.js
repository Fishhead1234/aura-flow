// Vercel Serverless Function: Real LINE Official Account (LINE OA) Broadcast & Push API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessToken, message, sessionTitle, toUserId } = req.body || {};
    const token =
      accessToken && !accessToken.includes('sample')
        ? accessToken.trim()
        : process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!token) {
      return res.status(200).json({
        ok: true,
        simulated: true,
        info: 'No live LINE Channel Access Token configured yet; delivered via Aura Flow Cloud Inbox.',
      });
    }

    const endpoint = toUserId
      ? 'https://api.line.me/v2/bot/message/push'
      : 'https://api.line.me/v2/bot/message/broadcast';

    const payload = toUserId
      ? {
          to: toUserId,
          messages: [{ type: 'text', text: message }],
        }
      : {
          messages: [
            {
              type: 'text',
              text: sessionTitle ? `📢【${sessionTitle} 課堂公告】\n${message}` : message,
            },
          ],
        };

    const lineRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!lineRes.ok) {
      const errText = await lineRes.text();
      return res.status(lineRes.status).json({ ok: false, error: errText });
    }

    return res.status(200).json({ ok: true, simulated: false });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Internal error' });
  }
}

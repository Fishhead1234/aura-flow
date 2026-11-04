// Vercel Serverless Function: Real LINE Official Account (LINE OA) Broadcast / Push API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessToken, message, sessionTitle } = req.body || {};
    const token = accessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!token || token.includes('sample')) {
      return res.status(200).json({
        ok: true,
        simulated: true,
        info: 'No live LINE Channel Access Token configured yet; stored in-app.',
      });
    }

    const lineRes = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: [
          {
            type: 'text',
            text: sessionTitle ? `📢【${sessionTitle} 課堂公告】\n${message}` : message,
          },
        ],
      }),
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

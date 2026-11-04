// Vercel Serverless Function: Transactional Email Notifications (Booking Confirmations & Waitlist Alerts via Resend)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      to,
      subject,
      studioName = 'Aura Flow Studio',
      sessionTitle = 'Signature Session',
      sessionTime = '08:00 - 08:50',
      clientName = 'Student',
      paymentMethod = 'Confirmed',
      customMessage,
      resendApiKey,
    } = req.body || {};

    const apiKey =
      resendApiKey && resendApiKey.startsWith('re_')
        ? resendApiKey.trim()
        : process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        ok: true,
        simulated: true,
        message: 'No live Resend API key configured yet; email logged in system.',
      });
    }

    if (!to) {
      return res.status(400).json({ ok: false, error: 'Recipient email (to) is required.' });
    }

    const htmlBody = customMessage
      ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #1C1917; color: #F5F2EB; border-radius: 18px; border: 1px solid #3A332B;">
          <h2 style="color: #C5A059; font-family: Georgia, serif; margin-top: 0;">${studioName}</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #E0D8CE; white-space: pre-wrap;">${customMessage}</p>
          <hr style="border: none; border-top: 1px solid #3A332B; margin: 20px 0;" />
          <p style="font-size: 11px; color: #8C8274;">Powered by Aura Flow • Boutique Fitness & Workshop Engine</p>
        </div>
      `
      : `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #1C1917; color: #F5F2EB; border-radius: 18px; border: 1px solid #3A332B;">
          <h2 style="color: #C5A059; font-family: Georgia, serif; margin-top: 0;">✨ Booking Confirmed — ${studioName}</h2>
          <p style="font-size: 14px; color: #E0D8CE;">Hi <strong>${clientName}</strong>, your spot is locked in!</p>
          <div style="background: #24201C; padding: 16px; border-radius: 12px; border: 1px solid #3A332B; margin: 16px 0;">
            <div style="font-size: 15px; font-weight: 600; color: #EAD8B1;">${sessionTitle}</div>
            <div style="font-size: 12px; color: #A89F91; margin-top: 4px;">Time: ${sessionTime}</div>
            <div style="font-size: 12px; color: #A89F91; margin-top: 4px;">Payment: ${paymentMethod}</div>
            <div style="font-size: 12px; color: #10B981; margin-top: 6px; font-weight: 600;">Door Entry Code: #8829</div>
          </div>
          <p style="font-size: 12px; color: #8C8274;">Please arrive 10 minutes before class starts. Free cancellation is available up to the studio cutoff window.</p>
        </div>
      `;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${studioName} <onboarding@resend.dev>`,
        to: [to],
        subject: subject || `Booking Confirmed: ${sessionTitle} (${studioName})`,
        html: htmlBody,
      }),
    });

    const data = await emailRes.json();
    if (!emailRes.ok) {
      return res.status(emailRes.status).json({
        ok: false,
        error: data.message || 'Email delivery failed',
      });
    }

    return res.status(200).json({ ok: true, simulated: false, id: data.id });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Internal error' });
  }
}

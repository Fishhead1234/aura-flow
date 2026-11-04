import crypto from 'crypto';

// Vercel Serverless Function: Real Payment Gateway Checkout (Stripe + LINE Pay v3)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      provider,
      amount,
      currency = 'TWD',
      sessionTitle = 'Aura Flow Class Booking',
      sessionId = 'sess-01',
      clientEmail,
      originUrl = 'https://auraflow-bay.vercel.app',
      linePayChannelId,
      linePayChannelSecret,
      linePaySandbox = false,
    } = req.body || {};

    // 1. STRIPE CHECKOUT SESSION
    if (provider === 'STRIPE_CARD' || provider === 'APPLE_PAY') {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        return res.status(200).json({
          ok: true,
          simulated: true,
          message: 'STRIPE_SECRET_KEY not set in environment; using instant sandbox confirmation.',
        });
      }

      const zeroDecimalCurrencies = ['JPY', 'KRW'];
      const unitAmount = zeroDecimalCurrencies.includes(currency.toUpperCase())
        ? Math.round(Number(amount))
        : Math.round(Number(amount) * 100);

      const params = new URLSearchParams();
      params.append('mode', 'payment');
      params.append('success_url', `${originUrl}/s/sol-sanctuary?booking=success&session_id=${sessionId}`);
      params.append('cancel_url', `${originUrl}/s/sol-sanctuary?booking=cancelled`);
      if (clientEmail) params.append('customer_email', clientEmail);
      params.append('line_items[0][price_data][currency]', currency.toLowerCase());
      params.append('line_items[0][price_data][product_data][name]', sessionTitle);
      params.append('line_items[0][price_data][unit_amount]', String(unitAmount));
      params.append('line_items[0][quantity]', '1');

      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await stripeRes.json();
      if (!stripeRes.ok) {
        return res.status(stripeRes.status).json({ ok: false, error: data.error?.message || 'Stripe error' });
      }

      return res.status(200).json({
        ok: true,
        simulated: false,
        checkoutUrl: data.url,
        sessionId: data.id,
      });
    }

    // 2. LINE PAY V3 API
    if (provider === 'LINE_PAY') {
      const channelId =
        linePayChannelId && !linePayChannelId.includes('linepay_merchant')
          ? linePayChannelId
          : process.env.LINE_PAY_CHANNEL_ID;
      const channelSecret =
        linePayChannelSecret && !linePayChannelSecret.includes('sec_linepay')
          ? linePayChannelSecret
          : process.env.LINE_PAY_CHANNEL_SECRET;

      if (!channelId || !channelSecret) {
        return res.status(200).json({
          ok: true,
          simulated: true,
          message: 'LINE Pay Merchant credentials not configured yet; using sandbox confirmation.',
        });
      }

      const uri = '/v3/payments/request';
      const nonce = crypto.randomUUID();
      const orderId = `order_${Date.now()}`;
      const bodyObj = {
        amount: Math.round(Number(amount)),
        currency: currency.toUpperCase() === 'TWD' ? 'TWD' : 'USD',
        orderId,
        packages: [
          {
            id: `pkg_${sessionId}`,
            amount: Math.round(Number(amount)),
            name: 'Aura Flow Studio',
            products: [
              {
                id: sessionId,
                name: sessionTitle,
                quantity: 1,
                price: Math.round(Number(amount)),
              },
            ],
          },
        ],
        redirectUrls: {
          confirmUrl: `${originUrl}/s/sol-sanctuary?linepay=confirm&orderId=${orderId}`,
          cancelUrl: `${originUrl}/s/sol-sanctuary?linepay=cancel`,
        },
      };

      const bodyStr = JSON.stringify(bodyObj);
      const signature = crypto
        .createHmac('sha256', channelSecret)
        .update(channelSecret + uri + bodyStr + nonce)
        .digest('base64');

      const baseUrl = linePaySandbox
        ? 'https://sandbox-api-pay.line.me'
        : 'https://api-pay.line.me';

      const lpRes = await fetch(`${baseUrl}${uri}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LINE-ChannelId': String(channelId),
          'X-LINE-Authorization-Nonce': nonce,
          'X-LINE-Authorization': signature,
        },
        body: bodyStr,
      });

      const lpData = await lpRes.json();
      if (lpData.returnCode === '0000' && lpData.info?.paymentUrl?.web) {
        return res.status(200).json({
          ok: true,
          simulated: false,
          checkoutUrl: lpData.info.paymentUrl.web,
        });
      }

      return res.status(400).json({
        ok: false,
        error: lpData.returnMessage || 'LINE Pay request failed',
      });
    }

    return res.status(200).json({ ok: true, simulated: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Internal error' });
  }
}

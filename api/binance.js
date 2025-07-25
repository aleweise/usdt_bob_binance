// Vercel Function alternativa usando CommonJS
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const binanceUrl = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
    
    const payload = {
      asset: "USDT",
      fiat: "BOB",
      tradeType: "BUY",
      page: 1,
      rows: 10,
      payTypes: [],
      publisherType: "merchant"
    };

    console.log('🔄 Vercel CommonJS: Fetching from Binance...');

    const response = await fetch(binanceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Vercel-Function/1.0)'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Binance error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No data from Binance');
    }

    const prices = data.data.map(ad => parseFloat(ad.adv.price)).filter(p => !isNaN(p));
    
    if (prices.length === 0) {
      throw new Error('No valid prices');
    }

    const usdt_min_bob = Math.min(...prices);
    const usdt_avg_bob = prices.reduce((a, b) => a + b, 0) / prices.length;

    const result = {
      success: true,
      usdt_min_bob: parseFloat(usdt_min_bob.toFixed(2)),
      usdt_avg_bob: parseFloat(usdt_avg_bob.toFixed(2)),
      timestamp: new Date().toISOString(),
      source: 'binance_realtime',
      platform: 'vercel_cjs',
      count: prices.length
    };

    console.log('✅ Vercel CommonJS: Success');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Vercel CommonJS error:', error.message);

    const fallback = {
      success: true,
      usdt_min_bob: 13.15,
      usdt_avg_bob: 13.17,
      timestamp: new Date().toISOString(),
      source: 'vercel_cjs_fallback',
      platform: 'vercel_cjs',
      error: error.message
    };

    return res.status(200).json(fallback);
  }
};
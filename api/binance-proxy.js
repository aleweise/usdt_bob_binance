// Vercel Serverless Function para proxy de Binance P2P API
export default async function handler(req, res) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const binanceUrl = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
    
    // Payload por defecto para USDT/BOB
    const payload = {
      asset: "USDT",
      fiat: "BOB",
      tradeType: "BUY",
      page: 1,
      rows: 10,
      payTypes: [],
      publisherType: "merchant"
    };

    console.log('🔄 Vercel: Fetching from Binance P2P...');

    // Hacer request a Binance usando fetch nativo
    const response = await fetch(binanceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No data from Binance');
    }

    // Procesar precios
    const prices = data.data.map(ad => parseFloat(ad.adv.price)).filter(p => !isNaN(p));
    
    if (prices.length === 0) {
      throw new Error('No valid prices found');
    }

    const usdt_min_bob = Math.min(...prices);
    const usdt_avg_bob = prices.reduce((a, b) => a + b, 0) / prices.length;

    const result = {
      success: true,
      usdt_min_bob: parseFloat(usdt_min_bob.toFixed(2)),
      usdt_avg_bob: parseFloat(usdt_avg_bob.toFixed(2)),
      timestamp: new Date().toISOString(),
      source: 'binance_realtime',
      platform: 'vercel',
      count: prices.length
    };

    console.log('✅ Vercel: Success -', result);

    // Cache por 5 minutos
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Vercel error:', error.message);

    // Fallback con datos realistas
    const fallback = {
      success: true, // Marcar como success para que el frontend lo use
      usdt_min_bob: 13.15,
      usdt_avg_bob: 13.17,
      timestamp: new Date().toISOString(),
      source: 'vercel_fallback',
      platform: 'vercel',
      error: error.message,
      note: 'Fallback data due to API error'
    };

    return res.status(200).json(fallback);
  }
}
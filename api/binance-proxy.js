// Vercel Serverless Function para proxy de Binance P2P API
// Soluciona problemas de CORS al acceder a la API desde el navegador

export default async function handler(req, res) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo permitir POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Payload por defecto para USDT/BOB
    const defaultPayload = {
      asset: "USDT",
      fiat: "BOB",
      tradeType: "BUY",
      page: 1,
      rows: 10,
      payTypes: [],
      publisherType: "merchant"
    };

    // Usar payload del request o el por defecto
    let payload = defaultPayload;
    if (req.body) {
      try {
        payload = { ...defaultPayload, ...req.body };
      } catch (e) {
        console.log('Using default payload due to parse error:', e.message);
      }
    }

    console.log('Fetching from Binance with payload:', JSON.stringify(payload));

    const binanceUrl = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

    // Hacer request a Binance
    const response = await fetch(binanceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Binance API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Verificar que tenemos datos válidos
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No data received from Binance API');
    }

    // Procesar los datos para extraer precios
    const prices = data.data.map(ad => {
      const price = parseFloat(ad.adv.price);
      if (isNaN(price)) {
        throw new Error('Invalid price data from Binance');
      }
      return price;
    });

    const usdt_min_bob = Math.min(...prices);
    const usdt_avg_bob = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Respuesta procesada
    const processedData = {
      success: true,
      usdt_min_bob: parseFloat(usdt_min_bob.toFixed(2)),
      usdt_avg_bob: parseFloat(usdt_avg_bob.toFixed(2)),
      timestamp: new Date().toISOString(),
      source: 'binance_realtime',
      raw_data_count: data.data.length,
      prices_found: prices.length,
      platform: 'vercel'
    };

    console.log('Processed data:', JSON.stringify(processedData));

    // Configurar cache headers
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
    res.status(200).json(processedData);

  } catch (error) {
    console.error('Error in Vercel function:', error);

    // Datos de fallback en caso de error
    const fallbackData = {
      success: false,
      error: error.message,
      usdt_min_bob: 13.15,
      usdt_avg_bob: 13.17,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      platform: 'vercel',
      note: 'Using fallback data due to API error'
    };

    res.status(200).json(fallbackData); // Devolver 200 para que el frontend maneje el fallback
  }
}
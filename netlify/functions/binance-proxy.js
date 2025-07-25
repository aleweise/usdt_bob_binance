// Netlify Function para proxy de Binance P2P API
// Soluciona problemas de CORS al acceder a la API desde el navegador

exports.handler = async (event, context) => {
  // Solo permitir POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Importar fetch para Node.js (Netlify Functions usa Node.js)
    const fetch = require('node-fetch');
    
    const binanceUrl = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
    
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
    if (event.body) {
      try {
        const requestPayload = JSON.parse(event.body);
        payload = { ...defaultPayload, ...requestPayload };
      } catch (e) {
        console.log('Using default payload due to JSON parse error:', e.message);
      }
    }

    console.log('Fetching from Binance with payload:', JSON.stringify(payload));

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
      prices_found: prices.length
    };

    console.log('Processed data:', JSON.stringify(processedData));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache por 5 minutos
      },
      body: JSON.stringify(processedData)
    };

  } catch (error) {
    console.error('Error in binance-proxy function:', error);

    // Datos de fallback en caso de error
    const fallbackData = {
      success: false,
      error: error.message,
      usdt_min_bob: 13.15,
      usdt_avg_bob: 13.17,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      note: 'Using fallback data due to API error'
    };

    return {
      statusCode: 200, // Devolver 200 para que el frontend maneje el fallback
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fallbackData)
    };
  }
};
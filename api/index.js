// Función de índice para verificar que el directorio api funciona
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const endpoints = [
    { path: '/api/test', description: 'Función de prueba simple' },
    { path: '/api/binance', description: 'Proxy Binance P2P (CommonJS)' },
    { path: '/api/binance-proxy', description: 'Proxy Binance P2P (ES Modules)' },
    { path: '/api/index', description: 'Esta función (índice)' }
  ];
  
  return res.status(200).json({
    message: 'API Directory is working!',
    timestamp: new Date().toISOString(),
    available_endpoints: endpoints,
    vercel_info: {
      region: process.env.VERCEL_REGION || 'unknown',
      deployment_id: process.env.VERCEL_DEPLOYMENT_ID || 'unknown'
    }
  });
}
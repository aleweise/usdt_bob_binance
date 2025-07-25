// Función de prueba simple para Vercel
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({
    message: 'Vercel function is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
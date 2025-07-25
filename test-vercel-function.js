// Script para probar la función de Vercel localmente
const handler = require('./api/binance-proxy.js').default;

async function testVercelFunction() {
    console.log('🧪 Probando función Vercel binance-proxy...');
    
    // Mock de request y response para Vercel
    const req = {
        method: 'POST',
        body: {
            asset: "USDT",
            fiat: "BOB",
            tradeType: "BUY",
            page: 1,
            rows: 10,
            payTypes: [],
            publisherType: "merchant"
        }
    };
    
    const res = {
        headers: {},
        statusCode: 200,
        body: null,
        
        setHeader(key, value) {
            this.headers[key] = value;
        },
        
        status(code) {
            this.statusCode = code;
            return this;
        },
        
        json(data) {
            this.body = data;
            return this;
        },
        
        end() {
            return this;
        }
    };
    
    try {
        await handler(req, res);
        
        console.log('📊 Resultado:');
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Data:', res.body);
        
        if (res.body && res.body.success) {
            console.log(`✅ Éxito - Min: Bs.${res.body.usdt_min_bob}, Avg: Bs.${res.body.usdt_avg_bob}`);
            console.log(`🔗 Plataforma: ${res.body.platform}`);
        } else if (res.body) {
            console.log(`⚠️ Fallback - Error: ${res.body.error}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testVercelFunction();
}

module.exports = { testVercelFunction };
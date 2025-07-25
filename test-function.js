// Script para probar la función de Netlify localmente
const { handler } = require('./netlify/functions/binance-proxy');

async function testFunction() {
    console.log('🧪 Probando función binance-proxy...');
    
    const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
            asset: "USDT",
            fiat: "BOB",
            tradeType: "BUY",
            page: 1,
            rows: 10,
            payTypes: [],
            publisherType: "merchant"
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const context = {};
    
    try {
        const result = await handler(event, context);
        console.log('📊 Resultado:');
        console.log('Status:', result.statusCode);
        console.log('Headers:', result.headers);
        
        const data = JSON.parse(result.body);
        console.log('Data:', data);
        
        if (data.success) {
            console.log(`✅ Éxito - Min: Bs.${data.usdt_min_bob}, Avg: Bs.${data.usdt_avg_bob}`);
        } else {
            console.log(`⚠️ Fallback - Error: ${data.error}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testFunction();
}

module.exports = { testFunction };
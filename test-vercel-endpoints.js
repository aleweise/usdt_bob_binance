// Script para probar todos los endpoints de Vercel
async function testVercelEndpoints() {
    const baseUrl = 'https://tu-proyecto.vercel.app'; // Reemplaza con tu URL real
    
    const endpoints = [
        { name: 'Test Function', url: '/api/test', method: 'GET' },
        { name: 'Binance CommonJS', url: '/api/binance', method: 'POST' },
        { name: 'Binance ES Modules', url: '/api/binance-proxy', method: 'POST' }
    ];
    
    const payload = {
        asset: "USDT",
        fiat: "BOB",
        tradeType: "BUY",
        page: 1,
        rows: 10,
        payTypes: [],
        publisherType: "merchant"
    };
    
    console.log('🧪 Probando endpoints de Vercel...');
    console.log('=' * 50);
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\n📡 Probando: ${endpoint.name}`);
            console.log(`🔗 URL: ${baseUrl}${endpoint.url}`);
            
            const options = {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (endpoint.method === 'POST') {
                options.body = JSON.stringify(payload);
            }
            
            const response = await fetch(`${baseUrl}${endpoint.url}`, options);
            
            console.log(`📊 Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Respuesta exitosa:');
                console.log(JSON.stringify(data, null, 2));
                
                if (data.usdt_min_bob && data.usdt_avg_bob) {
                    console.log(`💰 Precios: Min Bs.${data.usdt_min_bob}, Avg Bs.${data.usdt_avg_bob}`);
                }
            } else {
                const errorText = await response.text();
                console.log('❌ Error:');
                console.log(errorText);
            }
            
        } catch (error) {
            console.log(`❌ Error de conexión: ${error.message}`);
        }
        
        console.log('-'.repeat(40));
    }
    
    console.log('\n🎯 Resumen:');
    console.log('- Si /api/test funciona: Vercel está operativo');
    console.log('- Si /api/binance funciona: Usa CommonJS');
    console.log('- Si /api/binance-proxy funciona: Usa ES modules');
    console.log('- Si ninguno funciona: Hay un problema de configuración');
}

// Para usar en el navegador
if (typeof window !== 'undefined') {
    window.testVercelEndpoints = testVercelEndpoints;
    console.log('💡 Ejecuta: testVercelEndpoints() en la consola');
}

// Para usar en Node.js
if (typeof module !== 'undefined') {
    module.exports = { testVercelEndpoints };
}

// Auto-ejecutar si se llama directamente
if (typeof require !== 'undefined' && require.main === module) {
    testVercelEndpoints();
}
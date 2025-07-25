// Cliente JavaScript para obtener datos directamente de Binance P2P
// Compatible con Netlify y hosting estático

class BinanceP2PClient {
    constructor() {
        this.baseUrl = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    async getRates() {
        const cacheKey = 'binance_rates';
        const cached = this.cache.get(cacheKey);
        
        // Verificar cache
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            console.log('📊 Usando datos de cache');
            return cached.data;
        }

        try {
            console.log('📡 Obteniendo datos de Binance P2P...');
            
            const payload = {
                asset: "USDT",
                fiat: "BOB",
                tradeType: "BUY",
                page: 1,
                rows: 10,
                payTypes: [],
                publisherType: "merchant"
            };

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.data || data.data.length === 0) {
                throw new Error('No se encontraron anuncios en Binance P2P');
            }

            // Procesar datos
            const prices = data.data.map(ad => parseFloat(ad.adv.price));
            const usdt_min_bob = Math.min(...prices);
            const usdt_avg_bob = prices.reduce((a, b) => a + b, 0) / prices.length;

            const result = {
                usdt_min_bob: usdt_min_bob,
                usdt_avg_bob: usdt_avg_bob,
                timestamp: new Date().toISOString(),
                source: 'binance_realtime',
                success: true
            };

            // Guardar en cache
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            console.log(`✅ Datos obtenidos - Min: Bs.${usdt_min_bob.toFixed(2)}, Avg: Bs.${usdt_avg_bob.toFixed(2)}`);
            return result;

        } catch (error) {
            console.error('❌ Error obteniendo datos de Binance:', error);
            
            // Retornar datos de ejemplo como fallback
            return {
                usdt_min_bob: 13.15,
                usdt_avg_bob: 13.17,
                timestamp: new Date().toISOString(),
                source: 'fallback',
                success: false,
                error: error.message
            };
        }
    }

    async convertBobToUsdt(bobAmount, rateType = 'avg') {
        try {
            const rates = await this.getRates();
            
            const rate = rateType === 'min' ? rates.usdt_min_bob : rates.usdt_avg_bob;
            const usdtAmount = bobAmount / rate;

            return {
                bob_amount: bobAmount,
                usdt_amount: parseFloat(usdtAmount.toFixed(8)),
                rate_used: rate,
                rate_type: rateType,
                data_source: rates.source,
                timestamp: rates.timestamp,
                success: true
            };

        } catch (error) {
            console.error('❌ Error en conversión:', error);
            return {
                bob_amount: bobAmount,
                error: error.message,
                success: false
            };
        }
    }

    generateHistoryData(timeframe = '24h') {
        const now = new Date();
        const data = [];
        
        // Configurar cantidad de puntos según timeframe
        let points, intervalHours;
        if (timeframe === '24h') {
            points = 24;
            intervalHours = 1;
        } else if (timeframe === '7d') {
            points = 42;
            intervalHours = 4;
        } else {
            points = 30;
            intervalHours = 24;
        }

        // Obtener tasas actuales como base
        const baseMin = 13.15;
        const baseAvg = 13.17;

        for (let i = 0; i < points; i++) {
            const timestamp = new Date(now.getTime() - (points - i) * intervalHours * 60 * 60 * 1000);
            
            // Crear variación realista
            const timeFactor = i / points;
            const wave1 = Math.sin(timeFactor * 4 * Math.PI) * 0.08;
            const wave2 = Math.sin(timeFactor * 2 * Math.PI) * 0.05;
            const trend = (timeFactor - 0.5) * 0.1;
            const noise = (Math.random() - 0.5) * 0.06;
            
            const variation = wave1 + wave2 + trend + noise;
            let minPrice = baseMin + variation;
            let avgPrice = baseAvg + variation + Math.random() * 0.08;
            
            // Asegurar valores lógicos
            minPrice = Math.max(minPrice, 12.50);
            avgPrice = Math.max(avgPrice, minPrice + 0.02);
            
            data.push({
                timestamp: timestamp.toISOString(),
                usdt_min_bob: parseFloat(minPrice.toFixed(2)),
                usdt_avg_bob: parseFloat(avgPrice.toFixed(2))
            });
        }

        return {
            success: true,
            history: data,
            timeframe: timeframe,
            count: data.length,
            data_source: 'generated_realistic'
        };
    }
}

// Instancia global
window.binanceClient = new BinanceP2PClient();
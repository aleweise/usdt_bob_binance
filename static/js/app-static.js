// Aplicación estática del convertidor BOB → USDT
// Compatible con Netlify y hosting estático

class StaticBOBUSDTConverter {
    constructor() {
        this.chart = null;
        this.binanceClient = window.binanceClient;
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeTheme();
        this.loadInitialData();
    }

    initializeElements() {
        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');
        this.refreshBtn = document.getElementById('refreshRates');
        
        // Rates display
        this.minRateEl = document.getElementById('minRate');
        this.avgRateEl = document.getElementById('avgRate');
        this.ratesTimestamp = document.getElementById('ratesTimestamp');
        this.rateSource = document.getElementById('rateSource');
        
        // Converter form
        this.bobAmountInput = document.getElementById('bobAmount');
        this.convertBtn = document.getElementById('convertBtn');
        this.rateTypeInputs = document.querySelectorAll('input[name="rateType"]');
        
        // Results
        this.conversionResult = document.getElementById('conversionResult');
        this.errorMessage = document.getElementById('errorMessage');
        this.resultBob = document.getElementById('resultBob');
        this.resultUsdt = document.getElementById('resultUsdt');
        this.resultRate = document.getElementById('resultRate');
        this.resultSource = document.getElementById('resultSource');
        this.resultTimestamp = document.getElementById('resultTimestamp');
        this.errorText = document.getElementById('errorText');
        
        // Quick convert buttons
        this.quickButtons = document.querySelectorAll('.quick-btn');
        
        // Chart elements
        this.chartCanvas = document.getElementById('priceChart');
        this.chartContainer = document.getElementById('chartContainer');
        this.chartLoading = document.getElementById('chartLoading');
        this.chartError = document.getElementById('chartError');
        this.chartRefresh = document.getElementById('chartRefresh');
        this.chartTimeframe = document.getElementById('chartTimeframe');
        this.chartRetry = document.getElementById('chartRetry');
        
        // Loading overlay
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    initializeEventListeners() {
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Refresh rates
        this.refreshBtn.addEventListener('click', () => this.loadRates());
        
        // Convert button
        this.convertBtn.addEventListener('click', () => this.performConversion());
        
        // Enter key on amount input
        this.bobAmountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performConversion();
            }
        });
        
        // Input validation
        this.bobAmountInput.addEventListener('input', () => this.validateInput());
        
        // Quick convert buttons
        this.quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.amount;
                this.bobAmountInput.value = amount;
                this.performConversion();
            });
        });
        
        // Chart controls
        this.chartRefresh.addEventListener('click', () => this.loadChartData());
        this.chartTimeframe.addEventListener('change', () => this.loadChartData());
        this.chartRetry.addEventListener('click', () => this.loadChartData());
        
        // Auto-refresh rates every 5 minutes
        setInterval(() => this.loadRates(), 5 * 60 * 1000);
        
        // Auto-refresh chart every 10 minutes
        setInterval(() => this.loadChartData(), 10 * 60 * 1000);
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const icon = this.themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            this.themeToggle.title = 'Cambiar a modo claro';
        } else {
            icon.className = 'fas fa-moon';
            this.themeToggle.title = 'Cambiar a modo oscuro';
        }
        
        setTimeout(() => this.updateChartTheme(), 100);
    }

    async loadInitialData() {
        await this.loadRates();
        await this.loadChartData();
    }

    async loadRates() {
        try {
            this.refreshBtn.classList.add('loading');
            
            const data = await this.binanceClient.getRates();
            
            if (data.success) {
                this.updateRatesDisplay(data);
            } else {
                this.showError('Error al cargar las tasas: ' + (data.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error loading rates:', error);
            this.showError('Error de conexión al cargar las tasas');
        } finally {
            this.refreshBtn.classList.remove('loading');
        }
    }

    updateRatesDisplay(data) {
        this.minRateEl.textContent = `Bs. ${data.usdt_min_bob.toFixed(2)}`;
        this.avgRateEl.textContent = `Bs. ${data.usdt_avg_bob.toFixed(2)}`;
        
        const timestamp = new Date(data.timestamp);
        this.ratesTimestamp.textContent = this.formatTimestamp(timestamp);
        
        const sourceMap = {
            'binance_realtime': 'Binance P2P (Tiempo Real)',
            'fallback': 'Datos de Respaldo',
            'cache': 'Cache Local'
        };
        this.rateSource.textContent = `Fuente: ${sourceMap[data.source] || data.source}`;
    }

    validateInput() {
        const amount = parseFloat(this.bobAmountInput.value);
        const isValid = !isNaN(amount) && amount > 0;
        
        this.convertBtn.disabled = !isValid;
        
        if (this.bobAmountInput.value && !isValid) {
            this.bobAmountInput.style.borderColor = 'var(--error-color)';
        } else {
            this.bobAmountInput.style.borderColor = 'var(--border-color)';
        }
    }

    async performConversion() {
        const amount = parseFloat(this.bobAmountInput.value);
        
        if (isNaN(amount) || amount <= 0) {
            this.showError('Por favor ingresa una cantidad válida mayor a 0');
            return;
        }

        const rateType = document.querySelector('input[name="rateType"]:checked').value;
        
        try {
            this.showLoading(true);
            this.hideMessages();
            
            const result = await this.binanceClient.convertBobToUsdt(amount, rateType);
            
            if (result.success) {
                this.showConversionResult(result);
            } else {
                this.showError(result.error || 'Error en la conversión');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError('Error de conexión durante la conversión');
        } finally {
            this.showLoading(false);
        }
    }

    showConversionResult(data) {
        this.resultBob.textContent = `Bs. ${this.formatNumber(data.bob_amount)}`;
        this.resultUsdt.textContent = `${data.usdt_amount.toFixed(8)} USDT`;
        this.resultRate.textContent = `Bs. ${data.rate_used.toFixed(2)} por USDT (${data.rate_type === 'min' ? 'mínimo' : 'promedio'})`;
        
        const sourceMap = {
            'binance_realtime': 'Binance P2P (Tiempo Real)',
            'fallback': 'Datos de Respaldo',
            'cache': 'Cache Local'
        };
        this.resultSource.textContent = sourceMap[data.data_source] || data.data_source;
        
        const timestamp = new Date(data.timestamp);
        this.resultTimestamp.textContent = this.formatTimestamp(timestamp);
        
        this.conversionResult.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
        
        this.conversionResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.conversionResult.classList.add('hidden');
        
        this.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideMessages() {
        this.conversionResult.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.remove('hidden');
            this.convertBtn.disabled = true;
        } else {
            this.loadingOverlay.classList.add('hidden');
            this.convertBtn.disabled = false;
        }
    }

    async loadChartData() {
        try {
            this.showChartLoading(true);
            this.chartRefresh.classList.add('loading');
            
            const timeframe = this.chartTimeframe.value;
            const data = this.binanceClient.generateHistoryData(timeframe);
            
            if (data.success && data.history && data.history.length > 0) {
                this.updateChart(data.history, timeframe);
                this.showChartError(false);
                console.log(`📊 Gráfico actualizado: ${data.count} puntos (${timeframe})`);
            } else {
                this.showChartError(true, 'No hay datos disponibles');
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
            this.showChartError(true, `Error: ${error.message}`);
        } finally {
            this.showChartLoading(false);
            this.chartRefresh.classList.remove('loading');
        }
    }

    updateChart(historyData, timeframe) {
        const ctx = this.chartCanvas.getContext('2d');
        
        const labels = historyData.map(item => {
            const date = new Date(item.timestamp);
            if (timeframe === '24h') {
                return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
            } else if (timeframe === '7d') {
                return date.toLocaleDateString('es-BO', { month: 'short', day: 'numeric', hour: '2-digit' });
            } else {
                return date.toLocaleDateString('es-BO', { month: 'short', day: 'numeric' });
            }
        });
        
        const minPrices = historyData.map(item => item.usdt_min_bob);
        const avgPrices = historyData.map(item => item.usdt_avg_bob);
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#f1f5f9' : '#1e293b';
        const gridColor = isDark ? '#475569' : '#e2e8f0';
        const primaryColor = isDark ? '#60a5fa' : '#3b82f6';
        const successColor = isDark ? '#34d399' : '#10b981';
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Precio Promedio',
                        data: avgPrices,
                        borderColor: primaryColor,
                        backgroundColor: primaryColor + '20',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: primaryColor,
                        pointBorderColor: primaryColor,
                        pointRadius: 3,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Precio Mínimo',
                        data: minPrices,
                        borderColor: successColor,
                        backgroundColor: successColor + '20',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: successColor,
                        pointBorderColor: successColor,
                        pointRadius: 3,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                const dataIndex = context[0].dataIndex;
                                const originalDate = new Date(historyData[dataIndex].timestamp);
                                return originalDate.toLocaleString('es-BO');
                            },
                            label: function(context) {
                                return `${context.dataset.label}: Bs. ${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            maxTicksLimit: timeframe === '24h' ? 12 : 8
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return 'Bs. ' + value.toFixed(2);
                            }
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    }

    showChartLoading(show) {
        if (show) {
            this.chartLoading.classList.remove('hidden');
            this.chartError.classList.add('hidden');
        } else {
            this.chartLoading.classList.add('hidden');
        }
    }

    showChartError(show, message = 'Error al cargar los datos del gráfico') {
        if (show) {
            this.chartError.classList.remove('hidden');
            this.chartError.querySelector('p').textContent = message;
            this.chartLoading.classList.add('hidden');
        } else {
            this.chartError.classList.add('hidden');
        }
    }

    updateChartTheme() {
        if (this.chart) {
            this.loadChartData();
        }
    }

    formatNumber(num) {
        return new Intl.NumberFormat('es-BO').format(num);
    }

    formatTimestamp(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) {
            return 'Hace menos de 1 minuto';
        } else if (diffMins < 60) {
            return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('es-BO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.converter = new StaticBOBUSDTConverter();
    
    console.log('🚀 Convertidor BOB → USDT (Versión Estática) inicializado');
    console.log('📡 Conectando directamente a Binance P2P API');
    console.log('🌐 Compatible con Netlify y hosting estático');
});
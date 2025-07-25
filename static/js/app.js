// Aplicación principal del convertidor BOB → USDT
class BOBUSDTConverter {
    constructor() {
        this.chart = null;
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
        // Load saved theme or default to light
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
        
        // Update theme toggle icon
        const icon = this.themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            this.themeToggle.title = 'Cambiar a modo claro';
        } else {
            icon.className = 'fas fa-moon';
            this.themeToggle.title = 'Cambiar a modo oscuro';
        }
        
        // Update chart theme if chart exists
        setTimeout(() => this.updateChartTheme(), 100);
    }

    async loadInitialData() {
        await this.loadRates();
        await this.loadChartData();
    }

    async loadRates() {
        try {
            this.refreshBtn.classList.add('loading');
            
            const response = await fetch('/api/rates');
            const data = await response.json();
            
            if (data.success) {
                this.updateRatesDisplay(data);
            } else {
                this.showError('Error al cargar las tasas: ' + data.error);
            }
        } catch (error) {
            console.error('Error loading rates:', error);
            this.showError('Error de conexión al cargar las tasas');
        } finally {
            this.refreshBtn.classList.remove('loading');
        }
    }

    updateRatesDisplay(data) {
        // Update rate values
        this.minRateEl.textContent = `Bs. ${data.usdt_min_bob.toFixed(2)}`;
        this.avgRateEl.textContent = `Bs. ${data.usdt_avg_bob.toFixed(2)}`;
        
        // Update timestamp
        const timestamp = new Date(data.timestamp);
        this.ratesTimestamp.textContent = this.formatTimestamp(timestamp);
        
        // Update source
        const sourceMap = {
            'binance_realtime': 'Binance P2P (Tiempo Real)',
            'database': 'Base de Datos Local',
            'github_api': 'API Externa'
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
            
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    rate_type: rateType
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showConversionResult(data);
            } else {
                this.showError(data.error || 'Error en la conversión');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError('Error de conexión durante la conversión');
        } finally {
            this.showLoading(false);
        }
    }

    showConversionResult(data) {
        // Update result values
        this.resultBob.textContent = `Bs. ${this.formatNumber(data.bob_amount)}`;
        this.resultUsdt.textContent = `${data.usdt_amount.toFixed(8)} USDT`;
        this.resultRate.textContent = `Bs. ${data.rate_used.toFixed(2)} por USDT (${data.rate_type === 'min' ? 'mínimo' : 'promedio'})`;
        
        // Update source and timestamp
        const sourceMap = {
            'binance_realtime': 'Binance P2P (Tiempo Real)',
            'database': 'Base de Datos Local',
            'github_api': 'API Externa'
        };
        this.resultSource.textContent = sourceMap[data.data_source] || data.data_source;
        
        const timestamp = new Date(data.timestamp);
        this.resultTimestamp.textContent = this.formatTimestamp(timestamp);
        
        // Show result
        this.conversionResult.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
        
        // Scroll to result
        this.conversionResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.conversionResult.classList.add('hidden');
        
        // Scroll to error
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

    async loadChartData() {
        try {
            this.showChartLoading(true);
            this.chartRefresh.classList.add('loading');
            
            const timeframe = this.chartTimeframe.value;
            const response = await fetch(`/api/history?timeframe=${timeframe}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.history && data.history.length > 0) {
                this.updateChart(data.history, timeframe);
                this.showChartError(false);
                
                // Mostrar información sobre la fuente de datos
                if (data.data_source === 'sample') {
                    console.log('📊 Mostrando datos de ejemplo - Base de datos no disponible');
                } else {
                    console.log(`📊 Datos cargados: ${data.count} registros de la base de datos`);
                }
            } else {
                this.showChartError(true, data.error || 'No hay datos disponibles');
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
            this.showChartError(true, `Error de conexión: ${error.message}`);
        } finally {
            this.showChartLoading(false);
            this.chartRefresh.classList.remove('loading');
        }
    }

    updateChart(historyData, timeframe) {
        const ctx = this.chartCanvas.getContext('2d');
        
        // Preparar datos para Chart.js
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
        
        // Destruir gráfico existente si existe
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Obtener colores del tema actual
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#f1f5f9' : '#1e293b';
        const gridColor = isDark ? '#475569' : '#e2e8f0';
        const primaryColor = isDark ? '#60a5fa' : '#3b82f6';
        const successColor = isDark ? '#34d399' : '#10b981';
        
        // Crear nuevo gráfico
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
                        display: false // Usamos nuestra propia leyenda
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
                },
                elements: {
                    point: {
                        hoverBorderWidth: 3
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

    // Actualizar gráfico cuando cambie el tema
    updateChartTheme() {
        if (this.chart) {
            // Recargar datos para aplicar nuevos colores
            this.loadChartData();
        }
    }

    // Función de debug para verificar estado de la base de datos
    async debugDatabaseStatus() {
        try {
            const response = await fetch('/api/debug/db-status');
            const status = await response.json();
            
            console.log('🔍 Estado de la Base de Datos:');
            console.log('- Configuración cargada:', status.config_loaded);
            console.log('- Conexión OK:', status.connection_ok);
            console.log('- Tabla existe:', status.table_exists);
            console.log('- Registros:', status.record_count);
            
            if (status.error) {
                console.error('❌ Error:', status.error);
            }
            
            if (status.config) {
                console.log('📋 Configuración:', status.config);
            }
            
            return status;
        } catch (error) {
            console.error('Error verificando estado de BD:', error);
            return null;
        }
    }
}

// Utility functions for enhanced UX
class UIEnhancements {
    static addRippleEffect() {
        document.addEventListener('click', function(e) {
            if (e.target.matches('.convert-btn, .quick-btn, .theme-toggle, .refresh-btn')) {
                const button = e.target;
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            }
        });
        
        // Add ripple animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    static addTooltips() {
        // Simple tooltip implementation
        document.querySelectorAll('[title]').forEach(el => {
            el.addEventListener('mouseenter', function(e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.title;
                tooltip.style.cssText = `
                    position: absolute;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    padding: 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                    box-shadow: var(--shadow-md);
                    z-index: 1000;
                    pointer-events: none;
                    border: 1px solid var(--border-color);
                `;
                
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                
                this.addEventListener('mouseleave', () => tooltip.remove(), { once: true });
            });
        });
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main application
    window.converter = new BOBUSDTConverter();
    
    // Add UI enhancements
    UIEnhancements.addRippleEffect();
    UIEnhancements.addTooltips();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + D to toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            window.converter.toggleTheme();
        }
        
        // Ctrl/Cmd + R to refresh rates
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            window.converter.loadRates();
        }
    });
    
    console.log('🚀 Convertidor BOB → USDT inicializado correctamente');
    console.log('💡 Comandos disponibles:');
    console.log('   window.converter.debugDatabaseStatus() - Verificar estado de BD');
    console.log('   window.converter.loadChartData() - Recargar gráfico');
    console.log('   window.converter.loadRates() - Recargar tasas');
});
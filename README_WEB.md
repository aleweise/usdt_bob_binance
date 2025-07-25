# 🚀 Convertidor BOB → USDT con Interfaz Web

Una aplicación web moderna para convertir Bolivianos (BOB) a USDT usando datos en tiempo real de Binance P2P, con gráficos interactivos y modo oscuro/claro.

![Interfaz Web](https://img.shields.io/badge/Interfaz-Web%20Moderna-blue)
![Python](https://img.shields.io/badge/Python-3.6+-green)
![Flask](https://img.shields.io/badge/Flask-2.0+-red)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4+-orange)

## ✨ Características Principales

### 🎨 **Interfaz Web Moderna**
- **Modo Oscuro/Claro** - Toggle suave entre temas con persistencia
- **Diseño Responsive** - Optimizado para móviles y desktop
- **Animaciones Fluidas** - Transiciones y efectos visuales atractivos
- **Validación en Tiempo Real** - Feedback inmediato al usuario

### 📊 **Gráficos Interactivos**
- **Historial de Precios** - Visualización de tendencias con Chart.js
- **Múltiples Timeframes** - 24h, 7 días, 30 días
- **Tooltips Informativos** - Detalles completos al hacer hover
- **Actualización Automática** - Datos frescos cada 10 minutos

### 💱 **Convertidor Avanzado**
- **Conversión en Tiempo Real** - Datos directos de Binance P2P
- **Múltiples Fuentes** - Binance, base de datos local, API externa
- **Dos Tipos de Precio** - Mínimo y promedio
- **Conversión Rápida** - Botones predefinidos para cantidades comunes

### 🛠️ **Características Técnicas**
- **API REST** - Endpoints para conversiones y datos históricos
- **Manejo Robusto de Errores** - Fallbacks automáticos
- **Logging Completo** - Monitoreo y debugging
- **Datos de Ejemplo** - Funciona sin base de datos

## 🚀 Instalación y Uso

### **Requisitos Previos**
- Python 3.6 o superior
- MySQL/MariaDB (opcional)
- Navegador web moderno

### **Instalación Rápida**
```bash
# Clonar el repositorio
git clone https://github.com/aleweise/usdt_bob_binance.git
cd usdt_bob_binance

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos (opcional)
cp db_config.example.ini db_config.ini
# Editar db_config.ini con tus credenciales

# Iniciar la aplicación web
python start_web.py
```

### **Acceso**
Abre tu navegador en: `http://localhost:5000`

## 📱 Capturas de Pantalla

### Modo Claro
- Interfaz limpia y moderna
- Colores suaves y profesionales
- Excelente legibilidad

### Modo Oscuro
- Diseño elegante para uso nocturno
- Colores vibrantes y contrastantes
- Menos fatiga visual

### Gráfico Interactivo
- Visualización clara de tendencias
- Múltiples series de datos
- Controles intuitivos

## 🔧 Uso de la Aplicación

### **Conversión Simple**
1. Ingresa la cantidad en BOB
2. Selecciona tipo de precio (mínimo/promedio)
3. Haz clic en "Convertir"
4. Ve el resultado detallado

### **Conversión Rápida**
- Usa los botones predefinidos: 100, 500, 1K, 5K, 10K BOB
- Un clic para conversión instantánea

### **Gráfico de Historial**
- Cambia el timeframe (24h, 7d, 30d)
- Haz hover para ver detalles
- Actualiza manualmente o espera la actualización automática

### **Cambio de Tema**
- Haz clic en el ícono de luna/sol en la esquina superior
- El tema se guarda automáticamente

## 🎯 API Endpoints

### **Conversión**
```
POST /api/convert
{
  "amount": 1000,
  "rate_type": "avg"
}
```

### **Tasas Actuales**
```
GET /api/rates
```

### **Historial**
```
GET /api/history?timeframe=24h
```

### **Debug**
```
GET /api/debug/db-status
```

## ⌨️ Atajos de Teclado

- `Ctrl/Cmd + D` - Cambiar tema
- `Ctrl/Cmd + R` - Actualizar tasas
- `Enter` - Convertir (cuando el input está enfocado)

## 🔍 Comandos de Debug

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Verificar estado de la base de datos
window.converter.debugDatabaseStatus()

// Recargar gráfico manualmente
window.converter.loadChartData()

// Recargar tasas manualmente
window.converter.loadRates()
```

## 📂 Estructura del Proyecto

```
├── web_app.py                 # Aplicación Flask principal
├── bob_to_usdt_converter.py   # Lógica de conversión
├── convert_cli.py             # Interfaz de línea de comandos
├── start_web.py               # Script de inicio
├── templates/
│   └── index.html             # Interfaz web principal
├── static/
│   ├── css/style.css          # Estilos con soporte para temas
│   └── js/app.js              # JavaScript interactivo
├── .kiro/steering/            # Documentación del proyecto
└── requirements.txt           # Dependencias Python
```

## 🛠️ Tecnologías Utilizadas

- **Backend**: Python, Flask, MySQL
- **Frontend**: HTML5, CSS3, JavaScript ES6
- **Gráficos**: Chart.js
- **Estilos**: CSS Variables, Flexbox, Grid
- **API**: Binance P2P REST API

## 🔒 Configuración de Seguridad

- Credenciales de BD externalizadas
- Validación de entrada robusta
- Manejo seguro de errores
- Headers de seguridad HTTP

## 📈 Características Futuras

- [ ] Alertas de precio por email/SMS
- [ ] Más exchanges (Coinbase, Kraken)
- [ ] Exportación de datos (CSV, PDF)
- [ ] Dashboard administrativo
- [ ] API de terceros mejorada
- [ ] Notificaciones push

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

Desarrollado para el seguimiento de tasas USDT/BOB desde Binance P2P

---

⭐ **¡Dale una estrella si te gusta el proyecto!** ⭐
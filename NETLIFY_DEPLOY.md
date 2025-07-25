# 🚀 Despliegue en Netlify - Convertidor BOB → USDT

Guía completa para desplegar la versión estática del convertidor en Netlify con datos reales de Binance P2P.

## 📋 Archivos para Netlify

### **Archivos Principales:**
- `static-app.html` - Aplicación principal (punto de entrada)
- `netlify.toml` - Configuración de Netlify
- `static/` - Recursos estáticos (CSS, JS, imágenes)

### **JavaScript Específico:**
- `static/js/binance-api.js` - Cliente para API de Binance P2P
- `static/js/app-static.js` - Aplicación sin backend
- `static/css/style.css` - Estilos (mismo archivo)

## 🌐 Configuración de Netlify

### **1. Configuración Automática:**
El archivo `netlify.toml` incluye:
- ✅ Redirects para SPA
- ✅ Headers de seguridad
- ✅ Cache optimizado
- ✅ CSP para Binance API

### **2. Variables de Entorno:**
No se requieren variables de entorno para la versión estática.

### **3. Build Settings:**
```
Build command: echo 'Static site - no build required'
Publish directory: .
```

## 🔧 Pasos de Despliegue

### **Opción 1: Deploy Directo**
1. Sube los archivos a tu repositorio GitHub
2. Conecta el repo a Netlify
3. Configura:
   - **Build command**: `echo 'Static site'`
   - **Publish directory**: `.`
4. Deploy automático

### **Opción 2: Drag & Drop**
1. Crea una carpeta con estos archivos:
   ```
   /
   ├── static-app.html
   ├── netlify.toml
   └── static/
       ├── css/style.css
       ├── js/binance-api.js
       └── js/app-static.js
   ```
2. Arrastra la carpeta a Netlify

### **Opción 3: Netlify CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

## 🎯 URLs de Acceso

Una vez desplegado, la aplicación estará disponible en:
- `https://tu-sitio.netlify.app/` → Redirige a static-app.html
- `https://tu-sitio.netlify.app/app` → Aplicación principal
- `https://tu-sitio.netlify.app/converter` → Alias del convertidor

## 📊 Características de la Versión Estática

### **✅ Funciona Sin Backend:**
- Obtiene datos directamente de Binance P2P API
- No requiere servidor Python/Flask
- Compatible con hosting estático

### **✅ Datos Reales:**
- Precios en tiempo real desde Binance
- Cache local de 5 minutos
- Fallback automático en caso de error

### **✅ Funcionalidades Completas:**
- Conversión BOB → USDT
- Gráficos interactivos
- Modo oscuro/claro
- Responsive design

## 🔒 Seguridad y CORS

### **Content Security Policy:**
```
connect-src 'self' https://p2p.binance.com
```

### **Manejo de CORS:**
La API de Binance P2P permite requests desde navegadores, pero si hay problemas:

1. **Proxy Netlify** (si es necesario):
   ```toml
   [[redirects]]
     from = "/api/binance/*"
     to = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/:splat"
     status = 200
   ```

2. **Headers adicionales:**
   ```javascript
   headers: {
     'Origin': 'https://tu-sitio.netlify.app'
   }
   ```

## 🚀 Optimizaciones

### **Performance:**
- ✅ Cache de 1 año para assets estáticos
- ✅ Cache de 1 hora para HTML
- ✅ Compresión automática de Netlify
- ✅ CDN global

### **SEO:**
- ✅ Meta tags optimizados
- ✅ Structured data
- ✅ Open Graph tags

## 🧪 Testing Local

Para probar localmente antes del deploy:

```bash
# Servidor simple
python -m http.server 8000

# O con Node.js
npx serve .

# Visita: http://localhost:8000/static-app.html
```

## 📈 Monitoreo

### **Analytics de Netlify:**
- Visitas y pageviews
- Rendimiento de la aplicación
- Errores de JavaScript

### **Logs de Consola:**
```javascript
// Verificar datos de Binance
window.converter.binanceClient.getRates()

// Estado de la aplicación
console.log(window.converter)
```

## 🔧 Troubleshooting

### **Problema: Datos de ejemplo en lugar de reales**
**Solución:**
1. Verificar consola del navegador
2. Comprobar conectividad a Binance API
3. Revisar CSP headers

### **Problema: CORS errors**
**Solución:**
1. Verificar headers en netlify.toml
2. Usar proxy si es necesario
3. Comprobar Origin headers

### **Problema: Chart no se muestra**
**Solución:**
1. Verificar carga de Chart.js
2. Comprobar errores de JavaScript
3. Revisar tema (claro/oscuro)

## 📱 Mobile Optimization

La aplicación está optimizada para móviles:
- ✅ Responsive design
- ✅ Touch-friendly buttons
- ✅ Optimized charts
- ✅ Fast loading

## 🎨 Customización

Para personalizar la aplicación:

1. **Colores y temas**: Editar `static/css/style.css`
2. **Funcionalidad**: Modificar `static/js/app-static.js`
3. **API endpoints**: Ajustar `static/js/binance-api.js`

## 📞 Soporte

Si tienes problemas con el despliegue:
1. Revisar logs de Netlify
2. Comprobar consola del navegador
3. Verificar configuración de netlify.toml

---

¡Tu convertidor BOB → USDT estará funcionando con datos reales en Netlify! 🎉
# 🚀 Despliegue en Vercel - Convertidor BOB → USDT

Guía completa para desplegar el convertidor en Vercel con datos reales de Binance P2P usando Vercel Serverless Functions.

## 📋 Archivos para Vercel

### **Archivos Principales:**
- `static-app.html` - Aplicación principal (punto de entrada)
- `vercel.json` - Configuración de Vercel
- `api/binance-proxy.js` - Vercel Serverless Function
- `static/` - Recursos estáticos (CSS, JS, imágenes)

### **Configuración Específica:**
- `api/` - Directorio de Vercel Serverless Functions
- `test-vercel-function.js` - Script de prueba para función local

## 🌐 Configuración de Vercel

### **1. Configuración Automática:**
El archivo `vercel.json` incluye:
- ✅ Builds para archivos estáticos y funciones
- ✅ Routes para SPA y API
- ✅ Headers de seguridad y CORS
- ✅ Cache optimizado

### **2. Serverless Functions:**
```javascript
// api/binance-proxy.js
export default async function handler(req, res) {
  // Lógica de proxy para Binance P2P
}
```

### **3. Variables de Entorno:**
```json
{
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🔧 Pasos de Despliegue

### **Opción 1: Deploy desde GitHub (Recomendado)**
1. Ve a [vercel.com](https://vercel.com)
2. **"New Project"** → Conecta tu repositorio GitHub
3. **Framework Preset**: Other
4. **Root Directory**: `.` (raíz del proyecto)
5. **Build Command**: `echo 'Static site'` (opcional)
6. **Output Directory**: `.` (raíz del proyecto)
7. **Deploy**

### **Opción 2: Vercel CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Opción 3: Drag & Drop**
1. Crea un ZIP con estos archivos:
   ```
   /
   ├── static-app.html
   ├── vercel.json
   ├── api/
   │   └── binance-proxy.js
   └── static/
       ├── css/style.css
       ├── js/binance-api.js
       └── js/app-static.js
   ```
2. Arrastra el ZIP a Vercel

## 🎯 URLs de Acceso

Una vez desplegado:
- `https://tu-proyecto.vercel.app/` → Aplicación principal
- `https://tu-proyecto.vercel.app/app` → Alias del convertidor
- `https://tu-proyecto.vercel.app/api/binance-proxy` → Función serverless

## 📊 Características de Vercel

### **✅ Ventajas de Vercel:**
- **Edge Functions** - Ejecución global rápida
- **Automatic HTTPS** - SSL incluido
- **Git Integration** - Deploy automático en push
- **Analytics** - Métricas de rendimiento incluidas
- **Preview Deployments** - URL única para cada PR

### **✅ Funcionalidades Implementadas:**
- Obtiene datos directamente de Binance P2P API
- Cache automático de 5 minutos
- Fallback con datos realistas
- Headers CORS configurados
- Detección automática de plataforma

## 🔒 Seguridad y Performance

### **Headers de Seguridad:**
```json
{
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

### **CORS Configuration:**
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

### **Cache Strategy:**
- **Static files**: 1 año
- **API responses**: 5 minutos
- **HTML**: Sin cache (para actualizaciones)

## 🚀 Optimizaciones de Vercel

### **Edge Network:**
- ✅ CDN global automático
- ✅ Compresión Brotli/Gzip
- ✅ HTTP/2 y HTTP/3 support
- ✅ Smart caching

### **Serverless Functions:**
- ✅ Cold start optimization
- ✅ Automatic scaling
- ✅ 10s timeout configurado
- ✅ Node.js runtime optimizado

## 🧪 Testing Local

### **Desarrollo con Vercel CLI:**
```bash
# Instalar dependencias
npm install -g vercel

# Desarrollo local
vercel dev

# La app estará en: http://localhost:3000
# API estará en: http://localhost:3000/api/binance-proxy
```

### **Probar función individualmente:**
```bash
# Ejecutar test
node test-vercel-function.js
```

## 📈 Monitoreo y Analytics

### **Vercel Analytics:**
- Real User Monitoring (RUM)
- Core Web Vitals
- Function execution metrics
- Error tracking

### **Function Logs:**
```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de función específica
vercel logs --follow api/binance-proxy
```

## 🔧 Troubleshooting

### **Problema: Function timeout**
**Solución:**
```json
{
  "functions": {
    "api/binance-proxy.js": {
      "maxDuration": 10
    }
  }
}
```

### **Problema: CORS errors**
**Solución:** Verificar headers en `vercel.json` y función

### **Problema: Build errors**
**Solución:** Verificar sintaxis de `vercel.json`

## 🆚 Comparación: Vercel vs Netlify

| Característica | Vercel | Netlify |
|----------------|--------|---------|
| **Functions** | `/api/` directory | `netlify/functions/` |
| **Config** | `vercel.json` | `netlify.toml` |
| **Runtime** | Node.js (default) | Node.js + others |
| **Cold Start** | ~50ms | ~100ms |
| **Free Tier** | 100GB bandwidth | 100GB bandwidth |
| **Analytics** | Included | Paid addon |

## 🎨 Customización

### **Cambiar configuración:**
Editar `vercel.json` para:
- Modificar routes
- Ajustar headers
- Configurar redirects
- Cambiar build settings

### **Actualizar función:**
Modificar `api/binance-proxy.js` para:
- Cambiar lógica de proxy
- Agregar nuevos endpoints
- Modificar cache strategy

## 📱 Mobile & PWA

Vercel es ideal para PWAs:
- ✅ Service Worker support
- ✅ Manifest.json serving
- ✅ Offline capabilities
- ✅ Push notifications

## 🌍 Multi-Region

Vercel despliega automáticamente en:
- ✅ Americas (US East, US West)
- ✅ Europe (London, Frankfurt)
- ✅ Asia (Singapore, Tokyo)

---

¡Tu convertidor BOB → USDT funcionará perfectamente en Vercel con datos reales! 🎉

## 🔗 Enlaces Útiles

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/functions)
- [Vercel CLI](https://vercel.com/docs/cli)
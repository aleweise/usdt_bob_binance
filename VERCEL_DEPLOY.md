# 🚀 Despliegue en Vercel - Convertidor BOB → USDT

Guía completa para desplegar el convertidor en Vercel con funciones serverless y datos reales de Binance P2P.

## 📋 Archivos para Vercel

### **Archivos Principales:**
- `vercel-app.html` - Aplicación principal optimizada para Vercel
- `vercel.json` - Configuración de Vercel
- `api/binance-proxy.js` - Función serverless de Vercel
- `static/js/binance-api-universal.js` - Cliente uni

### **Estructura del Proyecto:**
```
├── api/
ion
├── static/

│   └── js/binance-api-universal.js l
├── vercel-app.html              cel
├── vercel.json                   # Configuracel
├── package.json         
└── test-vercel-function.js    es
```

## 🌐 Configuración de Vercel

### **1. Configuración **
El archivo `vercel.json` incluye:
- ✅ Builds para archivos estáticos y 
-ks
- ✅ridad


### **2*
```bash
NODE_ENV=p
```

#
- *ther
`
- **Output Directory**: `.`


## 🔧 Pasos de Despliegue

### **Opción 1: Deploy desde G
1. Ve a [vercel.com](https://vercel.com)
2. **"New Project"** → Importa tu repositorio GitHub
3. **Framework Preset**: Other
4. **Root Dir proyecto)
*

### **O
```bash
# Instalar Verc


# Deploy
verl

# Deploy a producción
vercel --prod
```

### **Opción 3: Drag &
1. Crea una carpetos:
   ```
   /
   ├── api/binxy.js
   ├── vercel-app.html
   ├── vercel.json
   ├── package.json
   └──)
   ```
l

de Acceso

Una vez desplegado:
- `https://tu-proyecto.vercel.app/` → Aplicación principal
- `https://tu-proyecto.vercel.app/api/binance-proxy` → Función serverless
vertidor



### **✅ Funciones Serverless:**
- Obtiene datos directamente de BinaI
- Timeout de 10 segundos configurado
- Headers CORS automáticos
- Cache de 5 minutos

### **✅ Datos Reales:**
- Precios en tiempo real desde Binance
- Fallback automático en caso de error
- Detección automática de plata

### **✅ Funcionalidades Completas:**
 USDT
- Gráficos interactivos
laro
- Diseño responsive

#rformance

### **Headers de Seguridad:**
```json
{
 ,
  "
",
  "Referrer-Policy": "stricin"
}
```

### **Cache Optimizado:**
- **Assets estáticos**: 1 año
-
- *l

## 🧪 Testing Local

### **Desarrollo con Vercel CL
```bash
ias
npm install

# Desarrollo local
vercel dev

# Probar función específica
node test-vercel-

# Visita: http://localhost:30
```

### **Testing de la Función:**
```bash
ss
curl -X POST http:/\
\
  -d '{"asset":"USDT","fiat":"BOB"'
```

## 📈 Monitoreo y Ana

### **Dashboard del:**
- Visitas 
less
- Métricas de respuesta

###al:**

# Ver logs de funciones
vercel s

# Logs específicos de función
ver
```

ooting

### **Problema: Función no r*
**Solución:**
1. Verificar logs en dashboaVercel
2. Comprobar tims)
age.json

### **P
**Solución:**
1. Verificar headerson
ión
3. Revisar Origin headers

###**

1. Verificar sintaxis

3. Revisar dependencias

## 🚀 O

### **Performanc**
- ✅ Edge Functions para baja tencia
- ✅ CDN global automáti
- ✅ Ca
- ✅/3

###*SEO:**

- ✅ Meta tags optimizados
- ✅ Structured data support

## 📱 Mobile Optimization

viles:
- ✅ Responsive design

- ✅ Fast loading
- ✅ PWA ready

## 🎨 Customización

Para personalizar la aplicación:

1. **Colores y temas**: Editar `static/css`
l.js`
3. **API function**
n`

## 🔄 Comparación con Netlify

| Característica y |
|----------------|------|
| **Funciones** | `/api//` |
|
| **Deploy** | Git push aut|
| **Performance** | Edge Functions | E |
| **Pricing** | Generous 

## 📞 Soporte

Si tienes problemaiegue:
cel
2. Comprobar consola del n
3. Verificar configuraciónjson
4. Consultar documentació

---

¡Tu convertidor BOrcel! 🎉

## 🎯 Resultado Esperado

Una vez desplegado en Vercel:
- ✅ **Datos reales** (13.12nance

- ✅s
omática**utad abilid- ✅ **Escala
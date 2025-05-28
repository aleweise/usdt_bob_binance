# Binance USDT/BOB Rate Tracker

Herramienta simple para registrar el precio de USDT en bolivianos (BOB) desde Binance P2P.

## 📋 Descripción

Este proyecto automatiza la captura del precio más barato y el precio promedio de USDT en bolivianos (BOB) desde la plataforma Binance P2P, enfocándose en comerciantes verificados para obtener datos más confiables. Los datos se almacenan en una base de datos MySQL para su posterior consulta y análisis.

## ✨ Características principales

- ✅ Captura del precio más barato de USDT en BOB (`usdt_to_bob_rate`)
- 📊 Registro del precio promedio de los anuncios disponibles (`average_usdt_to_bob_rate`)
- 🔄 Automatización para ejecución periódica (cada hora)
- 📝 Sistema de logs para monitoreo
- 🛡️ Manejo de errores con reintentos
- 💾 Almacenamiento en base de datos MySQL

## 🚀 Instalación

### Requisitos previos

- Python 3.6 o superior
- MySQL/MariaDB
- Acceso a internet para conectar con Binance

### Pasos de instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/binance-usdt-bob-tracker.git
cd binance-usdt-bob-tracker
```

2. **Configurar base de datos**

- Copia el archivo de configuración de ejemplo:

```bash
cp db_config.example.ini db_config.ini
```

- Edita `db_config.ini` con tus credenciales de MySQL.

3. **Instalar dependencias**

En Linux/MacOS:
```bash
./setup.sh
```

En Windows:
```bash
pip install -r requirements.txt
```

4. **Crear tabla en la base de datos**

El script creará automáticamente la tabla si no existe. También puedes crearla manualmente ejecutando el SQL en `create_usdt_rates_table.sql`.

## 📊 Estructura de la base de datos

La tabla `usdt_rates` tiene la siguiente estructura:

| Campo                      | Tipo         | Descripción                              |
|----------------------------|--------------|------------------------------------------|
| id                         | INT          | Clave primaria autoincremental           |
| recorded_at                | DATETIME     | Momento exacto de la captura             |
| usdt_to_bob_rate           | DECIMAL(10,2)| Precio más barato de USDT en BOB         |
| average_usdt_to_bob_rate   | DECIMAL(10,2)| Promedio de precios disponibles          |

## 🔄 Uso

### Ejecución manual

En Linux/MacOS:
```bash
./update_usdt_rates.sh
```

En Windows:
```bash
update_usdt_rates.bat
```

### Automatización

#### Linux (Cron)

Para ejecutar cada hora, añade a tu crontab:

```bash
0 * * * * cd /ruta/completa/al/proyecto && ./update_usdt_rates.sh >> usdt_cron.log 2>&1
```

#### Windows (Programador de tareas)

1. Abre el Programador de tareas
2. Crea una tarea básica
3. Configura el disparador para que se ejecute cada hora
4. Acción: Iniciar un programa
5. Programa/script: `C:\ruta\completa\al\proyecto\update_usdt_rates.bat`

## 📈 Ejemplo de consulta SQL

```sql
-- Ver los últimos 10 registros
SELECT recorded_at, usdt_to_bob_rate, average_usdt_to_bob_rate 
FROM usdt_rates 
ORDER BY recorded_at DESC 
LIMIT 10;
```

## 🔧 Solución de problemas

### Error de conexión a la base de datos
- Verifica que tu servidor MySQL esté en funcionamiento
- Comprueba las credenciales en `db_config.ini`
- Asegúrate de que la base de datos exista

### Error al obtener datos de Binance
- Verifica tu conexión a Internet
- Es posible que la API haya cambiado, revisa los logs detallados
- Binance podría estar bloqueando las solicitudes, prueba cambiando el User-Agent

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios importantes antes de enviar un pull request.

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Aplicación web Flask para el convertidor BOB a USDT usando PostgreSQL (Neon).

Interfaz web moderna con modo oscuro/claro para convertir bolivianos a USDT
usando datos de Binance P2P y PostgreSQL como base de datos.

Autor: Desarrollado para el proyecto Binance USDT/BOB Rate Tracker
Fecha: Julio 2025
"""

from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime, timedelta
from bob_to_usdt_converter_postgres import BOBToUSDTConverterPostgres
import logging
import psycopg2
import psycopg2.extras

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'binance_usdt_bob_converter_postgres_2025'

# Instancia global del convertidor PostgreSQL
converter = BOBToUSDTConverterPostgres()

@app.route('/')
def index():
    """Página principal del convertidor"""
    return render_template('index.html')

@app.route('/api/convert', methods=['POST'])
def api_convert():
    """API endpoint para realizar conversiones"""
    try:
        data = request.get_json()
        
        if not data or 'amount' not in data:
            return jsonify({
                'success': False,
                'error': 'Cantidad requerida'
            }), 400
        
        amount = float(data['amount'])
        rate_type = data.get('rate_type', 'avg')
        
        if amount <= 0:
            return jsonify({
                'success': False,
                'error': 'La cantidad debe ser mayor a 0'
            }), 400
        
        # Realizar conversión
        result = converter.convert_bob_to_usdt(amount, rate_type)
        
        # Formatear timestamp para JSON
        if result['success'] and 'timestamp' in result:
            result['timestamp'] = result['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify(result)
        
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'Cantidad inválida'
        }), 400
    except Exception as e:
        logger.error(f"Error en conversión: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500

@app.route('/api/rates', methods=['GET'])
def api_rates():
    """API endpoint para obtener tasas actuales"""
    try:
        # Intentar obtener tasas en tiempo real
        rate_data = converter.get_binance_rate_realtime()
        
        # Si falla, usar datos de la base de datos
        if not rate_data:
            rate_data = converter.get_latest_rate_from_db()
        
        if not rate_data:
            return jsonify({
                'success': False,
                'error': 'No se pudieron obtener las tasas'
            }), 500
        
        # Formatear timestamp para JSON
        rate_data['timestamp'] = rate_data['recorded_at'].strftime('%Y-%m-%d %H:%M:%S')
        del rate_data['recorded_at']  # Remover el datetime original
        rate_data['success'] = True
        
        return jsonify(rate_data)
        
    except Exception as e:
        logger.error(f"Error al obtener tasas: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener tasas'
        }), 500

@app.route('/api/history', methods=['GET'])
def api_history():
    """API endpoint para obtener historial de tasas desde PostgreSQL"""
    timeframe = request.args.get('timeframe', '24h')
    history = []
    
    try:
        # Calcular límite de tiempo y cantidad de registros
        now = datetime.now()
        if timeframe == '24h':
            time_limit = now - timedelta(hours=24)
            limit = 24
        elif timeframe == '7d':
            time_limit = now - timedelta(days=7)
            limit = 168  # 7 días * 24 horas
        elif timeframe == '30d':
            time_limit = now - timedelta(days=30)
            limit = 720  # 30 días * 24 horas
        else:
            time_limit = now - timedelta(hours=24)
            limit = 24
        
        # Intentar conectar a PostgreSQL
        try:
            conn = psycopg2.connect(**converter.db_config)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            # Verificar si la tabla existe
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'usdt_rates'
                );
            """)
            
            table_exists = cursor.fetchone()[0]
            
            if table_exists:
                # Obtener datos históricos dentro del rango de tiempo
                query = """
                SELECT recorded_at, usdt_min_bob, usdt_avg_bob 
                FROM usdt_rates 
                WHERE recorded_at >= %s
                ORDER BY recorded_at ASC
                LIMIT %s
                """
                
                cursor.execute(query, (time_limit, limit))
                results = cursor.fetchall()
                
                for row in results:
                    history.append({
                        'timestamp': row['recorded_at'].strftime('%Y-%m-%d %H:%M:%S'),
                        'usdt_min_bob': float(row['usdt_min_bob']),
                        'usdt_avg_bob': float(row['usdt_avg_bob'])
                    })
                
                logger.info(f"Obtenidos {len(history)} registros de PostgreSQL")
            else:
                logger.warning("La tabla usdt_rates no existe en PostgreSQL")
            
            cursor.close()
            conn.close()
            
        except psycopg2.Error as db_error:
            logger.error(f"Error de PostgreSQL: {str(db_error)}")
        except Exception as db_error:
            logger.error(f"Error de conexión a PostgreSQL: {str(db_error)}")
        
        # Si no hay datos suficientes, generar datos de ejemplo
        if len(history) < 5:
            logger.info("Generando datos de ejemplo para demostración")
            history = generate_sample_data(timeframe)
        
        return jsonify({
            'success': True,
            'history': history,
            'timeframe': timeframe,
            'count': len(history),
            'data_source': 'postgresql' if len(history) > 5 else 'sample',
            'database': 'PostgreSQL (Neon)'
        })
        
    except Exception as e:
        logger.error(f"Error general al obtener historial: {str(e)}")
        # En caso de error, siempre devolver datos de ejemplo
        history = generate_sample_data(timeframe)
        return jsonify({
            'success': True,
            'history': history,
            'timeframe': timeframe,
            'count': len(history),
            'data_source': 'sample',
            'note': 'Datos de ejemplo - Error en PostgreSQL'
        })

def generate_sample_data(timeframe='24h'):
    """Genera datos de ejemplo para demostración cuando no hay datos reales"""
    from datetime import datetime, timedelta
    import random
    import math
    
    now = datetime.now()
    data = []
    
    # Configurar cantidad de puntos según timeframe
    if timeframe == '24h':
        points = 24
        interval_hours = 1
    elif timeframe == '7d':
        points = 42  # Cada 4 horas por 7 días
        interval_hours = 4
    else:  # 30d
        points = 30  # Un punto por día
        interval_hours = 24
    
    # Precio base simulado (basado en datos reales aproximados)
    base_min = 6.85
    base_avg = 6.95
    
    # Generar datos con tendencia realista
    for i in range(points):
        timestamp = now - timedelta(hours=(points - i) * interval_hours)
        
        # Crear variación más realista con ondas sinusoidales
        time_factor = i / points
        wave1 = math.sin(time_factor * 4 * math.pi) * 0.08
        wave2 = math.sin(time_factor * 2 * math.pi) * 0.05
        trend = (time_factor - 0.5) * 0.1  # Tendencia ligera
        
        # Agregar ruido aleatorio
        noise = random.uniform(-0.03, 0.03)
        
        # Calcular precios
        variation = wave1 + wave2 + trend + noise
        min_price = base_min + variation
        avg_price = base_avg + variation + random.uniform(0.02, 0.08)
        
        # Asegurar que min <= avg y valores positivos
        min_price = max(min_price, 6.50)
        avg_price = max(avg_price, min_price + 0.02)
        
        data.append({
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'usdt_min_bob': round(min_price, 2),
            'usdt_avg_bob': round(avg_price, 2)
        })
    
    return data

@app.route('/api/debug/db-status', methods=['GET'])
def api_debug_db_status():
    """Endpoint de debug para verificar el estado de PostgreSQL"""
    try:
        status = {
            'config_loaded': False,
            'connection_ok': False,
            'table_exists': False,
            'record_count': 0,
            'database_type': 'PostgreSQL (Neon)',
            'error': None
        }
        
        # Verificar configuración
        try:
            db_config = converter.db_config
            status['config_loaded'] = True
            status['config'] = {k: v if k != 'password' else '***' for k, v in db_config.items()}
        except Exception as e:
            status['error'] = f"Error cargando configuración: {str(e)}"
            return jsonify(status)
        
        # Verificar conexión
        try:
            conn = psycopg2.connect(**converter.db_config)
            status['connection_ok'] = True
            cursor = conn.cursor()
            
            # Verificar tabla
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'usdt_rates'
                );
            """)
            
            status['table_exists'] = cursor.fetchone()[0]
            
            if status['table_exists']:
                cursor.execute("SELECT COUNT(*) FROM usdt_rates")
                status['record_count'] = cursor.fetchone()[0]
            
            cursor.close()
            conn.close()
            
        except psycopg2.Error as e:
            status['error'] = f"Error de PostgreSQL: {str(e)}"
        except Exception as e:
            status['error'] = f"Error de conexión: {str(e)}"
        
        return jsonify(status)
        
    except Exception as e:
        return jsonify({
            'error': f"Error general: {str(e)}"
        })

@app.route('/api/test-connection', methods=['GET'])
def api_test_connection():
    """Endpoint para probar la conexión a PostgreSQL"""
    try:
        conn_string = converter.get_connection_string()
        conn = psycopg2.connect(conn_string)
        cursor = conn.cursor()
        
        # Probar consulta simple
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Conexión exitosa a PostgreSQL',
            'version': version,
            'host': converter.db_config['host'],
            'database': converter.db_config['database']
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🐘 Iniciando aplicación web con PostgreSQL (Neon)")
    print(f"🔗 Conectando a: {converter.db_config['host']}")
    app.run(debug=True, host='0.0.0.0', port=5000)
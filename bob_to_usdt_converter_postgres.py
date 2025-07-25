#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convertidor BOB a USDT usando PostgreSQL (Neon) - Versión adaptada.

Este script proporciona conversiones de bolivianos (BOB) a USDT usando:
1. Datos históricos almacenados en PostgreSQL (Neon)
2. API externa de GitHub (por integrar)
3. Datos en tiempo real de Binance P2P

Autor: Desarrollado para el proyecto Binance USDT/BOB Rate Tracker
Fecha: Julio 2025
"""

import requests
import psycopg2
import psycopg2.extras
import logging
import configparser
import os
import sys
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), "converter_postgres.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("bob_usdt_converter_postgres")

class BOBToUSDTConverterPostgres:
    def __init__(self, config_file='db_config_postgres.ini'):
        self.config_file = config_file
        self.db_config = self.cargar_configuracion()
        
    def cargar_configuracion(self):
        """Carga la configuración desde el archivo de configuración PostgreSQL"""
        try:
            config_path = os.path.join(os.path.dirname(__file__), self.config_file)
            if not os.path.exists(config_path):
                logger.error(f"Archivo de configuración no encontrado: {config_path}")
                sys.exit(1)
                
            config = configparser.ConfigParser()
            config.read(config_path)
            
            return {
                'host': config['DATABASE']['host'],
                'user': config['DATABASE']['user'],
                'password': config['DATABASE']['password'],
                'database': config['DATABASE']['database'],
                'port': int(config['DATABASE']['port']),
                'sslmode': config['DATABASE']['sslmode']
            }
        except Exception as e:
            logger.error(f"Error al cargar configuración: {str(e)}")
            sys.exit(1)
    
    def get_connection_string(self):
        """Genera la cadena de conexión para PostgreSQL"""
        return f"postgresql://{self.db_config['user']}:{self.db_config['password']}@{self.db_config['host']}:{self.db_config['port']}/{self.db_config['database']}?sslmode={self.db_config['sslmode']}"
    
    def get_latest_rate_from_db(self):
        """Obtiene la tasa más reciente desde la base de datos PostgreSQL"""
        conn = None
        cursor = None
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            query = """
            SELECT usdt_min_bob, usdt_avg_bob, recorded_at 
            FROM usdt_rates 
            ORDER BY recorded_at DESC 
            LIMIT 1
            """
            
            cursor.execute(query)
            result = cursor.fetchone()
            
            if result:
                return {
                    'usdt_min_bob': float(result['usdt_min_bob']),
                    'usdt_avg_bob': float(result['usdt_avg_bob']),
                    'recorded_at': result['recorded_at'],
                    'source': 'database'
                }
            else:
                logger.warning("No se encontraron datos en la base de datos")
                return None
                
        except psycopg2.Error as e:
            logger.error(f"Error de PostgreSQL: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error general de base de datos: {str(e)}")
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
    
    def get_binance_rate_realtime(self):
        """Obtiene la tasa actual directamente de Binance P2P"""
        url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
        
        payload = {
            "asset": "USDT",
            "fiat": "BOB",
            "tradeType": "BUY",
            "page": 1,
            "rows": 10,
            "payTypes": [],
            "publisherType": "merchant"
        }
        
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            if not data.get("data"):
                return None
            
            prices = [float(ad["adv"]["price"]) for ad in data["data"]]
            cheapest = min(prices)
            average = sum(prices) / len(prices)
            
            return {
                'usdt_min_bob': cheapest,
                'usdt_avg_bob': average,
                'recorded_at': datetime.now(),
                'source': 'binance_realtime'
            }
            
        except Exception as e:
            logger.error(f"Error al obtener datos de Binance: {str(e)}")
            return None
    
    def get_github_api_rate(self):
        """
        Obtiene la tasa desde la API de GitHub
        TODO: Implementar cuando se proporcionen los detalles de la API
        """
        logger.info("API de GitHub pendiente de integración")
        return None
    
    def save_to_database(self, rates_data):
        """
        Guarda los datos en la base de datos PostgreSQL
        
        Args:
            rates_data (dict): Datos de precios a guardar
        
        Returns:
            bool: True si fue exitoso, False en caso contrario
        """
        conn = None
        cursor = None
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            
            current_time = datetime.now()
            
            # Verificar si existe la tabla
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'usdt_rates'
                );
            """)
            
            table_exists = cursor.fetchone()[0]
            
            if not table_exists:
                logger.warning("La tabla usdt_rates no existe. Creándola...")
                # Leer y ejecutar script SQL
                sql_path = os.path.join(os.path.dirname(__file__), 'create_usdt_rates_table_postgres.sql')
                with open(sql_path, 'r', encoding='utf-8') as sql_file:
                    sql_script = sql_file.read()
                
                cursor.execute(sql_script)
                logger.info("Tabla usdt_rates creada correctamente")
            
            # Insertar datos
            query = """
            INSERT INTO usdt_rates 
            (recorded_at, usdt_min_bob, usdt_avg_bob) 
            VALUES (%s, %s, %s)
            RETURNING id
            """
            
            cursor.execute(query, (
                current_time, 
                rates_data['usdt_min_bob'], 
                rates_data['usdt_avg_bob']
            ))
            
            record_id = cursor.fetchone()[0]
            conn.commit()
            logger.info(f"Datos guardados en PostgreSQL. ID: {record_id}")
            return True
            
        except psycopg2.Error as e:
            logger.error(f"Error de PostgreSQL: {str(e)}")
            if conn:
                conn.rollback()
            return False
        except Exception as e:
            logger.error(f"Error inesperado al guardar datos: {str(e)}")
            if conn:
                conn.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
    
    def convert_bob_to_usdt(self, bob_amount, rate_type='avg'):
        """
        Convierte BOB a USDT
        
        Args:
            bob_amount (float): Cantidad en bolivianos
            rate_type (str): 'min' para precio mínimo, 'avg' para promedio
        
        Returns:
            dict: Resultado de la conversión
        """
        try:
            # Intentar obtener tasa en tiempo real primero
            rate_data = self.get_binance_rate_realtime()
            
            # Si falla, usar datos de la base de datos
            if not rate_data:
                rate_data = self.get_latest_rate_from_db()
            
            # Si aún no hay datos, intentar API de GitHub
            if not rate_data:
                rate_data = self.get_github_api_rate()
            
            if not rate_data:
                raise Exception("No se pudo obtener ninguna tasa de conversión")
            
            # Seleccionar la tasa según el tipo solicitado
            if rate_type == 'min':
                rate = rate_data['usdt_min_bob']
            else:
                rate = rate_data['usdt_avg_bob']
            
            # Realizar conversión
            usdt_amount = Decimal(str(bob_amount)) / Decimal(str(rate))
            usdt_amount = usdt_amount.quantize(Decimal('0.00000001'), rounding=ROUND_HALF_UP)
            
            return {
                'bob_amount': bob_amount,
                'usdt_amount': float(usdt_amount),
                'rate_used': rate,
                'rate_type': rate_type,
                'data_source': rate_data['source'],
                'timestamp': rate_data['recorded_at'],
                'success': True
            }
            
        except Exception as e:
            logger.error(f"Error en conversión: {str(e)}")
            return {
                'bob_amount': bob_amount,
                'error': str(e),
                'success': False
            }

def main():
    """Función principal para pruebas del convertidor PostgreSQL"""
    converter = BOBToUSDTConverterPostgres()
    
    # Ejemplo de uso
    test_amounts = [100, 500, 1000, 5000]
    
    print("=== Convertidor BOB a USDT (PostgreSQL) ===")
    print(f"Conectando a: {converter.db_config['host']}")
    print()
    
    for amount in test_amounts:
        # Conversión con precio promedio
        result_avg = converter.convert_bob_to_usdt(amount, 'avg')
        
        # Conversión con precio mínimo
        result_min = converter.convert_bob_to_usdt(amount, 'min')
        
        if result_avg['success'] and result_min['success']:
            print(f"Bs. {amount:,}")
            print(f"  → {result_avg['usdt_amount']:.8f} USDT (precio promedio: Bs. {result_avg['rate_used']:.2f})")
            print(f"  → {result_min['usdt_amount']:.8f} USDT (precio mínimo: Bs. {result_min['rate_used']:.2f})")
            print(f"  Fuente: {result_avg['data_source']}")
            print()
        else:
            print(f"Error al convertir Bs. {amount}: {result_avg.get('error', 'Error desconocido')}")
            print()

if __name__ == "__main__":
    main()
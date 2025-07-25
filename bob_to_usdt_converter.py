#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convertidor de BOB a USDT usando datos de Binance P2P y API externa.

Este script proporciona conversiones de bolivianos (BOB) a USDT usando:
1. Datos históricos almacenados en la base de datos local
2. API externa de GitHub (por integrar)
3. Datos en tiempo real de Binance P2P

Autor: Desarrollado para el proyecto Binance USDT/BOB Rate Tracker
Fecha: Julio 2025
"""

import requests
import mysql.connector
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
        logging.FileHandler(os.path.join(os.path.dirname(__file__), "converter.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("bob_usdt_converter")

class BOBToUSDTConverter:
    def __init__(self):
        self.db_config = self.cargar_configuracion()
        
    def cargar_configuracion(self):
        """Carga la configuración desde el archivo db_config.ini"""
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'db_config.ini')
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
                'charset': config['DATABASE']['charset']
            }
        except Exception as e:
            logger.error(f"Error al cargar configuración: {str(e)}")
            sys.exit(1)
    
    def get_latest_rate_from_db(self):
        """Obtiene la tasa más reciente desde la base de datos local"""
        conn = None
        cursor = None
        try:
            conn = mysql.connector.connect(**self.db_config)
            cursor = conn.cursor()
            
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
                    'usdt_min_bob': float(result[0]),
                    'usdt_avg_bob': float(result[1]),
                    'recorded_at': result[2],
                    'source': 'database'
                }
            else:
                logger.warning("No se encontraron datos en la base de datos")
                return None
                
        except mysql.connector.Error as e:
            logger.error(f"Error de base de datos: {str(e)}")
            return None
        finally:
            if cursor:
                cursor.close()
            if conn and conn.is_connected():
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
        # Placeholder para la API de GitHub
        logger.info("API de GitHub pendiente de integración")
        return None
    
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
    """Función principal para pruebas del convertidor"""
    converter = BOBToUSDTConverter()
    
    # Ejemplo de uso
    test_amounts = [100, 500, 1000, 5000]
    
    print("=== Convertidor BOB a USDT ===")
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
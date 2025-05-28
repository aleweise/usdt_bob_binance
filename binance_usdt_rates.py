#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para capturar y almacenar precios de USDT en BOB desde Binance P2P.

Este script obtiene el precio más barato de los USDT en bolivianos
desde la API de Binance P2P y lo guarda en una base de datos MySQL.
Diseñado para ejecutarse cada hora mediante un programador de tareas.

Autor: GitHub Copilot
Fecha: Mayo 2025
"""

import requests
import mysql.connector
import logging
import time
import configparser
from datetime import datetime
import os
import sys

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), "binance_usdt_rates.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("binance_scraper")

def cargar_configuracion():
    """
    Carga la configuración desde el archivo db_config.ini
    
    Returns:
        dict: Configuración de la base de datos
    """
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

def get_binance_rates():
    """
    Obtiene el precio más barato de USDT en BOB desde Binance P2P
    
    Returns:
        dict: Containing 'cheapest_rate' and 'average_rate', or None if an error occurs.
    """
    url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
    
    payload = {
        "asset": "USDT",
        "fiat": "BOB",
        "tradeType": "BUY",
        "page": 1,
        "rows": 10,  # Primeros 10 anuncios
        "payTypes": [],
        "publisherType": "merchant"  # Solo comerciantes verificados
    }
    
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        logger.info("Consultando API de Binance P2P...")
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Levanta excepción si hay error HTTP
        data = response.json()
        
        if not data.get("data"):
            logger.warning("No se encontraron anuncios en Binance P2P.")
            return None
        
        prices = [float(ad["adv"]["price"]) for ad in data["data"]]
        cheapest = min(prices)
        average = sum(prices) / len(prices)
        
        logger.info(f"Cheapest rate: Bs. {cheapest}")
        logger.info(f"Average rate: Bs. {average:.2f}")
        
        return {
            "cheapest_rate": cheapest,
            "average_rate": average
        }
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Error al obtener datos de Binance: {str(e)}")
        return None
    except (KeyError, ValueError, TypeError) as e:
        logger.error(f"Error al procesar datos: {str(e)}")
        return None

def save_to_database(rates_data, db_config):
    """
    Guarda los datos en la base de datos MySQL
    
    Args:
        rates_data (dict): Datos de precios a guardar (debe contener 'cheapest_rate' y 'average_rate')
        db_config (dict): Configuración de la base de datos
    
    Returns:
        bool: True si fue exitoso, False en caso contrario
    """
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Verificar si existe la tabla
        cursor.execute("""
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = %s
        AND table_name = 'usdt_rates'
        """, (db_config['database'],))
        
        if cursor.fetchone()[0] == 0:
            logger.warning("La tabla usdt_rates no existe. Creándola...")
            # Leer y ejecutar script SQL
            sql_path = os.path.join(os.path.dirname(__file__), 'create_usdt_rates_table.sql')
            with open(sql_path, 'r') as sql_file:
                sql_script = sql_file.read()
                
            for statement in sql_script.split(';'):
                if statement.strip():
                    cursor.execute(statement)
                    
            logger.info("Tabla usdt_rates creada correctamente")
        
        # Insertar datos
        query = """
        INSERT INTO usdt_rates 
        (recorded_at, usdt_to_bob_rate, average_usdt_to_bob_rate) 
        VALUES (%s, %s, %s)
        """
        
        cursor.execute(query, (
            current_time, 
            rates_data['cheapest_rate'], 
            rates_data['average_rate']
        ))
        
        conn.commit()
        logger.info(f"Datos guardados en la base de datos. ID: {cursor.lastrowid}")
        return True
        
    except mysql.connector.Error as e:
        logger.error(f"Error de base de datos: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Error inesperado al guardar datos: {str(e)}")
        return False
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

def main():
    """Función principal que ejecuta el scraping y guardado de datos"""
    logger.info("=== Iniciando captura de precio USDT/BOB ===")
    
    # Cargar configuración
    db_config = cargar_configuracion()
    
    # Implementar reintentos con backoff exponencial
    max_retries = 3
    retry_delay = 5  # segundos
    
    # Intentar obtener datos
    for attempt in range(max_retries):
        rates_data = get_binance_rates()
        
        if rates_data:
            # Si se obtuvieron datos, guardarlos en BD
            if save_to_database(rates_data, db_config):
                logger.info("✅ Datos guardados correctamente")
                return 0
            else:
                logger.error("❌ Error al guardar los datos")
                return 1
        else:
            # Reintento con backoff exponencial
            retry_delay_current = retry_delay * (2 ** attempt)
            logger.warning(f"Intento {attempt+1} fallido. Reintentando en {retry_delay_current} segundos...")
            time.sleep(retry_delay_current)
    
    logger.error(f"❌ No se pudo obtener datos después de {max_retries} intentos.")
    return 1

if __name__ == "__main__":
    sys.exit(main())

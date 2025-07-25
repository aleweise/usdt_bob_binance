#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para probar la conexión a PostgreSQL (Neon) y crear la tabla si es necesario.

Este script verifica la conectividad, crea la tabla usdt_rates si no existe,
e inserta algunos datos de prueba.

Autor: Desarrollado para el proyecto Binance USDT/BOB Rate Tracker
Fecha: Julio 2025
"""

import psycopg2
import psycopg2.extras
from datetime import datetime
import sys
import os

def test_connection():
    """Prueba la conexión a PostgreSQL usando la cadena de conexión directa"""
    
    # Cadena de conexión directa
    conn_string = "postgresql://neondb_owner:npg_a1shANBxry6f@ep-tiny-thunder-aed7m7sl-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
    
    try:
        print("🐘 Probando conexión a PostgreSQL (Neon)...")
        print(f"🔗 Host: ep-tiny-thunder-aed7m7sl-pooler.c-2.us-east-2.aws.neon.tech")
        print(f"📊 Base de datos: neondb")
        print()
        
        # Conectar
        conn = psycopg2.connect(conn_string)
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        print("✅ Conexión exitosa!")
        
        # Obtener información de la base de datos
        cursor.execute("SELECT version();")
        version = cursor.fetchone()['version']
        print(f"📋 Versión de PostgreSQL: {version}")
        
        # Verificar si la tabla existe
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'usdt_rates'
            );
        """)
        
        table_exists = cursor.fetchone()['exists']
        print(f"📊 Tabla 'usdt_rates' existe: {table_exists}")
        
        if not table_exists:
            print("🔧 Creando tabla 'usdt_rates'...")
            
            # Crear tabla
            create_table_sql = """
            CREATE TABLE usdt_rates (
                id SERIAL PRIMARY KEY,
                recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                usdt_min_bob DECIMAL(10, 2) NOT NULL,
                usdt_avg_bob DECIMAL(10, 2) NOT NULL
            );
            
            CREATE INDEX idx_usdt_rates_recorded_at ON usdt_rates (recorded_at);
            
            COMMENT ON TABLE usdt_rates IS 'Historical record of USDT to BOB prices from Binance P2P';
            """
            
            cursor.execute(create_table_sql)
            conn.commit()
            print("✅ Tabla creada exitosamente!")
        
        # Contar registros existentes
        cursor.execute("SELECT COUNT(*) as count FROM usdt_rates;")
        count = cursor.fetchone()['count']
        print(f"📈 Registros existentes: {count}")
        
        # Insertar datos de prueba si la tabla está vacía
        if count == 0:
            print("🔄 Insertando datos de prueba...")
            
            test_data = [
                (datetime.now(), 6.85, 6.95),
                (datetime.now(), 6.87, 6.97),
                (datetime.now(), 6.83, 6.93)
            ]
            
            insert_sql = """
            INSERT INTO usdt_rates (recorded_at, usdt_min_bob, usdt_avg_bob) 
            VALUES (%s, %s, %s)
            """
            
            cursor.executemany(insert_sql, test_data)
            conn.commit()
            print(f"✅ Insertados {len(test_data)} registros de prueba!")
        
        # Mostrar algunos registros recientes
        cursor.execute("""
            SELECT recorded_at, usdt_min_bob, usdt_avg_bob 
            FROM usdt_rates 
            ORDER BY recorded_at DESC 
            LIMIT 5
        """)
        
        recent_records = cursor.fetchall()
        if recent_records:
            print("\n📊 Registros recientes:")
            for record in recent_records:
                print(f"   {record['recorded_at']} | Min: Bs.{record['usdt_min_bob']} | Avg: Bs.{record['usdt_avg_bob']}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 ¡Prueba de conexión completada exitosamente!")
        print("🚀 Puedes ejecutar la aplicación web con: python web_app_postgres.py")
        
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Error de PostgreSQL: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error general: {str(e)}")
        return False

def test_with_config_file():
    """Prueba la conexión usando el archivo de configuración"""
    try:
        from bob_to_usdt_converter_postgres import BOBToUSDTConverterPostgres
        
        print("🔧 Probando con archivo de configuración...")
        converter = BOBToUSDTConverterPostgres()
        
        # Probar obtener datos de Binance
        print("📡 Probando obtener datos de Binance...")
        binance_data = converter.get_binance_rate_realtime()
        
        if binance_data:
            print(f"✅ Datos de Binance obtenidos:")
            print(f"   Min: Bs.{binance_data['usdt_min_bob']:.2f}")
            print(f"   Avg: Bs.{binance_data['usdt_avg_bob']:.2f}")
            
            # Guardar en base de datos
            print("💾 Guardando en PostgreSQL...")
            if converter.save_to_database(binance_data):
                print("✅ Datos guardados exitosamente!")
            else:
                print("❌ Error al guardar datos")
        else:
            print("❌ No se pudieron obtener datos de Binance")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 PRUEBA DE CONEXIÓN POSTGRESQL (NEON)")
    print("=" * 60)
    print()
    
    # Prueba 1: Conexión directa
    print("1️⃣ PRUEBA DE CONEXIÓN DIRECTA")
    print("-" * 30)
    success1 = test_connection()
    
    print("\n" + "=" * 60)
    
    # Prueba 2: Con archivo de configuración
    print("2️⃣ PRUEBA CON CONVERTIDOR")
    print("-" * 30)
    success2 = test_with_config_file()
    
    print("\n" + "=" * 60)
    print("📋 RESUMEN")
    print("-" * 30)
    print(f"Conexión directa: {'✅ OK' if success1 else '❌ FALLO'}")
    print(f"Convertidor: {'✅ OK' if success2 else '❌ FALLO'}")
    
    if success1 and success2:
        print("\n🎉 ¡Todo funcionando correctamente!")
        print("🚀 Ejecuta: python web_app_postgres.py")
    else:
        print("\n⚠️ Hay problemas que resolver")
        sys.exit(1)
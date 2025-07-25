#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de inicio para la aplicación web del convertidor BOB → USDT.

Este script inicia el servidor Flask con configuraciones optimizadas
para desarrollo y producción.

Uso:
    python start_web.py              # Modo desarrollo
    python start_web.py --production # Modo producción

Autor: Desarrollado para el proyecto Binance USDT/BOB Rate Tracker
Fecha: Julio 2025
"""

import argparse
import os
import sys
from web_app import app

def main():
    parser = argparse.ArgumentParser(description='Iniciar aplicación web del convertidor BOB → USDT')
    parser.add_argument('--production', '-p', action='store_true',
                       help='Ejecutar en modo producción')
    parser.add_argument('--host', default='0.0.0.0',
                       help='Host para el servidor (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=5000,
                       help='Puerto para el servidor (default: 5000)')
    
    args = parser.parse_args()
    
    print("🚀 Iniciando Convertidor BOB → USDT")
    print("=" * 50)
    
    if args.production:
        print("⚡ Modo: PRODUCCIÓN")
        print("⚠️  ADVERTENCIA: Para producción real, usa un servidor WSGI como Gunicorn")
        debug_mode = False
    else:
        print("🔧 Modo: DESARROLLO")
        debug_mode = True
    
    print(f"🌐 Host: {args.host}")
    print(f"🔌 Puerto: {args.port}")
    print(f"🔗 URL: http://{args.host}:{args.port}")
    print("=" * 50)
    print()
    
    # Verificar configuración de base de datos
    config_path = os.path.join(os.path.dirname(__file__), 'db_config.ini')
    if not os.path.exists(config_path):
        print("❌ ERROR: No se encuentra db_config.ini")
        print("   Por favor, crea el archivo basándote en db_config.example.ini")
        sys.exit(1)
    
    print("✅ Configuración de base de datos encontrada")
    print("🔄 Iniciando servidor Flask...")
    print()
    
    try:
        app.run(
            host=args.host,
            port=args.port,
            debug=debug_mode,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error al iniciar el servidor: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
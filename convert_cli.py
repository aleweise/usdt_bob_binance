#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Interfaz de línea de comandos para el convertidor BOB a USDT.

Uso:
    python convert_cli.py 1000          # Convierte 1000 BOB a USDT (precio promedio)
    python convert_cli.py 1000 --min    # Convierte usando precio mínimo
    python convert_cli.py --interactive  # Modo interactivo

Autor: Desarrollado para el proyecto Binance USDT/BOB Rate Tracker
"""

import argparse
import sys
from bob_to_usdt_converter import BOBToUSDTConverter

def format_result(result):
    """Formatea el resultado de la conversión para mostrar"""
    if not result['success']:
        return f"❌ Error: {result['error']}"
    
    output = []
    output.append(f"💰 Bs. {result['bob_amount']:,.2f} = {result['usdt_amount']:.8f} USDT")
    output.append(f"📊 Tasa utilizada: Bs. {result['rate_used']:.2f} por USDT ({result['rate_type']})")
    output.append(f"🔄 Fuente: {result['data_source']}")
    output.append(f"⏰ Actualizado: {result['timestamp']}")
    
    return "\n".join(output)

def interactive_mode():
    """Modo interactivo para conversiones múltiples"""
    converter = BOBToUSDTConverter()
    
    print("=== Convertidor BOB a USDT - Modo Interactivo ===")
    print("Comandos disponibles:")
    print("  <cantidad>     - Convierte usando precio promedio")
    print("  <cantidad> min - Convierte usando precio mínimo")
    print("  rates          - Muestra tasas actuales")
    print("  quit           - Salir")
    print()
    
    while True:
        try:
            user_input = input("BOB → USDT: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("¡Hasta luego! 👋")
                break
            
            if user_input.lower() == 'rates':
                # Mostrar tasas actuales
                rate_data = converter.get_binance_rate_realtime()
                if not rate_data:
                    rate_data = converter.get_latest_rate_from_db()
                
                if rate_data:
                    print(f"📈 Tasas actuales ({rate_data['source']}):")
                    print(f"   Precio mínimo: Bs. {rate_data['usdt_min_bob']:.2f}")
                    print(f"   Precio promedio: Bs. {rate_data['usdt_avg_bob']:.2f}")
                    print(f"   Actualizado: {rate_data['recorded_at']}")
                else:
                    print("❌ No se pudieron obtener las tasas")
                print()
                continue
            
            # Parsear comando de conversión
            parts = user_input.split()
            if len(parts) == 0:
                continue
            
            try:
                amount = float(parts[0])
                rate_type = 'min' if len(parts) > 1 and parts[1].lower() == 'min' else 'avg'
                
                result = converter.convert_bob_to_usdt(amount, rate_type)
                print(format_result(result))
                print()
                
            except ValueError:
                print("❌ Por favor ingresa una cantidad válida")
                print()
                
        except KeyboardInterrupt:
            print("\n¡Hasta luego! 👋")
            break
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            print()

def main():
    parser = argparse.ArgumentParser(
        description="Convertidor de BOB a USDT usando datos de Binance P2P",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python convert_cli.py 1000              # Convierte 1000 BOB usando precio promedio
  python convert_cli.py 1000 --min        # Convierte 1000 BOB usando precio mínimo
  python convert_cli.py --interactive      # Modo interactivo
        """
    )
    
    parser.add_argument('amount', nargs='?', type=float, 
                       help='Cantidad en BOB a convertir')
    parser.add_argument('--min', action='store_true',
                       help='Usar precio mínimo en lugar del promedio')
    parser.add_argument('--interactive', '-i', action='store_true',
                       help='Ejecutar en modo interactivo')
    
    args = parser.parse_args()
    
    if args.interactive:
        interactive_mode()
        return
    
    if args.amount is None:
        parser.print_help()
        return
    
    # Conversión simple
    converter = BOBToUSDTConverter()
    rate_type = 'min' if args.min else 'avg'
    result = converter.convert_bob_to_usdt(args.amount, rate_type)
    
    print(format_result(result))

if __name__ == "__main__":
    main()
#!/bin/bash
# Script para ejecutar regularmente la captura de precios de USDT/BOB
# Autor: GitHub Copilot
# Fecha: Mayo 2025

# Definir directorio base (donde está el script)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Verificar si python3 está disponible
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 no está instalado. Por favor, instálelo."
    exit 1
fi

# Verificar si existe el archivo principal
if [ ! -f "binance_usdt_rates.py" ]; then
    echo "Error: No se encuentra binance_usdt_rates.py en el directorio actual."
    exit 1
fi

# Establecer permisos de ejecución si es necesario
chmod +x binance_usdt_rates.py

# Ejecutar el script
echo "Ejecutando binance_usdt_rates.py en $(date)"
python3 binance_usdt_rates.py

# Verificar el resultado
if [ $? -eq 0 ]; then
    echo "Script ejecutado correctamente."
    exit 0
else
    echo "Hubo un error al ejecutar el script."
    exit 1
fi

#!/bin/bash
# Script para ejecutar regularmente la captura de precios de USDT/BOB
# Autor: GitHub Copilot
# Fecha: Mayo 2025

# Definir directorio base (donde está el script)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Nombre del directorio del entorno virtual
VENV_DIR="venv"

# Verificar si existe el archivo principal
if [ ! -f "binance_usdt_rates.py" ]; then
    echo "Error: No se encuentra binance_usdt_rates.py en el directorio actual."
    exit 1
fi

# Verificar si existe el entorno virtual y el ejecutable de Python
PYTHON_EXEC="$DIR/$VENV_DIR/bin/python"
if [ ! -f "$PYTHON_EXEC" ]; then
    echo "Error: No se encuentra el interprete de Python en el entorno virtual $VENV_DIR."
    echo "Por favor, asegurese de crear el entorno virtual (python3 -m venv $VENV_DIR)"
    echo "y de que la ruta \"$PYTHON_EXEC\" es correcta."
    echo "Luego, active el entorno (source $VENV_DIR/bin/activate) e instale las dependencias (pip install -r requirements.txt)."
    exit 1
fi

# Establecer permisos de ejecución si es necesario (aunque se llama con python directamente)
# chmod +x binance_usdt_rates.py

# Ejecutar el script usando el Python del venv
echo "Ejecutando binance_usdt_rates.py con $PYTHON_EXEC en $(date)"
"$PYTHON_EXEC" binance_usdt_rates.py

# Verificar el resultado
if [ $? -eq 0 ]; then
    echo "Script ejecutado correctamente."
    exit 0
else
    echo "Hubo un error al ejecutar el script."
    exit 1
fi

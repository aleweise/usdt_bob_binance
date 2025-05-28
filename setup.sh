#!/bin/bash
# Script de instalación para el proyecto de scraping Binance P2P
# Autor: GitHub Copilot
# Fecha: Mayo 2025

echo "=== Instalando dependencias para scraping de Binance P2P ==="

# Verificar que estamos en Ubuntu
if [ -f /etc/lsb-release ]; then
    echo "Sistema detectado: Ubuntu/Debian"
else
    echo "ADVERTENCIA: Este script está diseñado para Ubuntu/Debian."
    echo "Es posible que no funcione correctamente en otros sistemas."
    read -p "¿Continuar? (s/n): " RESP
    if [ "$RESP" != "s" ] && [ "$RESP" != "S" ]; then
        echo "Instalación cancelada."
        exit 1
    fi
fi

# Instalar dependencias del sistema
echo "Actualizando repositorios..."
sudo apt update

echo "Instalando Python3 y herramientas relacionadas..."
sudo apt install -y python3 python3-pip python3-venv

# Crear entorno virtual
echo "Configurando entorno virtual..."
python3 -m venv env
source env/bin/activate

# Instalar dependencias de Python
echo "Instalando dependencias de Python..."
pip install -r requirements.txt

# Verificar existencia de configuración de BD
if [ ! -f "db_config.ini" ]; then
    echo "ERROR: No se encuentra db_config.ini"
    echo "Por favor, crea el archivo basándote en db_config.example.ini"
    exit 1
fi

echo "=== Instalación completada con éxito ==="
echo ""
echo "Para configurar la ejecución automática, añade la siguiente línea a crontab:"
echo "0 * * * * cd $(pwd) && ./update_usdt_rates.sh >> usdt_cron.log 2>&1"
echo ""
echo "Puedes hacerlo ejecutando:"
echo "crontab -e"
echo ""
echo "Para ejecutar manualmente:"
echo "./update_usdt_rates.sh"

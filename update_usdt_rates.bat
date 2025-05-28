@echo off
REM Script para ejecutar regularmente la captura de precios de USDT/BOB
REM Autor: GitHub Copilot
REM Fecha: Mayo 2025

echo === Actualizando precios USDT/BOB desde Binance P2P ===
echo Inicio: %date% %time%

REM Cambiar al directorio del script
cd /d "%~dp0"

REM Verificar si existe el archivo principal
if not exist binance_usdt_rates.py (
    echo ERROR: No se encuentra binance_usdt_rates.py en el directorio actual.
    exit /b 1
)

REM Ejecutar script
python binance_usdt_rates.py

REM Verificar resultado
if %errorlevel% equ 0 (
    echo Script ejecutado correctamente.
) else (
    echo ERROR: Hubo un error al ejecutar el script.
)

echo Fin: %date% %time%
echo.

pause

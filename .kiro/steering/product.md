# Product Overview

## Binance USDT/BOB Rate Tracker

A Python-based automation tool that monitors and records USDT (Tether) to BOB (Bolivian Boliviano) exchange rates from Binance P2P marketplace. The system focuses on verified merchants to ensure reliable pricing data.

### Core Functionality
- Scrapes cheapest and average USDT prices in BOB from Binance P2P API
- Stores historical pricing data in MySQL database
- Designed for hourly automated execution via cron/task scheduler
- Includes comprehensive logging and error handling with retry logic

### Key Features
- **Data Collection**: Captures minimum price (`usdt_min_bob`) and average price (`usdt_avg_bob`)
- **Reliability**: Focuses on verified merchants only for trustworthy data
- **Automation**: Cross-platform scripts for Linux/macOS and Windows
- **Persistence**: MySQL storage with automatic table creation
- **Monitoring**: Detailed logging with file and console output

### Target Use Case
Financial monitoring and analysis of cryptocurrency exchange rates in the Bolivian market, particularly useful for traders, analysts, or businesses dealing with USDT/BOB conversions.
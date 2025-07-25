# Project Structure

## Root Directory Layout
```
├── binance_usdt_rates.py      # Main application script
├── binance_usdt_bob.py        # Simple test/demo script
├── create_usdt_rates_table.sql # Database schema definition
├── db_config.example.ini      # Database configuration template
├── db_config.ini              # Actual database config (gitignored)
├── requirements.txt           # Python dependencies
├── setup.sh                   # Linux/macOS installation script
├── update_usdt_rates.sh       # Linux/macOS execution script
├── update_usdt_rates.bat      # Windows execution script
├── README.md                  # Project documentation
└── LICENSE                    # MIT license file
```

## File Organization Patterns

### Core Application Files
- **`binance_usdt_rates.py`**: Production script with full error handling, logging, and database integration
- **`binance_usdt_bob.py`**: Simplified version for testing API connectivity

### Configuration & Setup
- **`db_config.example.ini`**: Template showing required database configuration structure
- **`db_config.ini`**: User-specific database credentials (excluded from version control)
- **`create_usdt_rates_table.sql`**: Database schema with proper indexing and charset

### Automation Scripts
- **Cross-platform execution**: Separate `.sh` and `.bat` files for Unix and Windows
- **Virtual environment handling**: Scripts manage venv activation/deactivation
- **Error checking**: Both scripts validate Python environment and file existence

### Generated Files (Not in VCS)
- `venv/`: Python virtual environment directory
- `binance_usdt_rates.log`: Application log file
- `usdt_cron.log`: Cron execution log (Linux/macOS)

## Naming Conventions
- **Snake_case**: Used for Python files and database fields
- **Descriptive names**: Files clearly indicate their purpose (e.g., `update_usdt_rates.sh`)
- **Consistent prefixes**: Database-related files use clear naming (`db_config`, `create_usdt_rates_table`)

## Database Schema
- **Table**: `usdt_rates`
- **Primary key**: `id` (auto-increment)
- **Timestamp**: `recorded_at` (datetime with index)
- **Price fields**: `usdt_min_bob`, `usdt_avg_bob` (decimal precision for financial data)
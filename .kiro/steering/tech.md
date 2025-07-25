# Technology Stack

## Core Technologies
- **Python 3.6+**: Main programming language
- **MySQL/MariaDB**: Database for storing historical rate data
- **Binance P2P API**: Data source via REST API calls

## Key Dependencies
- `requests>=2.25.1`: HTTP client for API calls
- `mysql-connector-python>=8.0.26`: MySQL database connectivity
- Standard library: `configparser`, `logging`, `datetime`, `os`, `sys`

## Development Environment
- **Virtual Environment**: Uses `venv` for dependency isolation
- **Configuration**: INI files for database credentials (`db_config.ini`)
- **Cross-platform**: Supports both Unix-like systems and Windows

## Common Commands

### Setup & Installation
```bash
# Linux/macOS
./setup.sh

# Windows
pip install -r requirements.txt
```

### Manual Execution
```bash
# Linux/macOS
./update_usdt_rates.sh

# Windows
update_usdt_rates.bat
```

### Database Setup
```sql
# Run the SQL file to create tables
mysql -u username -p database_name < create_usdt_rates_table.sql
```

### Automation Setup
```bash
# Linux cron (hourly execution)
0 * * * * cd /path/to/project && ./update_usdt_rates.sh >> usdt_cron.log 2>&1
```

## Architecture Patterns
- **Configuration-driven**: Database settings externalized to INI files
- **Retry logic**: Exponential backoff for API failures
- **Logging**: Comprehensive file and console logging
- **Error handling**: Graceful degradation with proper exit codes
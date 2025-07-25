-- Creación de tabla para almacenar tasas de USDT en BOB (PostgreSQL)
-- Compatible con Neon PostgreSQL

CREATE TABLE IF NOT EXISTS usdt_rates (
    id SERIAL PRIMARY KEY,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usdt_min_bob DECIMAL(10, 2) NOT NULL,
    usdt_avg_bob DECIMAL(10, 2) NOT NULL
);

-- Índice para optimizar consultas por fecha
CREATE INDEX IF NOT EXISTS idx_usdt_rates_recorded_at ON usdt_rates (recorded_at);

-- Comentario de la tabla
COMMENT ON TABLE usdt_rates IS 'Historical record of USDT to BOB prices (minimum and average) from Binance P2P';

-- Comentarios de las columnas
COMMENT ON COLUMN usdt_rates.id IS 'Primary key auto-increment';
COMMENT ON COLUMN usdt_rates.recorded_at IS 'Timestamp when the rate was recorded';
COMMENT ON COLUMN usdt_rates.usdt_min_bob IS 'Minimum USDT price in BOB';
COMMENT ON COLUMN usdt_rates.usdt_avg_bob IS 'Average USDT price in BOB';
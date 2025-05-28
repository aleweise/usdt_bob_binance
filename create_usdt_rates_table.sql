-- Creación de tabla para almacenar tasas de USDT en BOB
CREATE TABLE IF NOT EXISTS usdt_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recorded_at DATETIME NOT NULL,
    usdt_min_bob DECIMAL(10, 2) NOT NULL,
    usdt_avg_bob DECIMAL(10, 2) NOT NULL,
    
    -- Índice para optimizar consultas por fecha
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios de la tabla
ALTER TABLE usdt_rates COMMENT 'Historical record of USDT to BOB prices (minimum and average) from Binance P2P';

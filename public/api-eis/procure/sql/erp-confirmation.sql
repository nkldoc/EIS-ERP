CREATE TABLE IF NOT EXISTS sp_erp_confirmation (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id CHAR(32) CHARACTER SET ascii NOT NULL,
    item_index INT UNSIGNED NOT NULL,
    payload LONGTEXT NOT NULL,
    confirmed_at DATETIME NULL,
    confirmed_by INT NULL,
    confirmed_name VARCHAR(200) NULL,
    UNIQUE KEY uq_erp_confirmation_item (request_id, item_index),
    KEY ix_erp_confirmation_status (confirmed_at, id),
    CONSTRAINT fk_erp_confirmation_log FOREIGN KEY (request_id)
        REFERENCES sp_api_incoming_log(request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

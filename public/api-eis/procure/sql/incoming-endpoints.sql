CREATE TABLE IF NOT EXISTS sp_api_incoming_endpoint (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    uri VARCHAR(240) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    method VARCHAR(8) NOT NULL,
    user_id INT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_incoming_route (uri, method),
    KEY ix_incoming_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sp_api_incoming_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id CHAR(32) CHARACTER SET ascii NOT NULL,
    endpoint_id INT UNSIGNED NULL,
    uri VARCHAR(240) NOT NULL,
    method VARCHAR(16) NOT NULL,
    username VARCHAR(100) NULL,
    status_code SMALLINT UNSIGNED NOT NULL,
    message VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_incoming_request (request_id),
    KEY ix_incoming_log_endpoint (endpoint_id, id),
    CONSTRAINT fk_incoming_log_endpoint FOREIGN KEY (endpoint_id)
        REFERENCES sp_api_incoming_endpoint(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

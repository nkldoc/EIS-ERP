-- ============================================================
-- Database: php_auth_api (MySQL)
-- บัญชี service (ขารับ API) + สิทธิ์การเข้าถึงต่อ route
-- ใช้กับ API ที่รับข้อมูลจากระบบภายนอก/ภายใน โดย auth ด้วย
-- username/password ใน body (ไม่ใช่ Bearer token แบบผู้ใช้ปกติ)
-- ============================================================

CREATE TABLE IF NOT EXISTS sp_api_account (
    account_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(100)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,   -- เก็บด้วย password_hash() ของ PHP เท่านั้น
    is_active       TINYINT(1)    NOT NULL DEFAULT 1,
    note            VARCHAR(255)  NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sp_api_account_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sp_api_permission (
    permission_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id      INT UNSIGNED  NOT NULL,
    route_key       VARCHAR(100)  NOT NULL,   -- เช่น 'procure.ir', 'procure.contract'
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sp_api_permission (account_id, route_key),
    CONSTRAINT fk_sp_api_permission_account
        FOREIGN KEY (account_id) REFERENCES sp_api_account(account_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


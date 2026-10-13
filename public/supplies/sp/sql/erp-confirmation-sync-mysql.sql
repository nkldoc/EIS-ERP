-- Run once on the MySQL database that holds sp_erp_confirmation.
-- Existing confirmed rows stay unsynced until explicitly sent from the page.
ALTER TABLE sp_erp_confirmation
    ADD COLUMN mssql_id BIGINT NULL,
    ADD COLUMN mssql_synced_at DATETIME NULL,
    ADD INDEX ix_erp_mssql_sync (mssql_synced_at, id);

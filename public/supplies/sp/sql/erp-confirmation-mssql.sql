-- Run on the Supplies MSSQL database (normally NMU_ERP).
IF OBJECT_ID(N'dbo.sp_erp_confirmation_inbox', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sp_erp_confirmation_inbox (
        id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        request_id VARCHAR(32) COLLATE Latin1_General_100_BIN2 NOT NULL,
        item_index INT NOT NULL,
        source_confirmation_id BIGINT NOT NULL,
        payload NVARCHAR(MAX) NOT NULL,
        payload_hash CHAR(64) NOT NULL,
        pr_id NVARCHAR(MAX) NULL,
        po_id NVARCHAR(MAX) NULL,
        period_id NVARCHAR(MAX) NULL,
        chk_id NVARCHAR(MAX) NULL,
        c_doc_ref NVARCHAR(MAX) NULL,
        confirmed_by BIGINT NULL,
        confirmed_name NVARCHAR(MAX) NULL,
        confirmed_at DATETIME2(0) NOT NULL,
        received_at DATETIME2(0) NOT NULL CONSTRAINT DF_erp_inbox_received DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_erp_inbox_request_item UNIQUE(request_id,item_index),
        CONSTRAINT CK_erp_inbox_item_index CHECK(item_index >= 0)
    );
END;

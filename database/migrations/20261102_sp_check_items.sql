USE [EIS_PROCURE];
GO

IF OBJECT_ID(N'dbo.sp_check_items', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sp_check_items (
        sp_check_item_id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        sp_check_period_hdr_id BIGINT NOT NULL,
        c_officer_name NVARCHAR(250) NOT NULL,
        dc_user_id BIGINT NULL,
        d_receive DATETIME2(0) NOT NULL DEFAULT (SYSDATETIME()),
        d_send DATETIME2(0) NULL,
        c_reason NVARCHAR(MAX) NOT NULL,
        c_annotation_image NVARCHAR(500) NULL,
        c_document_url NVARCHAR(1000) NULL,
        c_resolved_image NVARCHAR(500) NULL,
        c_resolved_note NVARCHAR(MAX) NULL,
        dc_resolved_user_id BIGINT NULL,
        c_resolved_officer_name NVARCHAR(250) NULL,
        d_resolved DATETIME2(0) NULL,
        i_status TINYINT NOT NULL DEFAULT (1),
        i_enable TINYINT NOT NULL DEFAULT (1),
        d_create DATETIME2(0) NOT NULL DEFAULT (SYSDATETIME()),
        d_update DATETIME2(0) NULL
    );
    CREATE INDEX IX_sp_check_items_period
        ON dbo.sp_check_items (sp_check_period_hdr_id, i_enable, d_create DESC);
END;
GO

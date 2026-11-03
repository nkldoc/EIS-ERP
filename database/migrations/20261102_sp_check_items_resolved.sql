USE [EIS_PROCURE];
GO

IF COL_LENGTH('dbo.sp_check_items', 'c_resolved_image') IS NULL
    ALTER TABLE dbo.sp_check_items ADD c_resolved_image NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.sp_check_items', 'c_resolved_note') IS NULL
    ALTER TABLE dbo.sp_check_items ADD c_resolved_note NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.sp_check_items', 'dc_resolved_user_id') IS NULL
    ALTER TABLE dbo.sp_check_items ADD dc_resolved_user_id BIGINT NULL;
IF COL_LENGTH('dbo.sp_check_items', 'c_resolved_officer_name') IS NULL
    ALTER TABLE dbo.sp_check_items ADD c_resolved_officer_name NVARCHAR(250) NULL;
IF COL_LENGTH('dbo.sp_check_items', 'd_resolved') IS NULL
    ALTER TABLE dbo.sp_check_items ADD d_resolved DATETIME2(0) NULL;
GO

IF OBJECT_ID('dbo.CK_sp_check_items_status', 'C') IS NOT NULL
    ALTER TABLE dbo.sp_check_items DROP CONSTRAINT CK_sp_check_items_status;
ALTER TABLE dbo.sp_check_items WITH CHECK ADD CONSTRAINT CK_sp_check_items_status
    CHECK (i_status IN (1,2,3));
GO

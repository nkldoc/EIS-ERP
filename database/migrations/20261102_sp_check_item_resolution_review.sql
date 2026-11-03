USE EIS_PROCURE;
GO

IF COL_LENGTH('dbo.sp_check_item_resolutions', 'i_review_status') IS NULL
    ALTER TABLE dbo.sp_check_item_resolutions ADD i_review_status TINYINT NOT NULL
        CONSTRAINT DF_sp_check_item_resolutions_review_status DEFAULT (0);
IF COL_LENGTH('dbo.sp_check_item_resolutions', 'dc_review_user_id') IS NULL
    ALTER TABLE dbo.sp_check_item_resolutions ADD dc_review_user_id BIGINT NULL;
IF COL_LENGTH('dbo.sp_check_item_resolutions', 'dc_review_user_id') IS NULL
    ALTER TABLE dbo.sp_check_item_resolutions ADD dc_review_user_id BIGINT NULL;
IF COL_LENGTH('dbo.sp_check_item_resolutions', 'c_review_officer_name') IS NULL
    ALTER TABLE dbo.sp_check_item_resolutions ADD c_review_officer_name NVARCHAR(250) NULL;
IF COL_LENGTH('dbo.sp_check_item_resolutions', 'd_reviewed') IS NULL
    ALTER TABLE dbo.sp_check_item_resolutions ADD d_reviewed DATETIME2(0) NULL;
IF COL_LENGTH('dbo.sp_check_item_resolutions', 'c_review_note') IS NULL
    ALTER TABLE dbo.sp_check_item_resolutions ADD c_review_note NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.sp_check_item_resolutions', 'd_reviewed') IS NULL
    ALTER TABLE dbo.sp_check_item_resolutions ADD d_reviewed DATETIME2(0) NULL;
GO

IF OBJECT_ID('dbo.CK_sp_check_items_status', 'C') IS NOT NULL
    ALTER TABLE dbo.sp_check_items DROP CONSTRAINT CK_sp_check_items_status;
ALTER TABLE dbo.sp_check_items WITH CHECK ADD CONSTRAINT CK_sp_check_items_status CHECK (i_status IN (1,2,3,4));
GO

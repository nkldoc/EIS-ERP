USE EIS_PROCURE;
GO

IF OBJECT_ID(N'dbo.sp_check_item_resolutions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sp_check_item_resolutions (
        sp_check_item_resolution_id BIGINT IDENTITY(1,1) NOT NULL,
        sp_check_item_id BIGINT NOT NULL,
        i_round INT NOT NULL,
        c_resolved_image NVARCHAR(500) NOT NULL,
        c_resolved_note NVARCHAR(MAX) NULL,
        dc_resolved_user_id BIGINT NULL,
        c_resolved_officer_name NVARCHAR(250) NOT NULL,
        d_resolved DATETIME2(0) NOT NULL CONSTRAINT DF_sp_check_item_resolutions_d_resolved DEFAULT (SYSDATETIME()),
        i_review_status TINYINT NOT NULL CONSTRAINT DF_sp_check_item_resolutions_review_status DEFAULT (0),
        dc_review_user_id BIGINT NULL,
        c_review_officer_name NVARCHAR(250) NULL,
        d_reviewed DATETIME2(0) NULL,
        c_review_note NVARCHAR(MAX) NULL,
        i_enable TINYINT NOT NULL CONSTRAINT DF_sp_check_item_resolutions_i_enable DEFAULT (1),
        CONSTRAINT PK_sp_check_item_resolutions PRIMARY KEY CLUSTERED (sp_check_item_resolution_id),
        CONSTRAINT UQ_sp_check_item_resolutions_round UNIQUE (sp_check_item_id, i_round),
        CONSTRAINT FK_sp_check_item_resolutions_item FOREIGN KEY (sp_check_item_id)
            REFERENCES dbo.sp_check_items (sp_check_item_id)
    );

    CREATE INDEX IX_sp_check_item_resolutions_item
        ON dbo.sp_check_item_resolutions (sp_check_item_id, i_enable, i_round DESC);
END;
GO

-- Preserve an existing confirmation as round 1 when upgrading an installed system.
INSERT INTO dbo.sp_check_item_resolutions
    (sp_check_item_id, i_round, c_resolved_image, c_resolved_note,
     dc_resolved_user_id, c_resolved_officer_name, d_resolved, i_enable)
SELECT i.sp_check_item_id, 1, i.c_resolved_image, i.c_resolved_note,
       i.dc_resolved_user_id, ISNULL(NULLIF(i.c_resolved_officer_name, N''), N'-'),
       ISNULL(i.d_resolved, SYSDATETIME()), 1
FROM dbo.sp_check_items i
WHERE i.c_resolved_image IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM dbo.sp_check_item_resolutions r
      WHERE r.sp_check_item_id = i.sp_check_item_id AND r.i_round = 1
  );
GO

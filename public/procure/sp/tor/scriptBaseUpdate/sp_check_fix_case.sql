USE EIS_PROCURE;
GO

/*
 * Master table: configurable inspection/correction cases.
 * SQL must use named placeholders (for example :sp_check_period_hdr_id).
 * The application layer is responsible for binding only approved parameters.
 */
IF OBJECT_ID(N'[dbo].[sp_check_fix_case]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sp_check_fix_case]
    (
        [sp_check_fix_case_id] BIGINT IDENTITY(1,1) NOT NULL,
        [c_case_code]          VARCHAR(50) NOT NULL,
        [c_case_name]          NVARCHAR(255) NOT NULL,
        [c_case_description]   NVARCHAR(1000) NULL,

        [sql_condition]        NVARCHAR(MAX) NOT NULL,
        [sql_before_display]   NVARCHAR(MAX) NOT NULL,
        [sql_update]           NVARCHAR(MAX) NULL,
        [sql_after_display]    NVARCHAR(MAX) NOT NULL,
        [sql_before_snapshot]  NVARCHAR(MAX) NOT NULL,

        -- 1=info, 2=warning, 3=high, 4=critical
        [i_severity]           TINYINT NOT NULL
            CONSTRAINT [DF_sp_check_fix_case_i_severity] DEFAULT (2),
        [i_require_confirm]    BIT NOT NULL
            CONSTRAINT [DF_sp_check_fix_case_i_require_confirm] DEFAULT (1),
        [i_allow_update]       BIT NOT NULL
            CONSTRAINT [DF_sp_check_fix_case_i_allow_update] DEFAULT (0),
        [i_enable]             BIT NOT NULL
            CONSTRAINT [DF_sp_check_fix_case_i_enable] DEFAULT (1),
        [i_sort_order]         INT NOT NULL
            CONSTRAINT [DF_sp_check_fix_case_i_sort_order] DEFAULT (0),

        [dc_user_create_id]    BIGINT NULL,
        [d_create]             DATETIME2(0) NOT NULL
            CONSTRAINT [DF_sp_check_fix_case_d_create] DEFAULT (SYSDATETIME()),
        [dc_user_update_id]    BIGINT NULL,
        [d_update]             DATETIME2(0) NULL,
        [row_version]          ROWVERSION NOT NULL,

        CONSTRAINT [PK_sp_check_fix_case]
            PRIMARY KEY CLUSTERED ([sp_check_fix_case_id]),
        CONSTRAINT [UQ_sp_check_fix_case_c_case_code]
            UNIQUE ([c_case_code]),
        CONSTRAINT [CK_sp_check_fix_case_i_severity]
            CHECK ([i_severity] BETWEEN 1 AND 4),
        CONSTRAINT [CK_sp_check_fix_case_update_permission]
            CHECK ([i_allow_update] = 0 OR [sql_update] IS NOT NULL)
    );

    CREATE INDEX [IX_sp_check_fix_case_active]
        ON [dbo].[sp_check_fix_case] ([i_enable], [i_sort_order], [i_severity]);
END;
GO

/*
 * Execution/audit table: immutable versions of before/after data.
 * before_json is saved before executing sql_update.
 */
IF OBJECT_ID(N'[dbo].[sp_check_fix_case_log]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sp_check_fix_case_log]
    (
        [sp_check_fix_case_log_id] BIGINT IDENTITY(1,1) NOT NULL,
        [sp_check_fix_case_id]     BIGINT NOT NULL,
        [sp_check_period_hdr_id]   BIGINT NULL,
        [sp_tor_hdr_period_id]     BIGINT NULL,
        [c_subject_key]            NVARCHAR(255) NOT NULL,
        [i_version_no]             INT NOT NULL,

        [parameter_json]           NVARCHAR(MAX) NULL,
        [before_json]              NVARCHAR(MAX) NOT NULL,
        [after_json]               NVARCHAR(MAX) NULL,
        [i_update_executed]        BIT NOT NULL
            CONSTRAINT [DF_sp_check_fix_case_log_i_update_executed] DEFAULT (0),
        -- CHECKED, UPDATED, SKIPPED, FAILED
        [c_status]                 VARCHAR(20) NOT NULL,
        [c_error_message]          NVARCHAR(MAX) NULL,

        [dc_user_id]               BIGINT NULL,
        [d_create]                 DATETIME2(0) NOT NULL
            CONSTRAINT [DF_sp_check_fix_case_log_d_create] DEFAULT (SYSDATETIME()),

        CONSTRAINT [PK_sp_check_fix_case_log]
            PRIMARY KEY CLUSTERED ([sp_check_fix_case_log_id]),
        CONSTRAINT [FK_sp_check_fix_case_log_case]
            FOREIGN KEY ([sp_check_fix_case_id])
            REFERENCES [dbo].[sp_check_fix_case] ([sp_check_fix_case_id]),
        CONSTRAINT [UQ_sp_check_fix_case_log_version]
            UNIQUE ([sp_check_fix_case_id], [c_subject_key], [i_version_no]),
        CONSTRAINT [CK_sp_check_fix_case_log_version]
            CHECK ([i_version_no] > 0),
        CONSTRAINT [CK_sp_check_fix_case_log_status]
            CHECK ([c_status] IN ('CHECKED', 'UPDATED', 'SKIPPED', 'FAILED')),
        CONSTRAINT [CK_sp_check_fix_case_log_parameter_json]
            CHECK ([parameter_json] IS NULL OR ISJSON([parameter_json]) = 1),
        CONSTRAINT [CK_sp_check_fix_case_log_before_json]
            CHECK (ISJSON([before_json]) = 1),
        CONSTRAINT [CK_sp_check_fix_case_log_after_json]
            CHECK ([after_json] IS NULL OR ISJSON([after_json]) = 1)
    );

    CREATE INDEX [IX_sp_check_fix_case_log_checking]
        ON [dbo].[sp_check_fix_case_log]
           ([sp_check_period_hdr_id], [sp_check_fix_case_id], [d_create] DESC);
END;
GO


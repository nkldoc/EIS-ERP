USE NMU_ERP;
GO
IF COL_LENGTH('dbo.sp_check_period_hdr', 'i_parent') IS NULL
    ALTER TABLE dbo.sp_check_period_hdr ADD i_parent BIT NOT NULL
        CONSTRAINT DF_sp_check_period_hdr_i_parent DEFAULT (0) WITH VALUES;
GO
IF COL_LENGTH('dbo.sp_check_period_hdr', 'parent_id') IS NULL
    ALTER TABLE dbo.sp_check_period_hdr ADD parent_id INT NULL;
GO
-- i_parent=1: mother AP. Child parent_id references its mother's inspection ID.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.sp_check_period_hdr') AND name='IX_sp_check_period_hdr_parent_id')
    CREATE INDEX IX_sp_check_period_hdr_parent_id ON dbo.sp_check_period_hdr(parent_id);
GO

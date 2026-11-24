/* รองรับสัญญาที่ใช้ใบกันเหลื่อมได้ 2 ใบ (แหล่งเงินที่ 1 และ 2) */
IF COL_LENGTH('dbo.sp_tor_contract', 'c_overlap2') IS NULL
BEGIN
    ALTER TABLE dbo.sp_tor_contract ADD c_overlap2 VARCHAR(100) NULL;
END;
GO

IF COL_LENGTH('dbo.sp_tor_contract', 'i_yyyy_overlap2') IS NULL
BEGIN
    ALTER TABLE dbo.sp_tor_contract ADD i_yyyy_overlap2 VARCHAR(10) NULL;
END;
GO

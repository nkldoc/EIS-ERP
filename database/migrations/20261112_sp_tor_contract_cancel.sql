IF COL_LENGTH('dbo.sp_tor_contract', 'reasion_cancle') IS NULL
BEGIN
    ALTER TABLE dbo.sp_tor_contract ADD reasion_cancle NVARCHAR(1000) NULL;
END;

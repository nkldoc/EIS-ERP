USE NMU_ERP;
GO

/* เพิ่มเมนูรายงานข้อมูลซื้อจ้างและความก้าวหน้าจนถึงเบิก (รันซ้ำได้) */
SET NOCOUNT ON;
DECLARE @newFile VARCHAR(250) = 'bi-reports-ProcurementProgressReport';
DECLARE @newName NVARCHAR(250) = N'รายงานข้อมูลซื้อจ้างและความก้าวหน้า';

IF EXISTS (SELECT 1 FROM dbo.dc_menu WHERE c_filelocation = @newFile AND i_delete = 2)
BEGIN
    PRINT N'มีเมนูรายงานความก้าวหน้าอยู่แล้ว';
    RETURN;
END;

-- ใช้รายงานซื้อจ้างที่มีอยู่เป็นต้นแบบ เพื่อคงหมวด ไอคอน และค่ากำหนดสิทธิ์เดิม
DECLARE @srcId INT, @srcCode VARCHAR(18);
SELECT TOP 1 @srcId = dc_menu_id, @srcCode = c_code
FROM dbo.dc_menu
WHERE c_filelocation LIKE 'bi-reports-%' AND i_enable = 1 AND i_delete = 2
ORDER BY dc_menu_id DESC;

IF @srcId IS NULL
BEGIN
    PRINT N'ไม่พบเมนูรายงานต้นแบบ';
    RETURN;
END;

DECLARE @lvl INT = LEN(@srcCode) / 2;
WHILE @lvl > 1 AND SUBSTRING(@srcCode, (@lvl - 1) * 2 + 1, 2) = '00'
    SET @lvl = @lvl - 1;
DECLARE @prefix VARCHAR(18) = LEFT(@srcCode, (@lvl - 1) * 2);
DECLARE @tail VARCHAR(18) = REPLICATE('0', LEN(@srcCode) - @lvl * 2);
DECLARE @maxSeq INT;
SELECT @maxSeq = MAX(CAST(SUBSTRING(c_code, (@lvl - 1) * 2 + 1, 2) AS INT))
FROM dbo.dc_menu
WHERE c_code LIKE @prefix + '%' AND LEN(c_code) = LEN(@srcCode)
  AND RIGHT(c_code, LEN(@tail)) = @tail
  AND ISNUMERIC(SUBSTRING(c_code, (@lvl - 1) * 2 + 1, 2)) = 1;

IF ISNULL(@maxSeq, 0) >= 99
BEGIN
    PRINT N'หมวดรายงานเต็มแล้ว';
    RETURN;
END;
DECLARE @newCode VARCHAR(18) = @prefix + RIGHT('0' + CAST(ISNULL(@maxSeq, 0) + 1 AS VARCHAR(2)), 2) + @tail;

BEGIN TRAN;
SELECT * INTO #menu FROM dbo.dc_menu WHERE dc_menu_id = @srcId;
DECLARE @idCol SYSNAME = (SELECT name FROM tempdb.sys.identity_columns WHERE object_id = OBJECT_ID('tempdb..#menu'));
IF @idCol IS NOT NULL EXEC ('ALTER TABLE #menu DROP COLUMN [' + @idCol + ']');
UPDATE #menu SET c_code = @newCode, c_name = @newName, c_filelocation = @newFile;
INSERT INTO dbo.dc_menu SELECT * FROM #menu;
DECLARE @newId INT = (SELECT TOP 1 dc_menu_id FROM dbo.dc_menu WHERE c_filelocation = @newFile ORDER BY dc_menu_id DESC);

SELECT * INTO #rights FROM dbo.dc_user_menu WHERE dc_menu_id = @srcId;
SET @idCol = (SELECT name FROM tempdb.sys.identity_columns WHERE object_id = OBJECT_ID('tempdb..#rights'));
IF @idCol IS NOT NULL EXEC ('ALTER TABLE #rights DROP COLUMN [' + @idCol + ']');
UPDATE #rights SET dc_menu_id = @newId;
INSERT INTO dbo.dc_user_menu SELECT * FROM #rights;
COMMIT TRAN;

DROP TABLE #menu;
DROP TABLE #rights;
SELECT dc_menu_id, c_code, c_name, c_filelocation FROM dbo.dc_menu WHERE dc_menu_id = @newId;
GO

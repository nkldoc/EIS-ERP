USE NMU_ERP;
GO

/*
 * เพิ่มเมนู "นำเข้าสัญญา (เวชภัณฑ์)" (ST00097) ในแถบเมนูซ้าย (dc_menu) - หมวดเดียวกับ
 * "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) ต่อท้ายเป็นเมนูสุดท้ายของหมวดนั้น
 * วิธี: คัดลอกแถวเมนู ST00095 ทั้งแถว (คอลัมน์อื่นๆ เหมือนเดิมทุกอย่าง) แล้วเปลี่ยน c_code
 * (ตำแหน่ง) / c_name / c_filelocation + คัดลอกสิทธิ์ผู้ใช้ (dc_user_menu) ของเมนู ST00095
 * ให้เมนูใหม่ด้วย (admin i_type_user = 2 เห็นทุกเมนูอยู่แล้ว)
 * c_code = 18 หลัก หลักละ 2 ตัวต่อ 1 ระดับ (ดู api/userMenu/userTree.php)
 * c_filelocation = ส่วนหลัง # ของ URL โดยเปลี่ยน "/" เป็น "-" และไม่มี ".php" (ตามเมนูเดิม
 * ST00095 ที่เก็บเป็น "sp-contract?st=ST00095" - เช็คจากข้อมูลจริงแล้ว)
 * รันซ้ำได้ (มีเมนูแล้วจะไม่เพิ่มซ้ำ)
 */
SET NOCOUNT ON;

-- ข้อความคือ: "นำเข้าสัญญา (เวชภัณฑ์)" (hex codepage 874 กันภาษาไทยเพี้ยน)
DECLARE @c_name VARCHAR(250) = CONVERT(VARCHAR(250), 0xb9d3e0a2e9d2cad1adadd22028e0c7aac0d1b3b1ec29);
DECLARE @newFile VARCHAR(250) = 'sp-contract?st=ST00097';

IF EXISTS (SELECT 1 FROM dbo.dc_menu WHERE c_filelocation LIKE '%st=ST00097' AND i_delete = 2)
BEGIN
    PRINT N'มีเมนู ST00097 อยู่แล้ว - ไม่เพิ่มซ้ำ';
    SELECT dc_menu_id, c_code, c_name, c_filelocation FROM dbo.dc_menu WHERE c_filelocation = @newFile;
    RETURN;
END

DECLARE @srcId INT, @srcCode VARCHAR(18);
SELECT TOP 1 @srcId = dc_menu_id, @srcCode = c_code
FROM dbo.dc_menu
WHERE c_filelocation LIKE '%st=ST00095' AND i_enable = 1 AND i_delete = 2;

IF @srcId IS NULL
BEGIN
    PRINT N'ไม่พบเมนู ST00095 (ส่งมอบงาน เวชภัณฑ์) ใน dc_menu - ยกเลิก';
    RETURN;
END

-- ระดับของเมนู ST00095 = คู่หลักสุดท้ายที่ไม่ใช่ "00"
DECLARE @lvl INT = LEN(@srcCode) / 2;
WHILE @lvl > 1 AND SUBSTRING(@srcCode, (@lvl - 1) * 2 + 1, 2) = '00'
    SET @lvl = @lvl - 1;
DECLARE @prefix VARCHAR(18) = LEFT(@srcCode, (@lvl - 1) * 2);
DECLARE @tail VARCHAR(18) = REPLICATE('0', LEN(@srcCode) - @lvl * 2);

-- ลำดับถัดไปในหมวดเดียวกัน (พี่น้องระดับเดียวกัน ที่หลักถัดไปเป็น 0 ทั้งหมด)
DECLARE @maxSeq INT;
SELECT @maxSeq = MAX(CAST(SUBSTRING(c_code, (@lvl - 1) * 2 + 1, 2) AS INT))
FROM dbo.dc_menu
WHERE c_code LIKE @prefix + '%'
  AND LEN(c_code) = LEN(@srcCode)
  AND RIGHT(c_code, LEN(@tail)) = @tail
  AND ISNUMERIC(SUBSTRING(c_code, (@lvl - 1) * 2 + 1, 2)) = 1;

IF @maxSeq >= 99
BEGIN
    PRINT N'หมวดนี้เต็ม 99 เมนูแล้ว - ยกเลิก';
    RETURN;
END
DECLARE @newCode VARCHAR(18) = @prefix + RIGHT('0' + CAST(@maxSeq + 1 AS VARCHAR(2)), 2) + @tail;

BEGIN TRAN;

-- 1) คัดลอกแถวเมนู ST00095 -> เมนูใหม่ (ตัดคอลัมน์ identity ออกก่อน insert)
SELECT * INTO #m FROM dbo.dc_menu WHERE dc_menu_id = @srcId;
DECLARE @idCol SYSNAME = (SELECT name FROM tempdb.sys.identity_columns WHERE object_id = OBJECT_ID('tempdb..#m'));
IF @idCol IS NOT NULL
    EXEC ('ALTER TABLE #m DROP COLUMN [' + @idCol + ']');
UPDATE #m SET c_code = @newCode, c_name = @c_name, c_filelocation = @newFile;
INSERT INTO dbo.dc_menu SELECT * FROM #m;
DECLARE @newId INT = (SELECT TOP 1 dc_menu_id FROM dbo.dc_menu WHERE c_filelocation = @newFile ORDER BY dc_menu_id DESC);

-- 2) คัดลอกสิทธิ์ผู้ใช้ของเมนู ST00095 ให้เมนูใหม่
SELECT * INTO #um FROM dbo.dc_user_menu WHERE dc_menu_id = @srcId;
SET @idCol = (SELECT name FROM tempdb.sys.identity_columns WHERE object_id = OBJECT_ID('tempdb..#um'));
IF @idCol IS NOT NULL
    EXEC ('ALTER TABLE #um DROP COLUMN [' + @idCol + ']');
UPDATE #um SET dc_menu_id = @newId;
INSERT INTO dbo.dc_user_menu SELECT * FROM #um;

COMMIT TRAN;

DROP TABLE #m;
DROP TABLE #um;

SELECT dc_menu_id, c_code, c_name, c_filelocation FROM dbo.dc_menu WHERE dc_menu_id IN (@srcId, @newId);
SELECT COUNT(*) AS users_with_new_menu FROM dbo.dc_user_menu WHERE dc_menu_id = @newId;
GO

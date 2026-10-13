USE NMU_ERP;
GO

/*
 * ลบ (soft delete) เมนู "บันทึกติดตามการจัดซื้อ (เวชภัณฑ์)" (ST00093) ออกจาก
 * ต้นไม้เมนูฝั่ง supplies - ไม่ได้ใช้งานแล้วตามที่แจ้ง
 *
 * ทำตาม logic เดียวกับโหมด "Delete" ของ public/supplies/dc/api/mnDcMenu.php
 * ทุกประการ (เลื่อนรหัส c_code ของ sibling ที่อยู่ถัดไปทั้งหมดถอยลง -1 แล้วตั้ง
 * i_delete = DELETE_TRUE(1) ที่แถวนี้) เพื่อไม่ให้กระทบโครงสร้างต้นไม้เมนูเดิม
 *
 * หมายเหตุ: สคริปต์นี้ "ซ่อน" เมนูเท่านั้น (ยังย้อนกลับได้ด้วยการ UPDATE dc_menu
 * SET i_delete = 2 WHERE dc_menu_id = ... ) ไม่ได้ลบตาราง sp_medsup_purchase_track /
 * sp_medsup_purchase_track_bill หรือไฟล์โค้ดที่เกี่ยวข้องออก เผื่อยังมีข้อมูลที่
 * เคยบันทึกไว้อยู่ - ถ้าต้องการลบตาราง/ไฟล์ทิ้งจริงด้วย ให้แจ้งแยกต่างหาก
 *
 * Idempotent: ถ้าเมนูนี้ถูกลบไปแล้ว (ไม่พบแถวที่ i_delete <> 1) จะไม่ทำซ้ำ
 */
SET NOCOUNT ON;

IF EXISTS (SELECT 1 FROM [dbo].[dc_menu] WHERE c_filelocation = 'sp-contract?st=ST00093' AND i_delete <> 1)
BEGIN
    BEGIN TRANSACTION;

    DECLARE @ref_id BIGINT;
    DECLARE @refCode VARCHAR(250);
    DECLARE @maxLenght INT;
    DECLARE @leftLenght INT;
    DECLARE @rightLenght INT;
    DECLARE @tempCode VARCHAR(250);
    DECLARE @parentCode VARCHAR(250);
    DECLARE @i_delete TINYINT = 1; -- DELETE_TRUE
    DECLARE @user_id NUMERIC = 1;
    DECLARE @user_cost_id NUMERIC = 1;

    SELECT @ref_id = dc_menu_id FROM [dbo].[dc_menu] WHERE c_filelocation = 'sp-contract?st=ST00093';

    SELECT @refCode = c_code FROM [dbo].[dc_menu] WHERE dc_menu_id = @ref_id;
    SET @maxLenght = LEN(@refCode);

    -- ตัด "00" ท้ายออกทีละคู่ เหมือน mnDcMenu.php (หา segment ของ node นี้) - ต้องวน
    -- ตามจำนวนรอบคงที่ของความยาว "เดิม" (@maxLenght) ห้ามใช้ LEN(@refCode) ที่หด
    -- ตัวลงระหว่างลูปมาเป็นเงื่อนไข ไม่งั้นลูปจะหยุดเร็วเกินไป
    DECLARE @i INT = 1;
    WHILE @i <= (@maxLenght / 2)
    BEGIN
        IF RIGHT(@refCode, 2) = '00'
            SET @refCode = LEFT(@refCode, LEN(@refCode) - 2);
        SET @i = @i + 1;
    END

    SET @leftLenght = LEN(@refCode);
    SET @rightLenght = @maxLenght - @leftLenght;
    SET @tempCode = REPLICATE('0', @maxLenght);
    SET @parentCode = LEFT(@refCode, @leftLenght - 2);

    -- เลื่อน sibling ที่มาหลัง ST00093 ถอยลงทีละ 1 (ปิดช่องว่างที่จะเกิดจากการลบ)
    UPDATE [dbo].[dc_menu]
    SET c_code = RIGHT('00' + CAST((CAST(LEFT(c_code, @leftLenght) AS NUMERIC) - 1) AS VARCHAR(250)), @leftLenght) + RIGHT(c_code, @rightLenght)
    WHERE c_code LIKE @parentCode + '%'
        AND LEFT(c_code, @leftLenght) > @refCode
        AND i_delete <> @i_delete;

    UPDATE [dbo].[dc_menu]
    SET i_delete = @i_delete, dc_user_update_id = @user_id, dc_user_update_cost_id = @user_cost_id, d_update = GETDATE()
    WHERE dc_menu_id = @ref_id;

    COMMIT TRANSACTION;
END
GO

SELECT dc_menu_id, c_code, c_name, c_filelocation, i_enable, i_delete
FROM [dbo].[dc_menu]
WHERE c_filelocation IN ('sp-contract?st=ST0009', 'sp-contract?st=ST00092', 'sp-contract?st=ST00093', 'sp-contract?st=ST00094', 'sp-contractExt?st=ST00091')
ORDER BY c_code;
GO

USE NMU_ERP;
GO

/*
 * เพิ่มเมนู "บันทึกติดตามการจัดซื้อ (เวชภัณฑ์)" ต่อท้ายเมนู
 * "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" (ST00092) ในต้นไม้เมนูฝั่ง supplies
 *
 * ทำตาม logic เดียวกับโหมด "AddAfter" ของ public/supplies/dc/api/mnDcMenu.php
 * ทุกประการ (เลื่อนรหัส c_code ของ sibling ที่อยู่ถัดไปทั้งหมด +1 แล้วแทรก
 * แถวใหม่เข้าไปในตำแหน่งที่ว่าง)
 *
 * Idempotent: ถ้าเคยรันไปแล้ว (มี c_filelocation นี้อยู่แล้ว) จะไม่ทำซ้ำ
 */
SET NOCOUNT ON;

IF NOT EXISTS (SELECT 1 FROM [dbo].[dc_menu] WHERE c_filelocation = 'sp-contract?st=ST00093')
BEGIN
    BEGIN TRANSACTION;

    DECLARE @ref_id BIGINT;
    DECLARE @refCode VARCHAR(250);
    DECLARE @maxLenght INT;
    DECLARE @leftLenght INT;
    DECLARE @rightLenght INT;
    DECLARE @tempCode VARCHAR(250);
    DECLARE @parentCode VARCHAR(250);
    DECLARE @c_filelocation VARCHAR(250) = 'sp-contract?st=ST00093';
    -- หมายเหตุ: dc_menu.c_name เป็น VARCHAR collation Thai_CI_AS (codepage 874)
    -- ข้อความคือ: "บันทึกติดตามการจัดซื้อ (เวชภัณฑ์)"
    DECLARE @c_name VARCHAR(250) = CONVERT(VARCHAR(250), 0xBAD1B9B7D6A1B5D4B4B5D2C1A1D2C3A8D1B4ABD7E9CD2028E0C7AAC0D1B3B1EC29);
    DECLARE @i_enable TINYINT = 1;
    DECLARE @i_delete TINYINT = 2; -- DELETE_FALSE
    DECLARE @user_id NUMERIC = 1;
    DECLARE @user_cost_id NUMERIC = 1;
    DECLARE @new_dc_menu_id BIGINT;

    -- ref_id = dc_menu_id ของ "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" (ST00092)
    SELECT @ref_id = dc_menu_id FROM [dbo].[dc_menu] WHERE c_filelocation = 'sp-contract?st=ST00092';

    IF @ref_id IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        -- ข้อความ: "ไม่พบเมนู ST00092 (c_filelocation = sp-contract?st=ST00092) ยกเลิกการเพิ่มเมนูใหม่"
        RAISERROR('ref menu ST00092 not found, aborting', 16, 1);
        RETURN;
    END

    SELECT @refCode = c_code FROM [dbo].[dc_menu] WHERE dc_menu_id = @ref_id;
    SET @maxLenght = LEN(@refCode);

    -- ตัด "00" ท้ายออกทีละคู่ เหมือน mnDcMenu.php (หา segment ของ node นี้)
    -- สำคัญ: ต้องวนตามจำนวนรอบคงที่ของความยาว "เดิม" (@maxLenght) ห้ามใช้
    -- LEN(@refCode) ที่หดตัวลงระหว่างลูปมาเป็นเงื่อนไข (บั๊กที่เจอจริงในรอบแรก)
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

    UPDATE [dbo].[dc_menu]
    SET c_code = RIGHT('00' + CAST((CAST(LEFT(c_code, @leftLenght) AS NUMERIC) + 1) AS VARCHAR(250)), @leftLenght) + RIGHT(c_code, @rightLenght)
    WHERE c_code LIKE @parentCode + '%'
        AND LEFT(c_code, @leftLenght) > @refCode
        AND i_delete = @i_delete;

    INSERT INTO [dbo].[dc_menu] (c_filelocation, c_code, c_name, i_enable, i_delete, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update)
    VALUES (
        @c_filelocation,
        LEFT(RIGHT('00' + CAST((CAST(LEFT(@refCode, @leftLenght) AS NUMERIC) + 1) AS VARCHAR(250)), @leftLenght) + @tempCode, @maxLenght),
        @c_name, @i_enable, @i_delete, @user_id, @user_cost_id, GETDATE(), @user_id, @user_cost_id, GETDATE()
    );

    SET @new_dc_menu_id = SCOPE_IDENTITY();

    -- คัดลอกสิทธิ์การมองเห็น (dc_user_menu) จากเมนู ST00092 เดิมมาให้เมนูใหม่
    INSERT INTO [dbo].[dc_user_menu]
        (dc_user_id, dc_menu_id, dc_menu_hdr_id, i_show, i_read_self, i_read_cost, i_read_all, i_read_overall, i_per_add, i_per_update, i_per_delete)
    SELECT
        dc_user_id, @new_dc_menu_id, dc_menu_hdr_id, i_show, i_read_self, i_read_cost, i_read_all, i_read_overall, i_per_add, i_per_update, i_per_delete
    FROM [dbo].[dc_user_menu]
    WHERE dc_menu_id = @ref_id;

    COMMIT TRANSACTION;

    SELECT @new_dc_menu_id AS new_dc_menu_id;
END
GO

SELECT dc_menu_id, c_code, c_name, c_filelocation, i_enable, i_delete
FROM [dbo].[dc_menu]
WHERE c_filelocation IN ('sp-contract?st=ST0009', 'sp-contract?st=ST00092', 'sp-contract?st=ST00093', 'sp-contractExt?st=ST00091')
ORDER BY c_code;
GO

USE NMU_ERP;
GO

/*
 * เพิ่มเมนู "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" ในต้นไม้เมนูฝั่ง supplies (ใต้ "บริหารสัญญา")
 * เป็นขั้นตอนแรกสุดของ flow เวชภัณฑ์ (ก่อนเมนู "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)"
 * ST00092) - ใช้ตำแหน่งอ้างอิง (AddAfter) เป็นเมนู "บันทึกรายละเอียดในสัญญา" ทั่วไป
 * (c_filelocation = sp-contract?st=ST0009) เพื่อให้เมนูใหม่ไปแทรกอยู่ "ก่อนหน้า" ST00092
 * พอดี (สำรวจ c_code จริงแล้วพบว่า ST0009 อยู่ตำแหน่งก่อน ST00092 ในต้นไม้เมนูทันที)
 *
 * ทำตาม logic เดียวกับโหมด "AddAfter" ของ public/supplies/dc/api/mnDcMenu.php ทุกประการ
 * (เลื่อนรหัส c_code ของ sibling ที่อยู่ถัดไปทั้งหมด +1 แล้วแทรกแถวใหม่เข้าไปในตำแหน่งที่
 * ว่าง) เพื่อไม่ให้กระทบโครงสร้างต้นไม้เมนูเดิม - รูปแบบเดียวกับ
 * dc_menu_medsup_accept_work.sql (ST00096)
 *
 * สิทธิ์การมองเห็น (dc_user_menu) คัดลอกจากเมนู "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)"
 * ST00092 แทน (ไม่ใช่จาก ST0009 ที่ใช้แค่คำนวณตำแหน่ง) เพราะกลุ่มผู้ใช้ที่ควรเห็นเมนูนี้
 * คือฝ่ายเวชภัณฑ์เท่านั้น เช่นเดียวกับเมนูอื่นในตระกูลเดียวกัน
 *
 * Idempotent: ถ้าเคยรันไปแล้ว (มี c_filelocation นี้อยู่แล้ว) จะไม่ทำซ้ำ
 */
SET NOCOUNT ON;

IF NOT EXISTS (SELECT 1 FROM [dbo].[dc_menu] WHERE c_filelocation = 'sp-newTorMedSup')
BEGIN
    BEGIN TRANSACTION;

    DECLARE @ref_id BIGINT;
    DECLARE @perm_ref_id BIGINT;
    DECLARE @refCode VARCHAR(250);
    DECLARE @maxLenght INT;
    DECLARE @leftLenght INT;
    DECLARE @rightLenght INT;
    DECLARE @tempCode VARCHAR(250);
    DECLARE @parentCode VARCHAR(250);
    DECLARE @c_filelocation VARCHAR(250) = 'sp-newTorMedSup';
    -- หมายเหตุ: dc_menu.c_name เป็น VARCHAR collation Thai_CI_AS (codepage 874)
    -- ใช้ hex literal แทนตัวอักษรไทยตรงๆ กันปัญหาไฟล์/console encoding ทำข้อความเพี้ยน
    -- ข้อความคือ: "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์"
    DECLARE @c_name VARCHAR(250) = CONVERT(VARCHAR(250), 0xA1D2C3A8D1B4B7D32050522028CBB9E8C7C2A7D2B92920E0C7AAC0D1B3B1EC);
    DECLARE @i_enable TINYINT = 1;
    DECLARE @i_delete TINYINT = 2; -- DELETE_FALSE
    DECLARE @user_id NUMERIC = 1;
    DECLARE @user_cost_id NUMERIC = 1;
    DECLARE @new_dc_menu_id BIGINT;

    -- ref_id = dc_menu_id ของ "บันทึกรายละเอียดในสัญญา" ทั่วไป (ST0009) - ใช้แค่คำนวณ
    -- ตำแหน่งแทรก (เมนูใหม่จะไปอยู่ถัดจากตัวนี้ทันที คือก่อนหน้า ST00092 พอดี)
    SELECT @ref_id = dc_menu_id FROM [dbo].[dc_menu] WHERE c_filelocation = 'sp-contract?st=ST0009';
    -- perm_ref_id = เมนูที่ใช้คัดลอกสิทธิ์การมองเห็นจริง (เวชภัณฑ์เท่านั้น)
    SELECT @perm_ref_id = dc_menu_id FROM [dbo].[dc_menu] WHERE c_filelocation = 'sp-contract?st=ST00092';

    IF @ref_id IS NULL OR @perm_ref_id IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        -- ข้อความ: "ไม่พบเมนูอ้างอิง (ST0009 หรือ ST00092) ยกเลิกการเพิ่มเมนูใหม่"
        DECLARE @errmsg VARCHAR(250) = CONVERT(VARCHAR(250), 0xE4C1E8BEBAE0C1B9D9CDE9D2A7CDD4A7202853543030303920CBC3D7CD20535430303039322920C2A1E0C5D4A1A1D2C3E0BED4E8C1E0C1B9D9E3CBC1E8);
        RAISERROR(@errmsg, 16, 1);
        RETURN;
    END

    SELECT @refCode = c_code FROM [dbo].[dc_menu] WHERE dc_menu_id = @ref_id;
    SET @maxLenght = LEN(@refCode);

    -- ตัด "00" ท้ายออกทีละคู่ เหมือน mnDcMenu.php (หา segment ของ node นี้)
    -- สำคัญ: ต้องวนตามจำนวนรอบคงที่ของความยาว "เดิม" (@maxLenght) ห้ามใช้
    -- LEN(@refCode) ที่หดตัวลงระหว่างลูปมาเป็นเงื่อนไข ไม่งั้นลูปจะหยุดเร็วเกินไป
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

    -- เลื่อน sibling ที่มาหลัง ST0009 ขึ้นไปทีละ 1 (รวม ST00092 เอง จะถูกเลื่อนไปเป็นลำดับ
    -- ถัดจากเมนูใหม่ทันที)
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

    -- คัดลอกสิทธิ์การมองเห็น (dc_user_menu) จากเมนู ST00092 (เวชภัณฑ์) มาให้เมนูใหม่
    INSERT INTO [dbo].[dc_user_menu]
        (dc_user_id, dc_menu_id, dc_menu_hdr_id, i_show, i_read_self, i_read_cost, i_read_all, i_read_overall, i_per_add, i_per_update, i_per_delete)
    SELECT
        dc_user_id, @new_dc_menu_id, dc_menu_hdr_id, i_show, i_read_self, i_read_cost, i_read_all, i_read_overall, i_per_add, i_per_update, i_per_delete
    FROM [dbo].[dc_user_menu]
    WHERE dc_menu_id = @perm_ref_id;

    COMMIT TRANSACTION;

    SELECT @new_dc_menu_id AS new_dc_menu_id;
END
GO

SELECT dc_menu_id, c_code, c_name, c_filelocation, i_enable, i_delete
FROM [dbo].[dc_menu]
WHERE c_filelocation IN ('sp-contract?st=ST0009', 'sp-newTorMedSup', 'sp-contract?st=ST00092', 'sp-contract?st=ST00093')
ORDER BY c_code;
GO

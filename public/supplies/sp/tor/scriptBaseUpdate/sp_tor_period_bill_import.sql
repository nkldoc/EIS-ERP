USE NMU_ERP;
GO

/*
 * นำเข้าสัญญา (เวชภัณฑ์) จากไฟล์ Excel - ST00097 (medSupContractImport.js)
 * ผู้ใช้กรอกชื่อรายการ (เช่น "นำเข้าสัญญา 100 รายการ") + แนบไฟล์ Excel -> ตรวจสอบ/แสดง
 * รายละเอียดก่อน -> บันทึกเข้า sp_tor_period_bill (ตารางเดียวกับเมนู "บันทึกรายละเอียดใน
 * สัญญา (เวชภัณฑ์)" ST00092 ทุกอย่าง - สัญญาที่นำเข้าใช้ต่อที่ส่งมอบงาน/ตรวจรับได้ตามปกติ)
 * 1 ครั้งที่นำเข้า = 1 แถวใน sp_tor_period_bill_import (ประวัติการนำเข้า) และทุกแถวของ
 * sp_tor_period_bill ที่สร้างจากครั้งนั้นผูก sp_tor_period_bill_import_id ไว้
 */
IF OBJECT_ID('dbo.sp_tor_period_bill_import', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sp_tor_period_bill_import] (
        sp_tor_period_bill_import_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        c_import_name NVARCHAR(250) NOT NULL,      -- ชื่อรายการ เช่น "นำเข้าสัญญา 100 รายการ"
        c_file_name NVARCHAR(250) NULL,            -- ชื่อไฟล์ Excel ที่แนบ
        i_contract_count INT NULL,                 -- จำนวนสัญญาที่นำเข้า
        i_row_count INT NULL,                      -- จำนวนงวด (แถวในไฟล์)
        f_total_amt MONEY NULL,                    -- ยอดเงินรวมทุกงวด
        i_enabled BIT NOT NULL DEFAULT 1,
        dc_user_create_id INT NULL,
        dc_user_create_cost_id INT NULL,
        d_create DATETIME NULL
    );
END
GO

IF COL_LENGTH('dbo.sp_tor_period_bill', 'sp_tor_period_bill_import_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [sp_tor_period_bill_import_id] INT NULL;
END
GO

/*
 * ลงทะเบียนหน้า "นำเข้าสัญญา (เวชภัณฑ์)" เป็นรหัส ST00097 (หน้า loader เดิม
 * public/supplies/sp/contract.php - js ชี้ไปที่ public/supplies/sp/tor/medSupContractImport.js)
 * หมายเหตุ: c_name เป็น VARCHAR collation Thai_CI_AS (codepage 874) ใช้ hex literal กันข้อความ
 * ไทยเพี้ยน - ข้อความคือ: "นำเข้าสัญญา (เวชภัณฑ์)"
 * ตรวจก่อนรันว่า ST00097 ยังไม่ถูกใช้กับหน้าอื่น (SELECT ท้ายไฟล์) ถ้าถูกใช้แล้วให้เปลี่ยนรหัส
 */
DECLARE @c_name VARCHAR(250) = CONVERT(VARCHAR(250), 0xb9d3e0a2e9d2cad1adadd22028e0c7aac0d1b3b1ec29);

IF NOT EXISTS (SELECT 1 FROM [dbo].[sp_status_hdr] WHERE [c_code] = 'ST00097')
BEGIN
    INSERT INTO [dbo].[sp_status_hdr]
    (
        sp_type_status_id, c_code, c_name,
        i_entrance, i_alarm, i_day, i_config, i_before,
        i_seq, i_seq_type, js, code_tomenu,
        i_enabled, dc_user_create_id, dc_user_create_cost_id, d_create
    )
    VALUES
    (
        5, 'ST00097', @c_name,
        3, 3, 4, 3, 24,
        4, 1, 'medSupContractImport', 'ST00097',
        1, 1, 1, GETDATE()
    );
END
GO

SELECT sp_status_hdr_id, c_code, c_name, js FROM [dbo].[sp_status_hdr] WHERE c_code = 'ST00097';
GO

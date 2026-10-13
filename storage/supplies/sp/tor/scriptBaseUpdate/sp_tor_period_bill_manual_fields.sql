USE NMU_ERP;
GO

/*
 * เดิม ST00092 ดึงชื่อโครงการ/ปีงบ/PO/ผู้ขาย/วันที่เริ่ม-สิ้นสุดสัญญามาจาก
 * sp_tor_contract แบบ read-only เท่านั้น แต่พบว่าต้องรองรับกรณีคีย์ "สัญญาใหม่"
 * ที่ยังไม่มีในระบบ sp_tor_contract ด้วย (ผู้ใช้พิมพ์เลขสัญญาเองได้ ไม่บังคับเลือก
 * จาก list) ฟิลด์เหล่านี้จึงต้องกรอกเอง/แก้ไขได้ และต้องเก็บ "ค่าที่กรอกจริง"
 * ไว้ในตารางเอง แทนที่จะพึ่งพา join กับ sp_tor_contract เพียงอย่างเดียว
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_project_name') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD
        [c_project_name]    VARCHAR(500) NULL,   -- ชื่อโครงการ
        [i_yyyy]            INT NULL,             -- ปีงบประมาณ
        [d_start_date]      DATE NULL,            -- วันที่เริ่มสัญญา
        [d_end_date]        DATE NULL,            -- วันที่สิ้นสุดสัญญา
        [c_po_no]           VARCHAR(100) NULL,    -- เลข PO
        [dc_creditor_id]    BIGINT NULL,          -- ผู้ขาย/ผู้รับจ้าง -> NMU.dbo.dc_creditor
        [c_creditor_name]   VARCHAR(250) NULL,    -- ชื่อผู้ขาย (denormalized)
        [c_creditor_tax_no] VARCHAR(50) NULL;      -- เลขประจำตัวผู้เสียภาษี (denormalized, แก้ไขได้)
END
GO

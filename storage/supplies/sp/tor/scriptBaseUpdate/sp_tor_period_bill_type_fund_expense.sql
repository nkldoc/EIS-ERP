USE NMU_ERP;
GO

/*
 * เพิ่มฟิลด์ส่วนหัวอีก 3 ช่องให้ ST00092 ตามที่ขอเพิ่มเติม:
 *   - c_contract_type : ประเภทของสัญญา (จัดซื้อจะขาย/PO/ใบสั่งซื้อ/สัญญา/ทั้งหมด)
 *   - c_fund_source    : แหล่งเงิน
 *   - c_expense_name   : ชื่อค่าใช้จ่าย (ค่าเริ่มต้น copy มาจากชื่อโครงการ แก้ไขได้)
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_contract_type') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD
        [c_contract_type] VARCHAR(50) NULL,
        [c_fund_source]   VARCHAR(200) NULL,
        [c_expense_name]  VARCHAR(500) NULL;
END
GO

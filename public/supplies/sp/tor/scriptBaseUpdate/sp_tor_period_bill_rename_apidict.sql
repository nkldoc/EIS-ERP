USE NMU_ERP;
GO

/*
 * ปรับชื่อคอลัมน์บางตัวใน sp_tor_period_bill ให้ตรงกับ Data Dictionary ของ AP-API
 * ภายนอก (ระบบงบประมาณกลาง มนร.) ตามชีต "ข้อมูลที่ ERP ที่ต้องส่งให้" เพื่อให้การ
 * เชื่อมต่อ API ในอนาคตแม็ปชื่อฟิลด์ตรงกันได้ทันที
 *
 *   d_doc_date        -> d_doc_dateSub      (วันที่รับของ)
 *   f_amt              -> f_period_amt       (จำนวนเงินต่องวด)
 *   i_yyyy              -> i_budget_year      (ปีงบประมาณ)
 *   c_creditor_tax_no  -> c_tax_number_imp   (เลขผู้เสียภาษีผู้ขาย/ผู้รับจ้าง)
 *
 * (ชื่อค่าใช้จ่าย "po_expense_id" ตั้งใจคงไว้ตามเดิม ไม่เปลี่ยนเป็น bg_expense_id
 * ตาม dictionary เพราะผูกกับ lookup po_expense ที่ระบบเดิมใช้อยู่ทั้งระบบแล้ว)
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'd_doc_date') IS NOT NULL
   AND COL_LENGTH('dbo.sp_tor_period_bill', 'd_doc_dateSub') IS NULL
BEGIN
    EXEC sp_rename 'dbo.sp_tor_period_bill.d_doc_date', 'd_doc_dateSub', 'COLUMN';
END
GO

IF COL_LENGTH('dbo.sp_tor_period_bill', 'f_amt') IS NOT NULL
   AND COL_LENGTH('dbo.sp_tor_period_bill', 'f_period_amt') IS NULL
BEGIN
    EXEC sp_rename 'dbo.sp_tor_period_bill.f_amt', 'f_period_amt', 'COLUMN';
END
GO

IF COL_LENGTH('dbo.sp_tor_period_bill', 'i_yyyy') IS NOT NULL
   AND COL_LENGTH('dbo.sp_tor_period_bill', 'i_budget_year') IS NULL
BEGIN
    EXEC sp_rename 'dbo.sp_tor_period_bill.i_yyyy', 'i_budget_year', 'COLUMN';
END
GO

IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_creditor_tax_no') IS NOT NULL
   AND COL_LENGTH('dbo.sp_tor_period_bill', 'c_tax_number_imp') IS NULL
BEGIN
    EXEC sp_rename 'dbo.sp_tor_period_bill.c_creditor_tax_no', 'c_tax_number_imp', 'COLUMN';
END
GO

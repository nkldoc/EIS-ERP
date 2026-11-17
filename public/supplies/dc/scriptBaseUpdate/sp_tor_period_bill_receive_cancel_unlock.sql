/* ============================================================================
   sp_tor_period_bill_receive_cancel_unlock.sql  (NMU_ERP)  รันได้ซ้ำ
   "ปลดล็อกเพื่อยกเลิก" สำหรับงวดที่ออกเลข AP แล้ว (แยกจากการปลดล็อกแก้ VAT b_ap_unlock)
   แอดมินปลดล็อกด้วย ID ปลดล็อกเดิม -> b_cancel_unlock = 1 ทุกแถวรับของของงวดนั้น
   แล้วแอดมินยกเลิกงวดได้ (mnMedSupPeriodBillReceiveController.php mode UNLOCK_CANCEL / CANCEL_PERIOD)
   ============================================================================ */
USE NMU_ERP;
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'b_cancel_unlock') IS NULL
    ALTER TABLE dbo.sp_tor_period_bill_receive ADD b_cancel_unlock BIT NULL;
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'd_cancel_unlock') IS NULL
    ALTER TABLE dbo.sp_tor_period_bill_receive ADD d_cancel_unlock DATETIME NULL;
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'dc_user_cancel_unlock_id') IS NULL
    ALTER TABLE dbo.sp_tor_period_bill_receive ADD dc_user_cancel_unlock_id INT NULL;

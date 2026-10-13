USE NMU_ERP;
GO

/*
 * ฟิลด์รองรับปุ่ม "จองเงิน"/"ยกเลิกการจองเงิน" ต่องวด (sp_tor_period_bill) - เรียก
 * AP-API ภายนอกจริง (production) ที่ https://api-eis.nmu.ac.th/procure/ir ตาม
 * Data Dictionary ในชีต "DataDict api AP" ผลลัพธ์การจองเก็บไว้ในตารางนี้เอง (ไม่
 * เขียนกลับไปที่ sp_tor_contract ของระบบเดิม เพื่อไม่ให้ชนกับการจองเงินสัญญาที่มีอยู่
 * แล้วในระบบเดิม)
 *
 *   sp_tor_id            - pr_id ของ AP-API (คัดลอกมาจาก sp_tor_contract.sp_tor_id
 *                           ตอนเลือกสัญญาที่มีอยู่จริงในระบบ - ใช้เช็คว่าจองเงินได้ไหม)
 *   bg_reserve_money_id  - รหัสอ้างอิงการจองเงินที่ได้กลับมาจาก AP-API (NOT NULL =
 *                           จองแล้ว ใช้ล็อกไม่ให้แก้ไขงวดนี้จนกว่าจะยกเลิกจอง)
 *   c_ap_arrive_code     - เลขรับของที่ได้กลับจาก AP-API (c_arrive_code)
 *   c_ap_api_response    - raw JSON response ล่าสุดจาก AP-API เก็บไว้ debug/ตรวจสอบ
 *   d_ap_reserve         - วันที่/เวลาที่จองเงินสำเร็จ
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'sp_tor_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [sp_tor_id] BIGINT NULL;
END
GO

IF COL_LENGTH('dbo.sp_tor_period_bill', 'bg_reserve_money_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [bg_reserve_money_id] BIGINT NULL;
END
GO

IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_ap_arrive_code') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [c_ap_arrive_code] VARCHAR(100) NULL;
END
GO

IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_ap_api_response') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [c_ap_api_response] VARCHAR(4000) NULL;
END
GO

IF COL_LENGTH('dbo.sp_tor_period_bill', 'd_ap_reserve') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [d_ap_reserve] DATETIME NULL;
END
GO

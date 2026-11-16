/* ============================================================================
   alter_sp_tor_cancel_req_restore.sql  (NMU_ERP)  รันได้ซ้ำ
   รองรับ "กู้คืน PR ที่ยกเลิกไปแล้ว" (กรณี user กดผิด) ในเมนูอนุมัติยกเลิก PR
   i_status เพิ่ม : 4 = กู้คืนแล้ว (PR กลับมาใช้งาน + เปิดการจองเงินเดิมคืน)
   เพิ่มคอลัมน์   : c_released_reserve_ids = id แถว bg_reserve_money ที่ตอนอนุมัติถูกปิด (ใช้เปิดคืนให้ถูกแถว)
                    sp_tor_delete_id      = แถวประวัติยกเลิกที่สร้างตอนอนุมัติ (ถอดออกตอนกู้คืน แต่เก็บสำรองใน log)
                    c_restore_comment / dc_user_restore_id / d_restore = ข้อมูลการกู้คืน
   ตารางสำรอง     : dbo.sp_tor_delete_restore_log (สำเนาแถว sp_tor_delete ที่ถอดออก)
   ============================================================================ */
USE NMU_ERP;
IF COL_LENGTH('dbo.sp_tor_cancel_req', 'c_released_reserve_ids') IS NULL ALTER TABLE dbo.sp_tor_cancel_req ADD c_released_reserve_ids NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.sp_tor_cancel_req', 'sp_tor_delete_id')       IS NULL ALTER TABLE dbo.sp_tor_cancel_req ADD sp_tor_delete_id INT NULL;
IF COL_LENGTH('dbo.sp_tor_cancel_req', 'c_restore_comment')      IS NULL ALTER TABLE dbo.sp_tor_cancel_req ADD c_restore_comment NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.sp_tor_cancel_req', 'dc_user_restore_id')     IS NULL ALTER TABLE dbo.sp_tor_cancel_req ADD dc_user_restore_id INT NULL;
IF COL_LENGTH('dbo.sp_tor_cancel_req', 'd_restore')              IS NULL ALTER TABLE dbo.sp_tor_cancel_req ADD d_restore DATETIME NULL;
IF OBJECT_ID('dbo.sp_tor_delete_restore_log') IS NULL
    SELECT * INTO dbo.sp_tor_delete_restore_log FROM (SELECT * FROM dbo.sp_tor_delete WHERE 1 = 0 UNION ALL SELECT * FROM dbo.sp_tor_delete WHERE 1 = 0) x;  -- UNION ALL เพื่อไม่ให้คัดลอก IDENTITY

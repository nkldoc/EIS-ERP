USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์ pr_hdr_id ในตาราง sp_tor_period_bill - เก็บ sp_tor_period_bill_hdr_id ของแถว
 * "PR" ต้นทาง (สร้างจากเมนู "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" newTorMedSup.php) ที่สัญญานี้
 * เลือกมาทำต่อ ใช้ตอนจองเงินขั้นสัญญา (i_reserve = 2) ใน "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)"
 * ST00092: API จองเงินของ ERP (api-nmu mn_BgReserveMoney) ต้องมีการจองขั้น PR (i_reserve = 1)
 * ของ pr_id เดียวกันมาก่อน ระบบจึงต้องรู้ว่าสัญญานี้มาจาก PR ตัวไหน (pr_id = hdr_id ของ PR)
 *
 * ไม่ backfill ข้อมูลเดิม (ปล่อย NULL) - สัญญาเดิมที่ไม่ได้ผูก PR จะจองเงินขั้นสัญญาไม่ได้
 * จนกว่าจะเลือก PR ที่จองเงินแล้วมาผูก
 */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'pr_hdr_id'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD pr_hdr_id BIGINT NULL;
END
GO

SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'pr_hdr_id';
GO

/*
 * เพิ่มคอลัมน์ pr_bg_reserve_money_id / 2 / 3 - เก็บเลขอ้างอิงการจองเงิน "ขั้น PR" (i_reserve = 1) ที่ระบบ
 * จองให้อัตโนมัติตอนกดจองเงินที่หน้าสัญญา (ST00092) โดยไม่ได้ผูก PR ก่อน (ERP ต้องมีการจองขั้น PR
 * ก่อนถึงจะจองขั้นสัญญาได้) ใช้ตอนยกเลิกการจองคืนขั้น PR ให้ครบ
 */
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'pr_bg_reserve_money_id')
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD pr_bg_reserve_money_id BIGINT NULL;
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'pr_bg_reserve_money_id2')
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD pr_bg_reserve_money_id2 BIGINT NULL;
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'pr_bg_reserve_money_id3')
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD pr_bg_reserve_money_id3 BIGINT NULL;
GO

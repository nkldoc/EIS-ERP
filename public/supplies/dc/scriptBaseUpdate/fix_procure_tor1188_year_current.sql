-- procure: สัญญา จ.020090/2569 (tor_id 1188 / sp_tor_contract_id 1069) - IR20261000046 ขึ้น "No access rights. (i_year = 2026)"
-- user ขอให้ IR20261000046 (และ IR ถัดไปของสัญญานี้) ใช้เงินปีปัจจุบัน -> ตั้ง sp_tor.i_yyyy = 2027 (ปีงบ 2570) คง i_pr_year = 2026
-- (หน้าตรวจรับอ่านปีจองเงินจาก sp_tor.i_yyyy - เหมือนเคส tor_id 4062 เมื่อ 2026-11-12)
-- ผลต่อสัญญานี้: การจองขั้นตรวจรับ "ครั้งต่อไป" ทุกใบ (รวม IR20261000046, IR20261100023) จะจองปี 2570
--   การจองเดิมปี 2569 (PR/PO 498,000.00 และตรวจรับ 8 งวดเดือนละ 41,483.40) ไม่ถูกแก้ ยังอยู่ปี 2569 ตามเดิม
--   ยอดคงเหลือ PR/PO ปี 2569 ที่ค้าง ให้ฝ่ายงบตัดสินใจเรื่องปล่อย/ปิดแยกต่างหาก (สคริปต์นี้ไม่แตะ)
-- รันซ้ำได้ @apply = 0 = ดูตัวอย่างอย่างเดียว / 1 = แก้จริง (สำรองแถวเดิมไว้ที่ EIS_PROCURE.dbo.bak_sp_tor_1188_<วันที่>)
SET NOCOUNT ON; SET XACT_ABORT ON;
DECLARE @apply INT = 0;
DECLARE @torId INT = 1188, @newYear INT = 2027;

PRINT N'--- ก่อนแก้ ---';
SELECT tor_id, c_code, i_yyyy, i_pr_year, i_enabled FROM EIS_PROCURE.dbo.sp_tor WHERE tor_id = @torId;
PRINT N'--- การจองเงินปัจจุบันของสัญญานี้ (ไม่ถูกแก้) ---';
SELECT i_reserve, pr_id, po_id, chk_id, i_year, f_amt, i_enable
FROM NMU_EIS.dbo.bg_reserve_money WHERE i_sys = 3 AND pr_id = @torId AND i_enable = 1 ORDER BY i_reserve, chk_id;

IF NOT EXISTS (SELECT 1 FROM EIS_PROCURE.dbo.sp_tor WHERE tor_id = @torId AND i_enabled = 1)
BEGIN
    PRINT N'ไม่พบโครงการ tor_id นี้ - ยกเลิก';
    RETURN;
END

IF @apply = 1
BEGIN
    DECLARE @bak SYSNAME = N'bak_sp_tor_1188_' + CONVERT(VARCHAR(8), GETDATE(), 112) + '_' + REPLACE(CONVERT(VARCHAR(8), GETDATE(), 108), ':', '');
    DECLARE @sql NVARCHAR(MAX) = N'SELECT * INTO EIS_PROCURE.dbo.' + QUOTENAME(@bak) + N' FROM EIS_PROCURE.dbo.sp_tor WHERE tor_id = ' + CAST(@torId AS NVARCHAR(10));
    BEGIN TRAN;
    EXEC (@sql);
    UPDATE EIS_PROCURE.dbo.sp_tor SET i_yyyy = @newYear WHERE tor_id = @torId AND i_enabled = 1;
    COMMIT;
    PRINT N'สำรองไว้ที่ EIS_PROCURE.dbo.' + @bak;
    PRINT N'--- หลังแก้ ---';
    SELECT tor_id, c_code, i_yyyy, i_pr_year FROM EIS_PROCURE.dbo.sp_tor WHERE tor_id = @torId;
END

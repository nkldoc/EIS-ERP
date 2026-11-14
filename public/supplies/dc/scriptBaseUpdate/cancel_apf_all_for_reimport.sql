-- ยกเลิกสัญญา "เภสัช (APF)" ที่นำเข้าไว้ทั้งหมดบน dev เพื่อนำเข้าใหม่ (ให้ได้เลขใบกันเหลื่อมจากไฟล์ Excel) | soft delete ไม่ลบถาวร ไม่มี COMMIT
-- วิธีใช้: รันทั้งไฟล์ครั้งแรกโดย @do = 0 (ดูอย่างเดียว) ตรวจแล้วเปลี่ยนเป็น @do = 1 แล้วรันอีกรอบ
-- (เวอร์ชันไม่ใช้ BEGIN TRAN/COMMIT - แต่ละ UPDATE มีผลทันที ถ้าพังกลางทาง ให้รันซ้ำได้ ระบบจะทำส่วนที่เหลือต่อ)
-- ใช้ soft delete (i_enabled = 0 / i_enable = 2) เหมือนปุ่มยกเลิกในระบบ ไม่ลบแถวถาวร
-- วิธีใช้: 1) ใส่เลขสัญญาที่ @codes  2) รันทั้งไฟล์ครั้งแรกโดยให้ @do = 0 (ดูอย่างเดียว)
--          3) ตรวจรายการที่ขึ้น ถ้าถูกต้องแล้วเปลี่ยน @do = 1 แล้วรันอีกรอบ
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @do INT = 0;   -- 0 = ดูอย่างเดียว, 1 = ยกเลิกจริง
DECLARE @codes TABLE (c_contract_code NVARCHAR(100));
INSERT INTO @codes SELECT DISTINCT c_contract_code FROM NMU_ERP.dbo.sp_tor_period_bill WHERE i_enabled = 1 AND c_ap_dept_type = N'APF';   -- เภสัชทั้งหมด

-- ===== รายการที่จะถูกยกเลิก =====
IF OBJECT_ID('tempdb..#b') IS NOT NULL DROP TABLE #b;
SELECT b.sp_tor_period_bill_id, b.sp_tor_period_bill_hdr_id, b.sp_tor_period_bill_import_id, b.c_contract_code,
       CASE WHEN ISNULL(b.bg_reserve_money_id,0)>0 OR ISNULL(b.bg_reserve_money_id2,0)>0 OR ISNULL(b.bg_reserve_money_id3,0)>0 THEN 1 ELSE 0 END AS i_reserved
INTO #b
FROM NMU_ERP.dbo.sp_tor_period_bill b
WHERE b.i_enabled = 1
  AND b.c_contract_code COLLATE DATABASE_DEFAULT IN (SELECT c_contract_code COLLATE DATABASE_DEFAULT FROM @codes);

IF OBJECT_ID('tempdb..#r') IS NOT NULL DROP TABLE #r;
SELECT r.sp_tor_period_bill_receive_id, r.sp_tor_period_bill_id, r.c_ir_code, r.c_ap_code
INTO #r FROM NMU_ERP.dbo.sp_tor_period_bill_receive r
WHERE r.i_enabled = 1 AND r.sp_tor_period_bill_id IN (SELECT sp_tor_period_bill_id FROM #b);

IF OBJECT_ID('tempdb..#c') IS NOT NULL DROP TABLE #c;
SELECT c.sp_tor_period_bill_checking_id, c.c_ir_code, 100000 + c.sp_tor_period_bill_checking_id AS chk_id
INTO #c FROM NMU_ERP.dbo.sp_tor_period_bill_checking c
WHERE c.i_enabled = 1 AND c.c_ir_code IN (SELECT c_ir_code FROM #r WHERE c_ir_code IS NOT NULL);

IF OBJECT_ID('tempdb..#w') IS NOT NULL DROP TABLE #w;
SELECT h.po_working_hdr_id, h.c_code_ref, h.i_sub_status, bb.chk_id
INTO #w FROM NMU_EIS.dbo.po_working_hdr h
JOIN NMU_EIS.dbo.po_working_begin_hdr bb ON bb.po_working_hdr_id = h.po_working_hdr_id
WHERE h.i_enable = 1 AND bb.chk_id IN (SELECT chk_id FROM #c);

SELECT N'1 สัญญา/งวด' AS step, c_contract_code AS ref, sp_tor_period_bill_id AS id, i_reserved AS note FROM #b
UNION ALL SELECT N'2 รับของ/IR/AP', ISNULL(c_ap_code, c_ir_code), sp_tor_period_bill_receive_id, 0 FROM #r
UNION ALL SELECT N'3 ตรวจรับ', c_ir_code, sp_tor_period_bill_checking_id, 0 FROM #c
UNION ALL SELECT N'4 ใบเบิก EIS', c_code_ref, po_working_hdr_id, 0 FROM #w
ORDER BY 1;

-- ===== ตัวกันพลาด (ไม่ยกเลิกถ้าเข้าเงื่อนไข) =====
IF EXISTS (SELECT 1 FROM #b WHERE i_reserved = 1)
    SELECT N'!! มีสัญญาที่จองเงินแล้ว ต้องยกเลิกการจองที่หน้าสัญญาก่อน (SQL นี้ไม่ยกเลิกใบจอง)' AS warning, c_contract_code FROM #b WHERE i_reserved = 1;
IF EXISTS (SELECT 1 FROM #w WHERE i_sub_status NOT IN ('0.20','0.30'))
    SELECT N'!! ใบเบิกเดินสถานะต่อแล้ว (ไม่ใช่ร่าง/ส่ง) ห้ามยกเลิกด้วย SQL' AS warning, c_code_ref, i_sub_status FROM #w WHERE i_sub_status NOT IN ('0.20','0.30');

IF @do = 1
   AND NOT EXISTS (SELECT 1 FROM #b WHERE i_reserved = 1)
   AND NOT EXISTS (SELECT 1 FROM #w WHERE i_sub_status NOT IN ('0.20','0.30'))
BEGIN
    UPDATE NMU_EIS.dbo.po_working_hdr SET i_enable = 2, d_edit_acc = GETDATE()
        WHERE i_enable = 1 AND po_working_hdr_id IN (SELECT po_working_hdr_id FROM #w);
    UPDATE NMU_ERP.dbo.sp_tor_period_bill_checking SET i_enabled = 0
        WHERE i_enabled = 1 AND sp_tor_period_bill_checking_id IN (SELECT sp_tor_period_bill_checking_id FROM #c);
    -- ล้างเลขใบเบิกที่ค้างอยู่บนแถวตรวจรับ (ใบเบิกถูกยกเลิกแล้ว) ไม่งั้นถ้าเลข IR นี้ถูกใช้ซ้ำ หน้าตรวจรับจะโชว์ "ออกใบเบิกแล้ว" ของใบเบิกที่ยกเลิกไปแล้ว
    IF COL_LENGTH('NMU_ERP.dbo.sp_tor_period_bill_checking', 'c_code_ref') IS NOT NULL
        EXEC('UPDATE NMU_ERP.dbo.sp_tor_period_bill_checking SET c_code_ref = NULL, po_working_hdr_id = NULL
              WHERE sp_tor_period_bill_checking_id IN (SELECT sp_tor_period_bill_checking_id FROM #c)');
    UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive SET i_enabled = 0, d_update = GETDATE()
        WHERE i_enabled = 1 AND sp_tor_period_bill_receive_id IN (SELECT sp_tor_period_bill_receive_id FROM #r);
    UPDATE NMU_ERP.dbo.sp_tor_period_bill SET i_enabled = 0, d_update = GETDATE()
        WHERE i_enabled = 1 AND sp_tor_period_bill_id IN (SELECT sp_tor_period_bill_id FROM #b);
    -- ปิดชุดนำเข้าที่ไม่เหลือสัญญาใช้งาน
    UPDATE i SET i.i_enabled = 0
        FROM NMU_ERP.dbo.sp_tor_period_bill_import i
        WHERE i.i_enabled = 1
          AND i.sp_tor_period_bill_import_id IN (SELECT sp_tor_period_bill_import_id FROM #b)
          AND NOT EXISTS (SELECT 1 FROM NMU_ERP.dbo.sp_tor_period_bill x
                           WHERE x.sp_tor_period_bill_import_id = i.sp_tor_period_bill_import_id AND x.i_enabled = 1);
    SELECT N'ยกเลิกเรียบร้อย' AS result;
END
ELSE IF @do = 1
    SELECT N'ไม่ได้ยกเลิก เพราะติดตัวกันพลาดด้านบน' AS result;

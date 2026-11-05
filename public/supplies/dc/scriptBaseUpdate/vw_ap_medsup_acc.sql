-- วิวข้อมูลลงบัญชีของ AP เวชภัณฑ์/เภสัช (ST00096) สำหรับฝั่งบัญชี (อ่านอย่างเดียว) - ใช้คู่กับ vw_ap_medsup_hdr
-- 1 รายการบัญชี = 2 แถว (แถวเดบิต i_dr_cr=1 และแถวเครดิต i_dr_cr=2 ยอดเท่ากัน) ต่อ 1 เลขรับของ (IR) ที่ออกเลข AP แล้ว
--   (ถ้าใบเบิกมีหลายบัญชีเดบิต = 2 แถวต่อบัญชี)
--   เดบิต  = รายการบัญชีที่เลือกในใบเบิก EIS (po_working_begin_item.dc_acc_id) - ถ้ายังไม่ออกใบเบิก ใช้บัญชีตามรหัสค่าใช้จ่าย
--            (dc_bg_acc_hdr/dtl เหมือน vw_ap_type1_dtl ของ ST0013) ดู c_acc_dr_source
--   เครดิต = เจ้าหนี้ค่าสินค้าและบริการ (NMU_ERP.dbo.sp_acc_inv เหมือน vw_ap_type1_dtl ของ ST0013)
--   เงินที่ลงบัญชี = เงินตรวจรับ (ยอดขอเบิกรวม VAT) ของ IR นั้น
--   แหล่งเงินของใบตรวจรับ = แหล่งเงินของงวด (ถ้าไม่มีใช้แหล่งเงินที่ 1 ของสัญญา)
--   เจ้าของสัญญา = ฝ่าย/คณะ (dc_cost) ของสัญญา
-- ต้องมี vw_ap_medsup_hdr.sql และคอลัมน์ po_working_hdr_id ของ sp_tor_period_bill_checking ก่อน
-- รันซ้ำได้
USE NMU_EIS
GO
CREATE OR ALTER VIEW dbo.vw_ap_medsup_acc
AS
SELECT
    h.c_ap_code
    , h.c_ir_code
    , h.c_contract_code
    , h.i_period
    , h.c_ap_dept_type                                   -- APMS เวชภัณฑ์ / APMD เภสัช
    , h.d_ap_issue
    , h.d_checking
    , h.i_budget_year_use                                -- ใช้เงินปีงบประมาณ (พ.ศ.)
    , h.sp_tor_period_bill_receive_id                    -- pk ใบตรวจรับ
    , h.sp_tor_period_bill_checking_id                   -- pk รายละเอียดใบตรวจรับ
    , h.chk_id
    , h.po_working_hdr_id
    , h.c_code_withdraw                                  -- เลขใบเบิก EIS (D...)
    -- ผังบัญชี (แถวเดบิต = บัญชีค่าใช้จ่าย / แถวเครดิต = เจ้าหนี้ค่าสินค้าและบริการ)
    , sd.i_dr_cr                                         -- 1 = เดบิต / 2 = เครดิต
    , CASE sd.i_dr_cr WHEN 1 THEN NCHAR(3648)+NCHAR(3604)+NCHAR(3610)+NCHAR(3636)+NCHAR(3605) ELSE NCHAR(3648)+NCHAR(3588)+NCHAR(3619)+NCHAR(3604)+NCHAR(3636)+NCHAR(3605) END AS c_dr_cr   -- เดบิต / เครดิต (ใช้ NCHAR กันเพี้ยนเมื่อเปิดไฟล์ด้วยรหัสอักขระอื่น)
    , CASE sd.i_dr_cr WHEN 1 THEN dr.dc_acc_dr_id ELSE cr.dc_acc_cr_id END AS dc_acc_id
    , CASE sd.i_dr_cr WHEN 1 THEN accdr.c_code ELSE acccr.c_code END AS c_acc_code
    , CASE sd.i_dr_cr WHEN 1 THEN accdr.c_name ELSE acccr.c_name END AS c_acc_name
    , dr.c_acc_dr_source                                 -- WITHDRAW = บัญชีเดบิตจากใบเบิก EIS / EXPENSE_MAP = ตามรหัสค่าใช้จ่าย (ยังไม่ออกใบเบิก)
    -- เงินที่ลงบัญชี = เงินตรวจรับ (ยอดเดบิต = ยอดเครดิต)
    , CASE sd.i_dr_cr WHEN 1 THEN dr.f_acc_amt ELSE 0 END AS f_debit
    , CASE sd.i_dr_cr WHEN 2 THEN dr.f_acc_amt ELSE 0 END AS f_credit
    , dr.f_acc_amt
    , h.f_before_vat
    , h.f_vat_amt
    , h.f_request_amt
    , h.f_wht_amt
    , h.f_pay_amt
    -- แหล่งเงินของใบตรวจรับ
    , src.dc_expense_budget_type_id
    , ebt.c_name AS c_fund_source
    -- เจ้าของสัญญา (ฝ่าย/คณะ)
    , h.dc_cost_id
    , cst.c_name AS c_cost_name
    , cst.dc_cost_acc_id
    , cstacc.c_name AS c_cost_acc_name
FROM dbo.vw_ap_medsup_hdr h
OUTER APPLY (SELECT TOP 1 isnull(nullif(g.dc_expense_budget_type_id_dtl, 0), g.dc_expense_budget_type_id) AS dc_expense_budget_type_id
             FROM NMU_ERP.dbo.sp_tor_period_bill_receive r
             INNER JOIN NMU_ERP.dbo.sp_tor_period_bill g ON g.sp_tor_period_bill_id = r.sp_tor_period_bill_id
             WHERE r.c_ir_code = h.c_ir_code AND r.i_enabled = 1) src
OUTER APPLY (SELECT TOP 1 a.dc_acc_id AS dc_acc_cr_id FROM NMU_ERP.dbo.sp_acc_inv a) cr
OUTER APPLY (
    -- เดบิตจากใบเบิก EIS (รวมยอดต่อบัญชี)
    SELECT bi.dc_acc_id AS dc_acc_dr_id, 'WITHDRAW' AS c_acc_dr_source, SUM(isnull(bi.f_inv_vat, 0)) AS f_acc_amt
    FROM dbo.po_working_begin_hdr bh
    INNER JOIN dbo.po_working_begin_item bi ON bi.po_working_begin_hdr_id = bh.po_working_begin_hdr_id
    WHERE bh.po_working_hdr_id = h.po_working_hdr_id AND bh.i_enable = 1
    GROUP BY bi.dc_acc_id
    UNION ALL
    -- ยังไม่ออกใบเบิก: บัญชีตามรหัสค่าใช้จ่าย ยอด = เงินตรวจรับ
    SELECT TOP 1 cc.dc_acc_id, 'EXPENSE_MAP', h.f_request_amt
    FROM NMU_ERP.dbo.sp_tor_period_bill_receive r2
    INNER JOIN NMU_ERP.dbo.sp_tor_period_bill g2 ON g2.sp_tor_period_bill_id = r2.sp_tor_period_bill_id
    INNER JOIN NMU_DATACENTER.dbo.dc_bg_acc_hdr aa ON aa.bg_expense_id = g2.po_expense_id AND aa.i_enable = 1
    INNER JOIN NMU_DATACENTER.dbo.dc_bg_acc_dtl bb ON bb.dc_bg_acc_hdr_id = aa.dc_bg_acc_hdr_id
    INNER JOIN NMU_DATACENTER.dbo.dc_acc cc ON cc.dc_acc_id = bb.dc_acc_id AND cc.i_enable = 1 AND cc.i_last = 1 AND cc.i_group IN (1, 5)
    WHERE r2.c_ir_code = h.c_ir_code AND r2.i_enabled = 1
      AND NOT EXISTS (SELECT 1 FROM dbo.po_working_begin_hdr bh2
                      INNER JOIN dbo.po_working_begin_item bi2 ON bi2.po_working_begin_hdr_id = bh2.po_working_begin_hdr_id
                      WHERE bh2.po_working_hdr_id = h.po_working_hdr_id AND bh2.i_enable = 1)
) dr
CROSS JOIN (VALUES (1), (2)) sd(i_dr_cr)
LEFT JOIN NMU_DATACENTER.dbo.dc_acc accdr ON accdr.dc_acc_id = dr.dc_acc_dr_id
LEFT JOIN NMU_DATACENTER.dbo.dc_acc acccr ON acccr.dc_acc_id = cr.dc_acc_cr_id
LEFT JOIN NMU_DATACENTER.dbo.dc_expense_budget_type ebt ON ebt.dc_expense_budget_type_id = src.dc_expense_budget_type_id
LEFT JOIN NMU_DATACENTER.dbo.dc_cost cst ON cst.dc_cost_id = h.dc_cost_id
LEFT JOIN NMU_DATACENTER.dbo.dc_cost cstacc ON cstacc.dc_cost_id = cst.dc_cost_acc_id
GO

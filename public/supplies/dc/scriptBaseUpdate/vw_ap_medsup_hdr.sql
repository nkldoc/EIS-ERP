-- วิวรายการ AP ของ เวชภัณฑ์/เภสัช (ST00096) สำหรับให้ฝั่งบัญชีค้นหา/ดูข้อมูล (อ่านอย่างเดียว)
-- เหตุผล: vw_ap_v2_hdr / vw_ap_v2_hdr_nmu_for_view อ่านจาก sp_check_period_hdr (ST0013) เท่านั้น ไม่มีรายการเวชภัณฑ์
-- วิวนี้แยกต่างหาก ไม่แตะวิวเดิม จึงไม่กระทบหน้าบัญชีที่ใช้งานอยู่ (ส่งลง GX/GL, ยกเลิก GX/GL ฯลฯ)
-- 1 แถว = 1 เลขรับของ (IR) ที่ออกเลข AP แล้ว (AP 1 เลขอาจครอบหลาย IR) - ใช้ chk_id = 100000 + sp_tor_period_bill_checking_id
-- ให้ตรงกับที่ใช้ในใบเบิก EIS (MEDSUP_CHK_OFFSET)
-- ต้องมีคอลัมน์ po_working_hdr_id/c_code_ref ของ sp_tor_period_bill_checking (sp_tor_period_bill_checking_withdraw.sql) ก่อน
-- รันซ้ำได้
USE NMU_EIS
GO
CREATE OR ALTER VIEW dbo.vw_ap_medsup_hdr
AS
SELECT
    r.c_ap_code
    , r.c_ir_code
    , MAX(g.c_contract_code) AS c_contract_code
    , MAX(g.i_period) AS i_period
    , MAX(g.c_ap_dept_type) AS c_ap_dept_type            -- APMS เวชภัณฑ์ / APMD เภสัช
    , MAX(g.dc_cost_id) AS dc_cost_id
    , MAX(g.dc_creditor_id) AS dc_creditor_id
    , MAX(g.c_creditor_name) AS c_creditor_name
    , MAX(g.c_project_name) AS c_project_name
    , MAX(g.c_expense_name) AS c_expense_name
    , MAX(g.dc_expense_budget_type_id) AS dc_expense_budget_type_id
    , MAX(g.i_budget_year) AS i_budget_year
    , SUM(r.f_amt) AS f_ir_amt
    , MAX(r.d_ir_issue) AS d_ir_issue
    , MAX(r.d_ap_issue) AS d_ap_issue
    , MIN(r.sp_tor_period_bill_receive_id) AS sp_tor_period_bill_receive_id    -- pk ใบตรวจรับ (แถวรับของที่ถือเลข AP/IR ถ้า IR มีหลายแถวรับของใช้ค่าต่ำสุด)
    , MAX(chk.sp_tor_period_bill_checking_id) AS sp_tor_period_bill_checking_id -- pk รายละเอียดใบตรวจรับ
    , 100000 + MAX(chk.sp_tor_period_bill_checking_id) AS chk_id
    , MAX(chk.d_checking) AS d_checking
    , MAX(chk.i_budget_year_use) AS i_budget_year_use      -- ใช้เงินปีงบประมาณ (พ.ศ.)
    , MAX(chk.i_budget_year_ref) AS i_budget_year_ref
    , MAX(chk.c_overlap_no) AS c_overlap_no
    , MAX(chk.c_egp_no) AS c_egp_no
    , MAX(chk.f_before_vat) AS f_before_vat
    , MAX(chk.f_vat_amt) AS f_vat_amt
    , MAX(chk.f_request_amt) AS f_request_amt
    , MAX(chk.f_wht_amt) AS f_wht_amt
    , MAX(chk.f_pay_amt) AS f_pay_amt
    , MAX(chk.po_working_hdr_id) AS po_working_hdr_id
    , MAX(chk.c_code_ref) AS c_code_withdraw               -- เลขใบเบิก EIS (D...)
    , MAX(h.i_status_last) AS i_status_last
    , MAX(d.c_code_debt) AS c_code_debt                    -- เลขตั้งหนี้ใน EIS (= เลข AP)
    , MAX(bh.c_heading) AS c_heading                       -- เรื่อง/โครงการที่กรอกในใบเบิก EIS
FROM NMU_ERP.dbo.sp_tor_period_bill_receive r
INNER JOIN NMU_ERP.dbo.sp_tor_period_bill g ON g.sp_tor_period_bill_id = r.sp_tor_period_bill_id
LEFT JOIN NMU_ERP.dbo.sp_tor_period_bill_checking chk ON chk.c_ir_code = r.c_ir_code AND chk.i_enabled = 1
LEFT JOIN dbo.po_working_hdr h ON h.po_working_hdr_id = chk.po_working_hdr_id
LEFT JOIN dbo.po_working_dtl d ON d.po_working_hdr_id = h.po_working_hdr_id
LEFT JOIN dbo.po_working_begin_hdr bh ON bh.po_working_hdr_id = h.po_working_hdr_id AND bh.i_enable = 1
WHERE r.i_enabled = 1 AND r.c_ap_code IS NOT NULL
GROUP BY r.c_ap_code, r.c_ir_code
GO

-- วิวรายการ AP ของ เวชภัณฑ์/เภสัช (ST00096) สำหรับให้ฝั่งบัญชีค้นหา/ดูข้อมูล (อ่านอย่างเดียว)
-- เหตุผล: vw_ap_v2_hdr / vw_ap_v2_hdr_nmu_for_view อ่านจาก sp_check_period_hdr (ST0013) เท่านั้น ไม่มีรายการเวชภัณฑ์
-- วิวนี้แยกต่างหาก ไม่แตะวิวเดิม จึงไม่กระทบหน้าบัญชีที่ใช้งานอยู่ (ส่งลง GX/GL, ยกเลิก GX/GL ฯลฯ)
-- 1 แถว = 1 เลขรับของ (IR) ที่ออกเลข AP แล้ว (AP 1 เลขอาจครอบหลาย IR) - ใช้ chk_id = 100000 + sp_tor_period_bill_checking_id
-- ให้ตรงกับที่ใช้ในใบเบิก EIS (MEDSUP_CHK_OFFSET)
-- คอลัมน์ชุดท้าย (ตั้งแต่ system_type) ใช้ชื่อเดียวกับ vw_ap_type0_hdr เพื่อให้ฝั่งบัญชีดึงด้วยโค้ดชุดเดียวกันได้
--   ฟิลด์ที่เวชภัณฑ์/เภสัชไม่มีข้อมูล (ยังไม่ส่งลง GX/GL, ไม่มีตรวจ error ของผังบัญชี ฯลฯ) ใส่ 0 หรือ NULL
--   ผังบัญชีเดบิต/เครดิตดูที่ vw_ap_medsup_acc (c_acc_id_dr/c_acc_id_cr ในวิวนี้เป็น NULL เพื่อไม่ให้วิวอ้างอิงวนกัน)
--   system_type = 2 (type0: 1 = พัสดุ NMU_ERP, 3 = EIS_PROCURE)
--   sp_check_period_hdr_id = 200000000 + sp_tor_period_bill_receive_id (ไม่ชนกับ id ของพัสดุ)
-- ต้องมีคอลัมน์ po_working_hdr_id/c_code_ref ของ sp_tor_period_bill_checking (sp_tor_period_bill_checking_withdraw.sql) ก่อน
-- รันซ้ำได้
USE NMU_EIS
GO
CREATE OR ALTER VIEW dbo.vw_ap_medsup_hdr
AS
SELECT
    b.c_ap_code
    , b.c_ir_code
    , b.c_contract_code
    , b.i_period
    , b.c_ap_dept_type
    , b.dc_cost_id
    , b.dc_creditor_id
    , b.c_creditor_name
    , b.c_project_name
    , b.c_expense_name
    , b.dc_expense_budget_type_id
    , b.i_budget_year
    , b.f_ir_amt
    , b.d_ir_issue
    , b.d_ap_issue
    , b.sp_tor_period_bill_receive_id                    -- pk ใบตรวจรับ (แถวรับของที่ถือเลข AP/IR ถ้า IR มีหลายแถวรับของใช้ค่าต่ำสุด)
    , b.sp_tor_period_bill_checking_id                   -- pk รายละเอียดใบตรวจรับ
    , b.chk_id
    , b.d_checking
    , b.i_budget_year_use                                -- ใช้เงินปีงบประมาณ (พ.ศ.)
    , b.i_budget_year_ref
    , b.c_overlap_no
    , b.c_egp_no
    , b.f_before_vat
    , b.f_vat_amt
    , b.f_request_amt
    , b.f_wht_amt
    , b.f_pay_amt
    , b.po_working_hdr_id
    , b.c_code_withdraw                                  -- เลขใบเบิก EIS (D...)
    , b.i_status_last
    , b.c_code_debt                                      -- เลขตั้งหนี้ใน EIS (= เลข AP)
    , b.c_heading                                        -- เรื่อง/โครงการที่กรอกในใบเบิก EIS
    -- ===== ชื่อฟิลด์ให้เหมือน vw_ap_type0_hdr =====
    , CAST(2 AS int) AS system_type
    , CAST(0 AS int) AS i_is_monthly
    , CAST(0 AS int) AS sub_system_type
    , CAST(b.f_request_amt AS decimal(18, 2)) AS f_net_total_price      -- เงินตรวจรับ (ยอดขอเบิกรวม VAT) = ยอดที่ลงบัญชี
    , CAST(b.c_contract_code AS varchar(100)) AS c_contract
    , CAST(200000000 + b.sp_tor_period_bill_receive_id AS bigint) AS sp_check_period_hdr_id
    , CAST(b.sp_tor_period_bill_id AS bigint) AS sp_tor_hdr_period_id    -- งวด (sp_tor_period_bill)
    , CAST(0 AS bigint) AS sp_tor_contract_id                            -- เวชภัณฑ์ไม่มี id สัญญา ใช้ c_contract
    , CAST(b.c_ap_code AS varchar(50)) AS c_code
    , CAST(b.c_ir_code AS varchar(50)) AS c_arrive_code
    , CAST(b.c_ap_code AS varchar(50)) AS c_checking_code
    , CAST(b.d_checking AS datetime) AS d_checking_date
    , CAST(NULL AS int) AS i_is_last
    , cst.dc_cost_acc_id
    , CAST(cstacc.c_name AS varchar(255)) AS c_acc_name
    , CAST(cst.c_sub AS varchar(2)) AS c_sub
    , CAST(cst.c_name AS varchar(255)) AS cost_name
    , CAST(b.po_expense_id AS bigint) AS po_expense_id
    , CAST(b.c_expense_name AS varchar(255)) AS c_expense
    , CAST(b.dc_expense_budget_type_id AS bigint) AS dc_bg_budget_type_id
    , CAST(ebt.c_name AS varchar(255)) AS c_bg_budget
    , CAST(b.c_project_name AS varchar(2000)) AS c_name
    , CAST(b.c_creditor_name AS varchar(250)) AS c_creditor
    , CAST(NULL AS int) AS i_purchase
    , CAST(NULL AS varchar(4)) AS c_purchase
    , CAST(b.c_code_withdraw AS varchar(50)) AS po_code
    , CAST(NULL AS varchar(100)) AS c_code_tor
    , CAST(0 AS int) AS check_pdf
    , b.d_audit_date
    , CAST(b.c_code_pv AS varchar(50)) AS c_code_pv
    , b.i_pdf_dtl_outside
    , CAST(b.i_sub_status AS varchar(5)) AS i_sub_status
    , CAST(NULL AS varchar(150)) AS dc_user_create
    , CAST(NULL AS nvarchar(max)) AS c_acc_id_dr
    , CAST(NULL AS nvarchar(max)) AS c_acc_id_cr
    , CAST(0 AS int) AS i_err_type1_dr
    , CAST(0 AS int) AS i_err_type1_cr
    , CAST(0 AS int) AS i_err_type2
    , CAST(0 AS int) AS i_err_type3
    , CAST(0 AS int) AS i_err_type4
    , CAST(0 AS int) AS i_err_type5_dr
    , CAST(0 AS int) AS i_err_type5_cr
    , CAST(0 AS bigint) AS dc_map_send_ap_id
    , CAST(1 AS tinyint) AS i_send_jv
    , CAST(NULL AS varchar(255)) AS c_send_jv
    , CAST(0 AS bigint) AS gl_tran_hdr_id_no1
    , CAST(ebt.c_name AS varchar(255)) AS c_expense_budget_type
    , CAST(0 AS int) AS i_is_fm
    , CAST(0 AS bigint) AS dc_map_send_ap_id_reverse
    , CAST(0 AS bigint) AS dc_map_send_ap_id_reverse2
    , CAST(0 AS bigint) AS dc_map_send_ap_id_reverse3
    , CAST(0 AS bigint) AS dc_map_send_ap_id_reverse4
    , CAST(0 AS bigint) AS dc_map_send_ap_id_reverse5
    , CAST(0 AS bigint) AS gl_tran_hdr_id_no2
    , CAST(0 AS bigint) AS gl_tran_hdr_id_no3
    , CAST(0 AS bigint) AS gl_tran_hdr_id_no4
    , CAST(0 AS bigint) AS gl_tran_hdr_id_no5
    , CAST(0 AS bigint) AS gl_tran_hdr_id_reverse_no1
    , CAST(0 AS bigint) AS gl_tran_hdr_id_reverse_no2
    , CAST(0 AS bigint) AS gl_tran_hdr_id_reverse_no3
    , CAST(0 AS int) AS i_is_product_last
    , CAST(0 AS bigint) AS dc_cost_id_fm
    , CAST(b.d_ap_issue AS datetime) AS d_gen_date_ap
    , CAST(CASE WHEN MONTH(b.d_checking) > 9 THEN YEAR(b.d_checking) + 1 ELSE YEAR(b.d_checking) END AS int) AS c_bg_year_ap
    , b.d_docss_at_pv
    , CAST(CASE WHEN MONTH(b.d_docss_at_pv) > 9 THEN YEAR(b.d_docss_at_pv) + 1 ELSE YEAR(b.d_docss_at_pv) END AS int) AS c_bg_year_pv
FROM (
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
        , MAX(g.sp_tor_period_bill_id) AS sp_tor_period_bill_id
        , MAX(g.po_expense_id) AS po_expense_id
        , SUM(r.f_amt) AS f_ir_amt
        , MAX(r.d_ir_issue) AS d_ir_issue
        , MAX(r.d_ap_issue) AS d_ap_issue
        , MIN(r.sp_tor_period_bill_receive_id) AS sp_tor_period_bill_receive_id
        , MAX(chk.sp_tor_period_bill_checking_id) AS sp_tor_period_bill_checking_id
        , 100000 + MAX(chk.sp_tor_period_bill_checking_id) AS chk_id
        , MAX(chk.d_checking) AS d_checking
        , MAX(chk.i_budget_year_use) AS i_budget_year_use
        , MAX(chk.i_budget_year_ref) AS i_budget_year_ref
        , MAX(chk.c_overlap_no) AS c_overlap_no
        , MAX(chk.c_egp_no) AS c_egp_no
        , MAX(chk.f_before_vat) AS f_before_vat
        , MAX(chk.f_vat_amt) AS f_vat_amt
        , MAX(chk.f_request_amt) AS f_request_amt
        , MAX(chk.f_wht_amt) AS f_wht_amt
        , MAX(chk.f_pay_amt) AS f_pay_amt
        , MAX(chk.po_working_hdr_id) AS po_working_hdr_id
        , MAX(chk.c_code_ref) AS c_code_withdraw
        , MAX(h.i_status_last) AS i_status_last
        , MAX(h.i_sub_status) AS i_sub_status
        , MAX(d.c_code_debt) AS c_code_debt
        , MAX(d.d_audit_date) AS d_audit_date
        , MAX(d.c_code_pv) AS c_code_pv
        , MAX(d.i_pdf_dtl_outside) AS i_pdf_dtl_outside
        , MAX(bh.c_heading) AS c_heading
        , MAX(wi.d_doc_date) AS d_docss_at_pv                -- วันที่เอกสารตอนอยู่ขั้น PV (11.00)
    FROM NMU_ERP.dbo.sp_tor_period_bill_receive r
    INNER JOIN NMU_ERP.dbo.sp_tor_period_bill g ON g.sp_tor_period_bill_id = r.sp_tor_period_bill_id
    LEFT JOIN NMU_ERP.dbo.sp_tor_period_bill_checking chk ON chk.c_ir_code = r.c_ir_code AND chk.i_enabled = 1
    LEFT JOIN dbo.po_working_hdr h ON h.po_working_hdr_id = chk.po_working_hdr_id
    LEFT JOIN dbo.po_working_dtl d ON d.po_working_hdr_id = h.po_working_hdr_id
    LEFT JOIN dbo.po_working_begin_hdr bh ON bh.po_working_hdr_id = h.po_working_hdr_id AND bh.i_enable = 1
    LEFT JOIN dbo.po_working_item wi ON wi.po_working_hdr_id = h.po_working_hdr_id AND wi.i_sub_status = '11.00' AND wi.i_enable = 1
    WHERE r.i_enabled = 1 AND r.c_ap_code IS NOT NULL
    GROUP BY r.c_ap_code, r.c_ir_code
) b
LEFT JOIN NMU_DATACENTER.dbo.dc_cost cst ON cst.dc_cost_id = b.dc_cost_id
LEFT JOIN NMU_DATACENTER.dbo.dc_cost cstacc ON cstacc.dc_cost_id = cst.dc_cost_acc_id
LEFT JOIN NMU_DATACENTER.dbo.dc_expense_budget_type ebt ON ebt.dc_expense_budget_type_id = b.dc_expense_budget_type_id
GO

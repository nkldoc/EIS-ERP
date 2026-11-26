-- ตรวจว่า IR ของ procure ออกเลข AP ไม่ได้เพราะ "เงินงบประมาณไม่เพียงพอ" (อ่านอย่างเดียว ไม่แก้ข้อมูล) รันบน server
-- เปลี่ยน @ir เป็นเลข IR ที่ติด  ผลมี 3 ชุด: (1) ข้อมูล IR (2) สัญญา/PR ที่ IR อ้างถึง (3) แถวจองเงินที่เกี่ยวข้อง
SET NOCOUNT ON;
DECLARE @ir VARCHAR(30) = 'IR20261000046';

PRINT N'--- (1) IR ---';
SELECT h.sp_check_period_hdr_id, h.c_arrive_code, h.ap_code, h.c_code_debt, h.i_enabled, h.i_yyyy,
       h.f_total, h.f_vat_amt, h.f_inv_vat, h.f_pay, h.i_reserve_pay, h.i_is_noap_id,
       h.c_overlap, h.i_overlap, h.bg_reserve_overlap_id, h.i_yyyy_overlap, h.bg_reserve_money_id, h.bg_checking_money_id,
       h.sp_tor_contract_id, h.sp_tor_hdr_period_id
FROM EIS_PROCURE.dbo.sp_check_period_hdr h WHERE h.c_arrive_code = @ir;

PRINT N'--- (2) สัญญา / PR ---';
SELECT c.sp_tor_contract_id, c.c_code AS contract_code, c.dc_cost_id AS cost_contract,
       t.tor_id, t.c_code AS pr_code, t.i_yyyy AS pr_year, t.dc_cost_id AS cost_pr, t.dc_cost2_id AS cost2_pr,
       t.dc_expense_budget_type_id AS budget_type_id, t.po_expense_id AS expense_id, t.i_type_bg, t.i_pr_type2,
       t.bg_reserve_money1_id, t.bg_reserve_money2_id, t.bg_reserve_money3_id
FROM EIS_PROCURE.dbo.sp_check_period_hdr h
JOIN EIS_PROCURE.dbo.sp_tor_contract c ON c.sp_tor_contract_id = h.sp_tor_contract_id
JOIN EIS_PROCURE.dbo.sp_tor t ON t.tor_id = c.sp_tor_id
WHERE h.c_arrive_code = @ir;

PRINT N'--- (3) แถวจองเงิน (bg_reserve_money) ที่ IR / PR อ้างถึง ---';
SELECT r.bg_reserve_money_id, r.i_year, r.dc_cost_id, r.dc_budget_type_id, r.bg_expense_id, r.f_amt, r.i_enable, r.i_finish, r.i_last, r.d_create
FROM NMU_EIS.dbo.bg_reserve_money r
WHERE r.bg_reserve_money_id IN (
    SELECT x.v FROM (
        SELECT h.bg_reserve_money_id AS v FROM EIS_PROCURE.dbo.sp_check_period_hdr h WHERE h.c_arrive_code = @ir
        UNION SELECT h.bg_checking_money_id FROM EIS_PROCURE.dbo.sp_check_period_hdr h WHERE h.c_arrive_code = @ir
        UNION SELECT t.bg_reserve_money1_id FROM EIS_PROCURE.dbo.sp_check_period_hdr h
              JOIN EIS_PROCURE.dbo.sp_tor_contract c ON c.sp_tor_contract_id = h.sp_tor_contract_id
              JOIN EIS_PROCURE.dbo.sp_tor t ON t.tor_id = c.sp_tor_id WHERE h.c_arrive_code = @ir
        UNION SELECT t.bg_reserve_money2_id FROM EIS_PROCURE.dbo.sp_check_period_hdr h
              JOIN EIS_PROCURE.dbo.sp_tor_contract c ON c.sp_tor_contract_id = h.sp_tor_contract_id
              JOIN EIS_PROCURE.dbo.sp_tor t ON t.tor_id = c.sp_tor_id WHERE h.c_arrive_code = @ir
    ) x WHERE x.v IS NOT NULL AND x.v > 0);

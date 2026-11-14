-- เภสัช (APF) เจ้าของสัญญา dc_cost_id 82 -> 50 (แถวที่นำเข้าไว้แล้ว) | ไม่มี COMMIT
SELECT COUNT(*) AS n_will_update FROM NMU_ERP.dbo.sp_tor_period_bill WHERE c_ap_dept_type = N'APF' AND dc_cost_id = 82;
-- UPDATE NMU_ERP.dbo.sp_tor_period_bill SET dc_cost_id = 50 WHERE c_ap_dept_type = N'APF' AND dc_cost_id = 82;

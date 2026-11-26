<?php
// Read-only: compare expense IDs across overlap budgets, reservations, and inspections.
error_reporting(E_ERROR);
$_SERVER['SERVER_NAME']='localhost';
require 'C:/xampp/htdocs/api-nmu/conf/config.php';
$conn=@sqlsrv_connect(DB_SERVER,array('Database'=>'NMU_EIS','UID'=>DB_USER,'PWD'=>DB_PASS,'CharacterSet'=>'UTF-8','LoginTimeout'=>5));
if (!$conn) { echo "Local budget database unavailable\n"; exit(2); }
$code=$argv[1] ?? '68-200-03-2-0014';
$queries=array(
 'header'=>array('SELECT bg_overlap_hdr_id,c_code FROM dbo.bg_overlap_hdr WHERE c_code=?',array($code)),
 'details'=>array('SELECT d.bg_overlap_hdr_id,d.bg_expense_id FROM dbo.bg_overlap_dtl d INNER JOIN dbo.bg_overlap_hdr h ON h.bg_overlap_hdr_id=d.bg_overlap_hdr_id WHERE h.c_code=?',array($code)),
 'view'=>array('SELECT c_code_ref,bg_expense_id,f_total,d_end_date FROM dbo.vw_bg_budget_overlap WHERE c_code_ref=?',array($code)),
 'target_ir'=>array('SELECT DISTINCT h.sp_check_period_hdr_id,h.c_arrive_code,h.c_code,h.c_overlap,h.f_total,h.i_yyyy_overlap,t.po_expense_id AS pr_expense_id,d.po_expense_id AS checking_expense_id FROM NMU_ERP.dbo.sp_check_period_hdr h LEFT JOIN NMU_ERP.dbo.sp_tor_contract c ON c.sp_tor_contract_id=h.sp_tor_contract_id LEFT JOIN NMU_ERP.dbo.sp_tor t ON t.tor_id=c.sp_tor_id LEFT JOIN NMU_ERP.dbo.sp_check_period_dtl d ON d.sp_check_period_hdr_id=h.sp_check_period_hdr_id WHERE h.c_arrive_code=?',array($argv[2] ?? 'IR20261100147')),
 'reserves'=>array('SELECT i_enable,i_reserve,i_finish,i_year,bg_expense_id,pr_id,po_id,chk_id,SUM(f_amt) AS amount FROM dbo.bg_reserve_overlap WHERE c_code_overlap=? GROUP BY i_enable,i_reserve,i_finish,i_year,bg_expense_id,pr_id,po_id,chk_id',array($code)),
 'expense'=>array('SELECT bg_expense_id,c_code,c_name FROM dbo.bg_expense WHERE bg_expense_id IN (SELECT bg_expense_id FROM dbo.vw_bg_budget_overlap WHERE c_code_ref=?)',array($code)),
 'checking'=>array('SELECT DISTINCT h.sp_check_period_hdr_id,h.c_code,h.c_arrive_code,h.c_overlap,h.f_total,t.po_expense_id AS pr_expense_id,d.po_expense_id AS checking_expense_id FROM NMU_ERP.dbo.sp_check_period_hdr h LEFT JOIN NMU_ERP.dbo.sp_tor_contract c ON c.sp_tor_contract_id=h.sp_tor_contract_id LEFT JOIN NMU_ERP.dbo.sp_tor t ON t.tor_id=c.sp_tor_id LEFT JOIN NMU_ERP.dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id LEFT JOIN NMU_ERP.dbo.sp_check_period_dtl d ON d.sp_check_period_hdr_id=h.sp_check_period_hdr_id WHERE ? IN (h.c_overlap,c.c_overlap,c.c_overlap2,t.c_overlap,p.c_overlap) OR h.sp_check_period_hdr_id IN (SELECT chk_id FROM dbo.bg_reserve_overlap WHERE c_code_overlap=?)',array($code,$code)),
 'contract'=>array('SELECT c.sp_tor_contract_id,c.c_code,c.c_overlap,c.c_overlap2,t.tor_id,t.po_expense_id FROM NMU_ERP.dbo.sp_tor_contract c LEFT JOIN NMU_ERP.dbo.sp_tor t ON t.tor_id=c.sp_tor_id WHERE ? IN (c.c_overlap,c.c_overlap2,t.c_overlap)',array($code))
);
foreach ($queries as $name=>$query) {
 $stmt=@sqlsrv_query($conn,$query[0],$query[1],array('QueryTimeout'=>10));
 if (!$stmt) { echo "$name: query unavailable\n"; foreach(sqlsrv_errors() ?: array() as $error) echo $error['message']."\n"; continue; }
 $data=array(); while ($row=sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC)) $data[]=$row;
 echo $name.': '.json_encode($data,JSON_UNESCAPED_UNICODE)."\n";
}

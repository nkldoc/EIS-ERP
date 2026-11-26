<?php
// Read-only local diagnostic. No writes and no credentials in output.
error_reporting(E_ERROR);
$_SERVER['SERVER_NAME']='localhost';
require 'C:/xampp/htdocs/api-nmu/conf/config.php';
$conn=@sqlsrv_connect(DB_SERVER,array('Database'=>'NMU_EIS','UID'=>DB_USER,'PWD'=>DB_PASS,'CharacterSet'=>'UTF-8','LoginTimeout'=>5));
if (!$conn) { echo "Local budget database unavailable\n"; exit(2); }
$queries=array(
 'budget'=>array('SELECT c_code_ref,f_total,bg_expense_id FROM vw_bg_budget_overlap WHERE c_code_ref=?',array('68-105-03-1-1748')),
 'reserves'=>array('SELECT i_reserve,i_finish,i_year,bg_expense_id,pr_id,po_id,SUM(f_amt) AS amount FROM vw_bg_reserve_overlap WHERE c_code_overlap=? GROUP BY i_reserve,i_finish,i_year,bg_expense_id,pr_id,po_id',array('68-105-03-1-1748')),
 'checking'=>array('SELECT sp_check_period_hdr_id,parent_id,c_code,c_arrive_code,f_total,sp_tor_contract_id,i_yyyy,i_yyyy_overlap FROM NMU_ERP.dbo.sp_check_period_hdr WHERE c_arrive_code=?',array('IR20261100147')),
 'api_balance'=>array("SELECT (SELECT TOP 1 f_total FROM vw_bg_budget_overlap WHERE c_code_ref=?) - ISNULL((SELECT SUM(f_amt) FROM vw_bg_reserve_overlap WHERE i_reserve=3 AND c_code_overlap=? AND bg_expense_id=970),0) AS available_in_local_api_formula",array('68-105-03-1-1748','68-105-03-1-1748'))
);
foreach ($queries as $name=>$query) {
 $stmt=@sqlsrv_query($conn,$query[0],$query[1],array('QueryTimeout'=>10));
 if (!$stmt) { echo "$name: query unavailable\n"; continue; }
 $data=array(); while ($row=sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC)) $data[]=$row;
 echo $name.': '.json_encode($data,JSON_UNESCAPED_UNICODE)."\n";
}

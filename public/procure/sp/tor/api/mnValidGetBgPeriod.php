<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
//print_r($_REQUEST); 
//exit();    
switch ($mode) {
    case "SUM_BG_TYPE_PERIOD":
        $sp_tor_contract_id = $_REQUEST['sp_tor_contract_id'] ?? null;
        $dc_expense_budget_type_id = $_REQUEST['dc_expense_budget_type_id'] ?? null;
        $f_dtl1_amt = $db->GetDataBySQL("select sum(f_total_amt) from dbo.sp_tor_hdr_period where sp_tor_contract_id = ? and dc_expense_budget_type_id = ?", array($sp_tor_contract_id, $dc_expense_budget_type_id));
        $re = array("reval" => 0, "success" => "Success", "msg" => "ตรวจสอบข้อมูลซ้ำ", "f_dtl_amt" => $f_dtl1_amt);
    break;
    
} 
echo json_encode($re);
exit;

<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
    
switch ($mode) {
    case "doc_ref_pr":
        /*mode: doc_ref_pr
txt: พวช.08/294
dc_cost2_id: 42
f_net_total_amt: 998750*/
        $txt = $_REQUEST['txt'] ?? null; 
        $dc_cost2_id= $_REQUEST['dc_cost2_id'] ?? null; 
        $f_total_amt = $_REQUEST['f_net_total_amt'] ?? null; 
        $i_year = $_REQUEST['i_year'] ?? null; 
        $c_code= $db->GetDataBySQL("select top 1 c_code from dbo.sp_tor where i_yyyy = {$i_year}  and TRIM(d_doc_ref)=?", array($txt));
        $count= $db->GetDataBySQL("select count(*) from dbo.sp_tor where i_yyyy = {$i_year}  and TRIM(d_doc_ref)=?", array($txt));
        $count2= $db->GetDataBySQL("select count(*) from dbo.sp_tor where i_yyyy = {$i_year}  and dc_cost2_id=? and f_total_amt=?", array($dc_cost2_id,$f_total_amt));
        $code_count= $db->GetDataBySQL("select  top 1 c_code from dbo.sp_tor where i_yyyy = {$i_year}  and  dc_cost2_id=? and f_total_amt=?", array($dc_cost2_id,$f_total_amt));
        $c_code = $code_count!= '' ? $code_count : $c_code ;
    break;
}
if (true) {
    $re = array("reval" => 0, "success" => "Success", "msg" => "ตรวจสอบข้อมูลซ้ำ", "pr_code" => $c_code, "exisTxt" => intVal($count), "exisTxt2" => intVal($count2));
} else {
    
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}


echo json_encode($re);
exit;

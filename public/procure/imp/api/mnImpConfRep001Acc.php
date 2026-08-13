<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
$table 	= "conf_acc_rep";
$msg 	= 'เรียบร้อยแล้ว'; 

//Inteliz
$db->BeginTran();
$stmChkMaster 	= true;
$data_acc = $_REQUEST["dc_acc_id"];
$str_dc_acc_id = "";
if (is_array($data_acc)){
	foreach($data_acc as $dc_acc_id => $value){
		$str_dc_acc_id .= ", {$dc_acc_id}";
	}
	$str_dc_acc_id = substr($str_dc_acc_id, 1);
}

$sql = "DELETE FROM {$table} WHERE report_number = 1;
		INSERT INTO {$table} (report_number, dc_acc_id) 
		SELECT 1, dc_acc_id FROM vw_dc_acc WHERE dc_acc_id IN ({$str_dc_acc_id})";  
$stmChkMaster = $db->QueryParam($sql, array()); 
$log = "SAVE ";

if ($stmChkMaster)
{
	$db->CommitTran();
	$re = array("reval"=>0,"success"=>"Success","msg"=>$msg,"data"=>@$returnData,"log"=>@$log);
}
else
{
	$db->RollBackTran();
	$re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
}
echo json_encode($re); exit; 

?>
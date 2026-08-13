<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");

$db		= new DatabaseServer();

$addField	= null;
$addValue	= null;
$arrValue	= array();

$data	= json_decode(@$_REQUEST["data"], true);

$gl		= $db->GetDataBySQL("SELECT * FROM gl_config_dc_acc", array());

if($gl) {
	$re	= array("success"=> false, "msg"=>"มีการตั้งค่าบัญชีแล้ว");
} else {
	
	$ss["i_level_all"]			= $_REQUEST["i_level"];
	
	foreach($data as $arr ) {
		$ss["i_level".$arr["length_lv"]]	= $arr["position"];
	}

	foreach ($ss as $fld => $value) {
		$arrParam[] = ($value != "")? $value : NULL;
		$addField .= ", {$fld}";
		$addValue .= ", ?";
	}
		
	$sql	= "INSERT INTO gl_config_dc_acc (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
	$db->QueryParam($sql, $arrParam);
	
	$re = array("success"=>true, "msg"=>"ตั้งค่าเรียบร้อย");
}

echo json_encode($re);
exit; 
?>
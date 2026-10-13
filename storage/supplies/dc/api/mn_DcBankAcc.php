<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/configDc.php");

$db		= new DatabaseServer();
$date	= new i_date();
$util	= new apiUtil();

// ========================= SEARCH =============================== //

if(@$_POST["type"] == "check_main") {
	$con	= null;
	if($_POST["mode"] == "EDIT") {
		$con	.= "AND dc_bank_acc_company_id != ".$_POST["id"]."";
	}
	$sql	= "SELECT * FROM dc_bank_acc_company WHERE i_main = ? AND i_delete = 2 ".$con;
	$stmt = $db->QueryParam($sql, array($_POST["value"]));
	if(sqlsrv_has_rows($stmt)) {
		while($row =$db->Fetch($stmt)) {
			$data[]	= "{$row["c_code"]}";
		}
		$json["data"]		= $data;
		$json["success"]	= false;
	}
	
	$json["success"]	= (sqlsrv_has_rows($stmt))? false : true;
	echo json_encode($json,true);
	exit;
}

// ========================= S A V E =============================== //

$id			= @$_REQUEST["id"];
$mode		= @$_REQUEST["mode"];

$table		= "dc_bank_acc_company";
$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

if (!$util->get($id)) { $id = 0; }

switch ($mode) {
	case "ADD" :
		$data["dc_bank_deposit_type_id"]	= @$_REQUEST["dc_bank_deposit_type_id"];
		$data["dc_bank_id"]					= @$_REQUEST["dc_bank_id"];
		$data["dc_bank_branch_id"]			= @$_REQUEST["dc_bank_branch_id"];
		$data["dc_acc_id"]					= @$_REQUEST["dc_acc_id"];
		$data["dc_area_id"]					= @$_REQUEST["dc_area_id"];
		$data["c_code"]						= @$_REQUEST["c_code"];
		$data["c_name"]						= @$_REQUEST["c_name"];
		$data["c_comment"]					= @$_REQUEST["c_comment"];
		$data["i_enable"]					= (@$_REQUEST["i_enable"] != 1) ?  2 : 1;
		$data["i_main"]						= (@$_REQUEST["i_main"] != 1) ?  DC_BANK_ACC_MAIN_MCOT : DC_BANK_ACC_MAIN_NONE;
		$data["i_delete"]					= 2;
		$data["dc_user_create_id"]			= $_SESSION["user_id"];
		$data["dc_user_create_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_create"]					= date("Y-m-d H:i:s");
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");
		
		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld}";
			$addValue .= ", ?";
		}
		$sql	= " INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
		break;
	case "EDIT" :
		$data["dc_bank_deposit_type_id"]	= @$_REQUEST["dc_bank_deposit_type_id"];
		$data["dc_bank_id"]					= @$_REQUEST["dc_bank_id"];
		$data["dc_bank_branch_id"]			= @$_REQUEST["dc_bank_branch_id"];
		$data["dc_acc_id"]					= @$_REQUEST["dc_acc_id"];
		$data["dc_area_id"]					= @$_REQUEST["dc_area_id"];
		$data["c_code"]						= @$_REQUEST["c_code"];
		$data["c_name"]						= @$_REQUEST["c_name"];
		$data["c_comment"]					= @$_REQUEST["c_comment"];
		$data["i_enable"]					= (@$_REQUEST["i_enable"] != 1) ?  2 : 1;
		$data["i_main"]						= (@$_REQUEST["i_main"] != 1) ?  DC_BANK_ACC_MAIN_MCOT : DC_BANK_ACC_MAIN_NONE;
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");
		
		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		$arrValue[] = $id;
		$sql	= "UPDATE {$table} SET ".substr($addField, 1)." WHERE dc_bank_acc_company_id = ?";
		break;
	case "DELETE" :
		// FLD
		$data["i_delete"]					= 1;
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");
		
		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		$arrValue[] = $id;
		$sql	= "UPDATE {$table} SET ".substr($addField, 1)." WHERE dc_bank_acc_company_id = ?";
		break;
	default : break;
}

$db->BeginTran();
$para	= $db->QueryParam($sql, $arrValue);
if($para){
	$db->CommitTran();
	$re = array("success"	=> "success",
				"msg"		=> "success" );
} else {
	$db->RollBackTran();
	$re = array( "msg" => "error" );
}

echo json_encode($re);
exit;
?>
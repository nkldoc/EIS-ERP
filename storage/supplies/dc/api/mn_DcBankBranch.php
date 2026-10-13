<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date	= new i_date();
$util	= new apiUtil();

$id			= @$_REQUEST["id"];
$mode		= @$_REQUEST["mode"];

$table		= "dc_bank_branch"; 
$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

if (!$util->get($id)) { $id = 0; }

switch ($mode) {
	case "ADD" :
		$data["dc_bank_id"]					= @$_REQUEST["dc_bank_id"];
		$data["branch_code"]				= @$_REQUEST["branch_code"];
		$data["c_name"]						= @$_REQUEST["c_name"];
		$data["c_name_eng"]					= @$_REQUEST["c_name_eng"];
		$data["i_fin_biz"]					= @$_REQUEST["i_fin_biz"];
		$data["c_telephone"]				= @$_REQUEST["c_telephone"];
		$data["c_fax"]						= @$_REQUEST["c_fax"];
		$data["c_address"]					= @$_REQUEST["c_address"];
		$data["c_comment"]					= @$_REQUEST["c_comment"];
		$data["i_enable"]					= (@$_REQUEST["i_enable"] != 1) ?  2 : 1;
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
		$sql	= " SET NOCOUNT ON	
					INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");
					SELECT @@IDENTITY as dc_bank_branch_id;";
		
		$stmt	= $db->QueryParam($sql, $arrValue);
		unset ($sql);
		unset ($arrValue);
		/* ======================================================= */
		if ($stmt) {
			$ss_id			= $db->Fetch($stmt);
			$sql			= "EXEC SP_GEN_CODE_DC ?,?,?,?;";
			$arrValue		= array("DBB", $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ss_id["dc_bank_branch_id"]);
			$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
			unset ($sql);
			unset ($arrValue);
			
			if ($ss_id["dc_bank_branch_id"] == $arr_gen_code["reference_id"]) {
				$sql		= "UPDATE {$table} SET c_code = ? WHERE dc_bank_branch_id = ?";
				$arrValue[] = $arr_gen_code["c_code_gen"];
				$arrValue[] = $ss_id["dc_bank_branch_id"];
			}
		}		
		break;
	case "EDIT" :
		$data["dc_bank_id"]					= @$_REQUEST["dc_bank_id"];
		$data["branch_code"]				= @$_REQUEST["branch_code"];
		$data["c_name"]						= @$_REQUEST["c_name"];
		$data["c_name_eng"]					= @$_REQUEST["c_name_eng"];
		$data["i_fin_biz"]					= @$_REQUEST["i_fin_biz"];
		$data["c_telephone"]				= @$_REQUEST["c_telephone"];
		$data["c_fax"]						= @$_REQUEST["c_fax"];
		$data["c_address"]					= @$_REQUEST["c_address"];
		$data["c_comment"]					= @$_REQUEST["c_comment"];
		$data["i_enable"]					= (@$_REQUEST["i_enable"] != 1) ?  2 : 1;
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");
		
		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		$arrValue[] = $id;
		$sql	= "UPDATE {$table} SET ".substr($addField, 1)." WHERE dc_bank_branch_id = ?";
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
		$sql	= "UPDATE {$table} SET ".substr($addField, 1)." WHERE dc_bank_branch_id = ?";
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
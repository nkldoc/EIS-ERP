<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../dc/conf/configDc.php");

$db		= new DatabaseServer();
$date	= new i_date();

// ========================= SEARCH =============================== //

if(@$_POST["type"] == "check_ref") {
	
	$con	= null;
	$data	= null;
	
	if($_POST["mode"] == "EDIT") {
		$con	.= " AND dc_creditor_id != ".$_POST["id"]."";
	}
	$sql	= "SELECT * FROM NMU.dbo.dc_creditor WHERE i_enable = ? AND i_delete = ? AND c_ref_value = '".$_POST["value"]."' ".$con;
	$stmt = $db->QueryParam($sql, array(STATUS_ENABLE, DELETE_FALSE));
	if(sqlsrv_has_rows($stmt)) {
		while($row =$db->Fetch($stmt)) {
			$data[]	= "[".$row["c_code"]."] - ".$row["c_name"];
		}
		$json["data"]		= $data;
		$json["success"]	= false;
	} else {
		$json["data"]		= null;
		$json["success"]	= true;
	}
	
	$json["data"]		= $data;
	echo json_encode($json, true);
	exit;
} else if(@$_POST["type"] == "check_tax") {

	$con	= null;
	$data	= null;
	
	if($_POST["mode"] == "EDIT") {
		$con	.= " AND dc_creditor_id != ".$_POST["id"]."";
	}
	$sql	= "SELECT * FROM NMU.dbo.dc_creditor WHERE i_enable = ? AND i_delete = ? AND c_tax_value = '".$_POST["value"]."' ".$con;
	$stmt = $db->QueryParam($sql, array(STATUS_ENABLE, DELETE_FALSE));
	if(sqlsrv_has_rows($stmt)) {
		while($row =$db->Fetch($stmt)) {
			$data[]	= "[".$row["c_code"]."] - ".$row["c_name"];
		}
		$json["data"]		= $data;
		$json["success"]	= false;
	} else {
		$json["data"]		= null;
		$json["success"]	= true;
	}
	
	$json["data"]		= $data;
	echo json_encode($json, true);
	exit;
	
} else if(@$_POST["type"] == "check_main") {
		$con	= null;
		$con	.= " AND dc_creditor_id = ".$_REQUEST["dc_creditor_id"]."";
		if($_POST["mode"] == "EDIT_BANK") {
			$con	.= "AND dc_bank_acc_creditor_id != ".$_POST["id"]."";
		}
		$sql	= "SELECT * FROM dc_bank_acc_creditor WHERE i_main = ? AND i_delete = ".DELETE_FALSE." ".$con;
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

$mode		= @$_REQUEST["mode"];
$table		= "dc_creditor";
$fld_id		= "dc_creditor_id";

$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ($mode) {
	
	case "ADD" :
	case "EDIT" :
		
		$c_name		= $db->GetDataBySQL("SELECT c_name FROM dc_title WHERE dc_title_id = ?", array(@$_REQUEST["dc_title_id"]));
		$c_name		.= " ".$_REQUEST["c_firstname"];
		$c_name		.= " ".$_REQUEST["c_surname"];
		
		$data["dc_acc_id"]						= @$_REQUEST["dc_acc_id"];
		$data["dc_tax_customer_id"]				= @$_REQUEST["dc_tax_customer_id"];
		$data["dc_title_id"]					= @$_REQUEST["dc_title_id"];
		$data["c_old_code"]						= @$_REQUEST["c_old_code"];
		$data["c_name"]							= $c_name;
		$data["c_firstname"]					= @$_REQUEST["c_firstname"];
		$data["c_surname"]						= @$_REQUEST["c_surname"];
		$data["c_address"]						= @$_REQUEST["c_address"];
		$data["c_telephone"]					= @$_REQUEST["c_telephone"];
		$data["c_mobile"]						= @$_REQUEST["c_mobile"];
		$data["c_fax"]							= @$_REQUEST["c_fax"];
		$data["c_website"]						= @$_REQUEST["c_website"];
		$data["c_email"]						= @$_REQUEST["c_email"];
		$data["c_tax_value"]					= @$_REQUEST["c_tax_value"];
		$data["c_ref_value"]					= @$_REQUEST["c_ref_value"];
		$data["c_comment"]						= @$_REQUEST["c_comment"];
		$data["i_enable"]						= (@$_REQUEST["i_enable"] == "true")? STATUS_ENABLE : STATUS_DISABLE;
		$data["i_branch"]						= @$_REQUEST["i_branch"];
		$data["c_branch"]						= @$_REQUEST["c_branch"];
		$data["dc_user_update_id"]				= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
		$data["d_update"]						= date("Y-m-d H:i:s");

		if($mode == "ADD") {
			
			$data["i_delete"]						= DELETE_FALSE;
			$data["dc_user_create_id"]				= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]			= $_SESSION["dc_cost_id"];
			$data["d_create"]						= date("Y-m-d H:i:s");
			
			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "")? $value : NULL;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}
					
			$sql	= "	SET NOCOUNT ON
						INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");
						SELECT @@IDENTITY as id;";
	
			$para	= $db->QueryParam($sql, $arrValue);
			$ss_id	= $db->Fetch($para);
			$id		= $ss_id["id"];
			
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			
			$sql			= "EXEC SP_GEN_CODE_DC ?,?,?,?;";
			$arrValue		= array("CV", $_SESSION["user_id"], $_SESSION["dc_cost_id"], $id);
			$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
			unset ($sql);
			unset ($arrValue);
			
			if ($id == $arr_gen_code["reference_id"]) {
				$sql		= "UPDATE {$table} SET c_code = ? WHERE {$fld_id} = ?";
				$arrValue[] = $arr_gen_code["c_code_gen"];
				$arrValue[] = $id;
			
				$para	= $db->QueryParam($sql, $arrValue);
			}
					
		} else if ($mode == "EDIT") {
			
			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "")? $value : NULL;
				$addField .= ", {$fld} = ?";
			}
	
			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$fld_id} = ?";
			$para		= $db->QueryParam($sql, $arrValue);
			$id			= $_REQUEST["id"];
			
		}
		
		// ============== //
		$addField	= null;
		$addValue	= null;
		unset ($data);
		unset ($arrValue);
		// ============== //
				
		if ( $para ) {
			$re = array("success"			=> true,
						"dc_creditor_id"	=> $id,
						"msg"				=> "success" );
		} else {
			$re = array("success"			=> false,
						"dc_creditor_id"	=> $id,
						"msg"				=> "error" );
		}

		echo json_encode($re);
		exit;
		break;

	case "DELETE" :
		
		$data["i_delete"]					= DELETE_TRUE;
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");
		
		foreach($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		$arrValue[] = $_REQUEST["id"];
		$sql	= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$fld_id} = ?";
		$para	= $db->QueryParam($sql, $arrValue);
		
		if ( $para ) {
			$re = array("success"					=> true,
					"msg"						=> "success" );
		} else {
			$re = array("success"					=> false,
					"msg"						=> "error" );
		}
		
		echo json_encode($re);
		exit;
		break;

	case "ADD_BANK" :
	case "EDIT_BANK" :

		$data["dc_bank_deposit_type_id"]	= @$_REQUEST["dc_bank_deposit_type_id"];
		$data["dc_bank_id"]					= @$_REQUEST["dc_bank_id"];
		$data["dc_bank_branch_id"]			= @$_REQUEST["dc_bank_branch_id"];
		$data["dc_creditor_id"]				= @$_REQUEST["dc_creditor_id"];
		$data["c_code"]						= @$_REQUEST["c_code"];
		$data["c_name"]						= @$_REQUEST["c_name"];
		$data["c_comment"]					= @$_REQUEST["c_comment"];
		$data["i_enable"]					= (@$_REQUEST["i_enable"] == "true")? STATUS_ENABLE : STATUS_DISABLE;
		$data["i_main"]						= (@$_REQUEST["i_main"] == "true")? DC_BANK_I_MAIN_CNT : DC_BANK_ACC_MAIN_NONE;
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");

		if($mode == "ADD_BANK") {
				
			$data["i_delete"]						= DELETE_FALSE;
			$data["dc_user_create_id"]				= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]			= $_SESSION["dc_cost_id"];
			$data["d_create"]						= date("Y-m-d H:i:s");
				
			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "")? $value : NULL;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}
				
			$sql	= "	SET NOCOUNT ON
						INSERT INTO dc_bank_acc_creditor (".substr($addField, 1).") VALUES (".substr($addValue,1).");
						SELECT @@IDENTITY as id;";
		
			$para	= $db->QueryParam($sql, $arrValue);
			$ss_id	= $db->Fetch($para);
			$id		= $ss_id["id"];
				
		} else if ($mode == "EDIT_BANK") {
				
			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "")? $value : NULL;
				$addField .= ", {$fld} = ?";
			}
		
			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE dc_bank_acc_creditor SET ".substr($addField, 1)." WHERE dc_bank_acc_creditor_id = ?";
			$para		= $db->QueryParam($sql, $arrValue);
			$id			= $_REQUEST["id"];
				
		}
		
		if ( $para ) {
			$re = array("success"					=> true,
						"dc_bank_acc_creditor_id"	=> $id,
						"msg"						=> "success" );
		} else {
			$re = array("success"					=> false,
						"dc_bank_acc_creditor_id"	=> $id,
						"msg"						=> "error" );
		}
		
		echo json_encode($re);
		exit;
		break;

	case "DELETE_BANK" :
		
		$data["i_delete"]					= DELETE_TRUE;
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");
	
		foreach($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		$arrValue[] = $_REQUEST["id"];
		$sql	= "UPDATE dc_bank_acc_creditor SET ".substr($addField, 1)." WHERE dc_bank_acc_creditor_id = ?";

		$para	= $db->QueryParam($sql, $arrValue);
		
		if ( $para ) {
			$re = array("success"					=> true,
						"msg"						=> "success" );
		} else {
			$re = array("success"					=> false,
						"msg"						=> "error" );
		}
		
		echo json_encode($re);
		exit;
		break;
		
	default : break;
} 
?>
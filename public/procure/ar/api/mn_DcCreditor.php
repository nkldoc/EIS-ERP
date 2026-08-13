<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../dc/conf/config_dc.php");
include("../conf/configAR.php");

$db		= new DatabaseServer();
$date	= new i_date();

// ========================= SEARCH =============================== //

if(@$_POST["type"] == "check_ref") {
	$con	= null;
	$data	= null;
	
	if($_POST["mode"] == "EDIT") {
		$con	.= " AND dc_cnt_id != ".$_POST["id"]."";
	}
	$sql	= "SELECT * FROM dc_cnt WHERE i_enable = ? AND i_delete = ? AND c_ref_value = '".$_POST["value"]."' ".$con;
	$stmt = $db->QueryParam($sql, array(AR_CONTACT_PERSONAL_TYPE1, AR_CONTACT_PERSONAL_TYPE2));
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
		$con	.= " AND dc_cnt_id != ".$_POST["id"]."";
	}
	$sql	= "SELECT * FROM dc_cnt WHERE i_enable = ? AND i_delete = ? AND c_tax_value = '".$_POST["value"]."' ".$con;
	$stmt = $db->QueryParam($sql, array(1, 2));
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
} else if(@$_POST["type"] == "check_trans_acc_tb") {
	$con	= null;
	$con	.= " AND dc_cnt_id = ".$_REQUEST["dc_cnt_id"]."";
	if($_POST["mode"] == "EDIT_BANK") {
		$con	.= " AND dc_bank_acc_id != ".$_POST["id"]." ";
	}
	$con	.= " AND i_type = ".DC_BANK_ACC_TYPE_CNT." "; // ( 1 = สำหรับบริษัท, 2 = สำหรับพนักงาน, 3 = สำหรับผู้ขาย/ผู้รับจ้าง )
	$sql	= "SELECT * FROM dc_bank_acc WHERE i_trans_acc_tb = ? AND i_delete = 2 ".$con;
	$stmt = $db->QueryParam($sql, array($_POST["value"]));
	$json["success"]	= (sqlsrv_has_rows($stmt))? false : true;
	echo json_encode($json,true);
	exit;
} else if(@$_POST["type"] == "check_main") {
		$con	= null;
		$con	.= " AND dc_cnt_id = ".$_REQUEST["dc_cnt_id"]."";
		if($_POST["mode"] == "EDIT_BANK") {
			$con	.= "AND dc_bank_acc_id != ".$_POST["id"]."";
		}
		$con	.= " AND i_type = ".DC_BANK_ACC_TYPE_CNT." "; // ( 1 = สำหรับบริษัท, 2 = สำหรับพนักงาน, 3 = สำหรับผู้ขาย/ผู้รับจ้าง )
		$sql	= "SELECT * FROM dc_bank_acc WHERE i_main = ? AND i_delete = 2 ".$con;
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
$id			= @$_REQUEST["id"];
$table		= "dc_cnt";

$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

if (!get($id)) { $id = 0; }

switch ($mode) {
	case "ADD" :
		$data["dc_cnt_type_id"]					= @$_REQUEST["dc_cnt_type_id"];
		$data["dc_acc_id"]						= @$_REQUEST["dc_acc_id"];
		$data["dc_tax_customer_id"]				= @$_REQUEST["dc_tax_customer_id"];
		$data["dc_title_id"]					= @$_REQUEST["dc_title_id"];
		$data["c_old_code"]						= @$_REQUEST["c_old_code"];
		$data["c_name"]							= @$_REQUEST["c_name"];
		$data["c_surname"]						= @$_REQUEST["c_surname"];
		$data["c_address"]						= @$_REQUEST["c_address"];
		$data["c_telephone"]					= @$_REQUEST["c_telephone"];
		$data["c_mobile"]						= @$_REQUEST["c_mobile"];
		$data["c_fax"]							= @$_REQUEST["c_fax"];
		$data["c_website"]						= @$_REQUEST["c_website"];
		$data["c_email"]						= @$_REQUEST["c_email"];
		$data["c_tax_value"]					= @$_REQUEST["c_tax_value"];
		$data["c_ref_value"]					= @$_REQUEST["c_ref_value"];
		$data["i_is_debtor"]					= @$_REQUEST["i_is_debtor"];
		$data["i_group_cnt"]					= @$_REQUEST["i_group_cnt"];
		$data["parent_id"]						= @$_REQUEST["parent_id"];
		$data["order_id"]						= @$_REQUEST["order_id"];
		$data["c_comment"]						= @$_REQUEST["c_comment"];
		$data["i_company_pay_tax"]				= (@$_REQUEST["i_company_pay_tax"] == "true")? 1 : 2;
		$data["i_enable"]						= (@$_REQUEST["i_enable"] == "true")? 1 : 2;
		$data["due_bill"]						= @$_REQUEST["due_bill"];
		$data["i_tax_fix"]						= @$_REQUEST["i_tax_fix"];
		$data["dc_tax_id"]						= @$_REQUEST["dc_tax_id"];
		$data["f_dec_rate"]						= @$_REQUEST["f_dec_rate"];
		$data["f_tax_reduce"]					= @$_REQUEST["f_tax_reduce"];
		$data["dc_disc_type_id"]				= @$_REQUEST["dc_disc_type_id"];
		$data["c_name_inv"]						= @$_REQUEST["c_name_inv"];
		$data["c_address_inv"]					= @$_REQUEST["c_address_inv"];
		$data["c_add_bank1"]					= @$_REQUEST["c_add_bank1"];
		$data["c_add_bank2"]					= @$_REQUEST["c_add_bank2"];
		$data["c_add_bank3"]					= @$_REQUEST["c_add_bank3"];
		$data["c_add_bank4"]					= @$_REQUEST["c_add_bank4"];
		$data["c_address_inv2"]					= @$_REQUEST["c_address_inv2"];
		$data["title_name"]						= @$_REQUEST["title_name"];
		$data["i_dec_person"]					= $db->GetDataBySQL("SELECT i_dec_person FROM dc_tax_customer WHERE dc_tax_customer_id = ?", array(@$_REQUEST["dc_tax_customer_id"]));
		$data["i_credit_card"]					= (@$_REQUEST["i_credit_card"] == "true")? 1 : 2;
		$data["c_credit_name"]					= @$_REQUEST["c_credit_name"];
		$data["i_daily_worker"]					= @$_REQUEST["i_daily_worker"];
		$data["i_branch"]						= @$_REQUEST["i_branch"];
		$data["c_branch"]						= @$_REQUEST["c_branch"];
		$data["i_delete"]						= 2;
		$data["dc_user_create_id"]				= $_SESSION["user_id"];
		$data["dc_user_create_cost_id"]			= $_SESSION["dc_cost_id"];
		$data["d_create"]						= date("Y-m-d H:i:s");
		$data["dc_user_update_id"]				= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
		$data["d_update"]						= date("Y-m-d H:i:s");

		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld}";
			$addValue .= ", ?";
		}
		$sql	= "	SET NOCOUNT ON
					INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");
					SELECT @@IDENTITY as dc_cnt_id;";
		
		$para	= $db->QueryParam($sql, $arrValue);
		unset ($sql);
		unset ($arrValue);
		
		if($para) {
			$ss_id			= $db->Fetch($para);

			$sql			= "EXEC SP_GEN_CODE_DC ?,?,?,?;";
			$arrValue		= array("CV", $data["dc_user_create_id"], $data["dc_user_create_cost_id"], $ss_id["dc_cnt_id"]);
			$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
			unset ($sql);
			unset ($arrValue);

			if ($ss_id["dc_cnt_id"] == $arr_gen_code["reference_id"]) {
				$sql		= "UPDATE {$table} SET c_code = ? WHERE dc_cnt_id = ?";
				$arrValue[] = $arr_gen_code["c_code_gen"];
				$arrValue[] = $ss_id["dc_cnt_id"];
				
				$db->BeginTran();
				$para	= $db->QueryParam($sql, $arrValue);
				if($para){
					$db->CommitTran();
					$re = array(	"success"	=> "success",
									"id"		=> $ss_id["dc_cnt_id"],
									"msg"		=> "success" );
				} else {
					$db->RollBackTran();
					$re = array( "msg" => "error" );
				}
			}
		} else {
			$re = array( "msg" => "error" );
		}
		echo json_encode($re);
		exit;
		break;
	case "EDIT" :
		$data["dc_cnt_type_id"]					= @$_REQUEST["dc_cnt_type_id"];
		$data["dc_acc_id"]						= @$_REQUEST["dc_acc_id"];
		$data["dc_tax_customer_id"]				= @$_REQUEST["dc_tax_customer_id"];
		$data["dc_title_id"]					= @$_REQUEST["dc_title_id"];
		$data["c_old_code"]						= @$_REQUEST["c_old_code"];
		$data["c_name"]							= @$_REQUEST["c_name"];
		$data["c_surname"]						= @$_REQUEST["c_surname"];
		$data["c_address"]						= @$_REQUEST["c_address"];
		$data["c_telephone"]					= @$_REQUEST["c_telephone"];
		$data["c_mobile"]						= @$_REQUEST["c_mobile"];
		$data["c_fax"]							= @$_REQUEST["c_fax"];
		$data["c_website"]						= @$_REQUEST["c_website"];
		$data["c_email"]						= @$_REQUEST["c_email"];
		$data["c_tax_value"]					= @$_REQUEST["c_tax_value"];
		$data["c_ref_value"]					= @$_REQUEST["c_ref_value"];
		$data["i_is_debtor"]					= @$_REQUEST["i_is_debtor"];
		$data["i_group_cnt"]					= @$_REQUEST["i_group_cnt"];
		$data["parent_id"]						= @$_REQUEST["parent_id"];
		$data["order_id"]						= @$_REQUEST["order_id"];
		$data["c_comment"]						= @$_REQUEST["c_comment"];
		$data["i_company_pay_tax"]				= (@$_REQUEST["i_company_pay_tax"] == "true")? 1 : 2;
		$data["i_enable"]						= (@$_REQUEST["i_enable"] == "true")? 1 : 2;
		$data["due_bill"]						= @$_REQUEST["due_bill"];
		$data["i_tax_fix"]						= @$_REQUEST["i_tax_fix"];
		$data["dc_tax_id"]						= @$_REQUEST["dc_tax_id"];
		$data["f_dec_rate"]						= @$_REQUEST["f_dec_rate"];
		$data["f_tax_reduce"]					= @$_REQUEST["f_tax_reduce"];
		$data["dc_disc_type_id"]				= @$_REQUEST["dc_disc_type_id"];
		$data["c_name_inv"]						= @$_REQUEST["c_name_inv"];
		$data["c_address_inv"]					= @$_REQUEST["c_address_inv"];
		$data["c_add_bank1"]					= @$_REQUEST["c_add_bank1"];
		$data["c_add_bank2"]					= @$_REQUEST["c_add_bank2"];
		$data["c_add_bank3"]					= @$_REQUEST["c_add_bank3"];
		$data["c_add_bank4"]					= @$_REQUEST["c_add_bank4"];
		$data["c_address_inv2"]					= @$_REQUEST["c_address_inv2"];
		$data["title_name"]						= @$_REQUEST["title_name"];
		$data["i_dec_person"]					= $db->GetDataBySQL("SELECT i_dec_person FROM dc_tax_customer WHERE dc_tax_customer_id = ?", array(@$_REQUEST["dc_tax_customer_id"]));
		$data["i_credit_card"]					= (@$_REQUEST["i_credit_card"] == "true")? 1 : 2;
		$data["c_credit_name"]					= @$_REQUEST["c_credit_name"];
		$data["i_daily_worker"]					= @$_REQUEST["i_daily_worker"];
		$data["i_branch"]						= @$_REQUEST["i_branch"];
		$data["c_branch"]						= @$_REQUEST["c_branch"];
		$data["dc_user_update_id"]				= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
		$data["d_update"]						= date("Y-m-d H:i:s");
		
		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		$arrValue[] = $id;
		$sql	= "UPDATE {$table} SET ".substr($addField, 1)." WHERE dc_cnt_id = ?";
		break;
	case "DELETE" :
		$data["i_delete"]					= 1;
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");
		
		foreach($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		$arrValue[] = $id;
		$sql	= "UPDATE {$table} SET ".substr($addField, 1)." WHERE dc_cnt_id = ?";
		break;
	case "ADD_BANK" :
		$data["dc_bank_deposit_type_id"]	= @$_REQUEST["dc_bank_deposit_type_id"];
		$data["dc_bank_id"]					= @$_REQUEST["dc_bank_id"];
		$data["dc_bank_branch_id"]			= @$_REQUEST["dc_bank_branch_id"];
		$data["dc_acc_id"]					= @$_REQUEST["dc_acc_id"];
		$data["dc_cnt_id"]					= @$_REQUEST["dc_cnt_id"];
		$data["dc_area_id"]					= @$_REQUEST["dc_area_id"];
		$data["c_code"]						= @$_REQUEST["c_code"];
		$data["c_name"]						= @$_REQUEST["c_name"];
		$data["c_comment"]					= @$_REQUEST["c_comment"];
		$data["i_enable"]					= (@$_REQUEST["i_enable"] == "true")? 1 : 2;
		$data["i_main"]						= (@$_REQUEST["i_main"] == "true")? DC_BANK_I_MAIN_CNT : DC_BANK_ACC_MAIN_NONE;
		$data["i_trans_acc_tb"]				= (@$_REQUEST["i_trans_acc_tb"] == "true")? 1 : 2;
		$data["i_type"]						= DC_BANK_ACC_TYPE_CNT;
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
		$sql	= "INSERT INTO dc_bank_acc (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
		break;
	case "EDIT_BANK" :
		$data["dc_bank_deposit_type_id"]	= @$_REQUEST["dc_bank_deposit_type_id"];
		$data["dc_bank_id"]					= @$_REQUEST["dc_bank_id"];
		$data["dc_bank_branch_id"]			= @$_REQUEST["dc_bank_branch_id"];
		$data["dc_acc_id"]					= @$_REQUEST["dc_acc_id"];
		$data["dc_cnt_id"]					= @$_REQUEST["dc_cnt_id"];
		$data["dc_area_id"]					= @$_REQUEST["dc_area_id"];
		$data["c_code"]						= @$_REQUEST["c_code"];
		$data["c_name"]						= @$_REQUEST["c_name"];
		$data["c_comment"]					= @$_REQUEST["c_comment"];
		$data["i_enable"]					= (@$_REQUEST["i_enable"] == "true")? 1 : 2;
		$data["i_main"]						= (@$_REQUEST["i_main"] == "true")? DC_BANK_I_MAIN_CNT : DC_BANK_ACC_MAIN_NONE;
		$data["i_trans_acc_tb"]				= (@$_REQUEST["i_trans_acc_tb"] == "true")? 1 : 2;
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");
	
		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		$arrValue[] = $id;
		$sql	= "UPDATE dc_bank_acc SET ".substr($addField, 1)." WHERE dc_bank_acc_id = ?";
		break;
	case "DELETE_BANK" :
		$data["i_delete"]					= 1;
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");
	
		foreach($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		$arrValue[] = $id;
		$sql	= "UPDATE dc_bank_acc SET ".substr($addField, 1)." WHERE dc_bank_acc_id = ?";
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
function get($a){ return isset($a) && !empty($a)?$a:null; }
?>
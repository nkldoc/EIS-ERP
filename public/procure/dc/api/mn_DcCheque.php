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

$table		= "dc_cheque";
$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

if (!$util->get($id)) {
	$id = 0;
}


//print_r(@$_REQUEST); echo "<br>";
switch ($mode) {
	case "ADD":
		$c_start_no								= @$_REQUEST["c_cheque"];

		$data_arr["dc_bank_acc_company_id"]		= @$_REQUEST["dc_bank_acc_company_id"];
		$data_arr["i_total"]					= @$_REQUEST["i_total"];
		$data_arr["d_gen"]						= date("Y-m-d H:i:s");
		$data_arr["f_money"]					= "0";
		$data_arr["i_status"]					= 1;
		$data_arr["i_enable"]					= 1;
		$data_arr["i_delete"]					= 2;
		$data_arr["dc_user_create_id"]			= $_SESSION["user_id"];
		$data_arr["dc_user_create_cost_id"]		= $_SESSION["dc_cost_id"];
		$data_arr["d_create"]					= date("Y-m-d H:i:s");
		$data_arr["dc_user_update_id"]			= $_SESSION["user_id"];
		$data_arr["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data_arr["d_update"]					= date("Y-m-d H:i:s");

		$data_bank = $db->GetDataBySQL("select c_short from vw_dc_bank_acc_company_full where dc_bank_acc_company_id=?", array($data_arr["dc_bank_acc_company_id"]));

		for ($i = 0; $i < $data_arr["i_total"]; $i++) {
			$c_no 							= $c_start_no + $i;

			$data_panda["$i"] 				= $data_arr;
			$data_panda["$i"]["c_cheque"] 	= $c_no;
			$data_panda["$i"]["c_show"]		= $c_no . " " . $data_bank;
		}

		//เลขRUN - ชื่อ Field - ค่า 
		$sql = $str_panda = "";
		foreach ($data_panda as $index => $arr_fields) {
			$addField = $addValue = $str_field = $str_value = $addField  = $addValue = $pda = "";

			$sql	.= " INSERT INTO {$table} (";
			foreach ($arr_fields as $fld => $value) {
				/*  เฉพาะชื่อฟิลด์ใน DB */
				$str_field  .= ($str_field != "") ? ",{$fld}" : "{$fld}";

				$arrValue[] = ($value != "") ? $value : NULL;
				$str_value  .= (($str_value != "") && ($value != "")) ? ",?" : "?";
			}
			$sql		.= $str_field . ") VALUES (" . $str_value . ");";
			//	echo "<hr>sql=$sql"; 

			$addField = $addValue = $str_field = $str_value = $addField  = $addValue = $pda = "";
			unset($arr_fields);
		}



		break;
	case "EDIT":

		$c_show = $db->GetDataBySQL("SELECT a.c_cheque+' '+b.c_short AS c_show
									FROM dc_cheque a
										INNER JOIN vw_dc_bank_acc_company_full b ON {$_REQUEST["dc_bank_acc_company_id"]} = b.dc_bank_acc_company_id
									WHERE a.dc_cheque_id = ?", array($id));

		$data["dc_bank_acc_company_id"]			= $_REQUEST["dc_bank_acc_company_id"];
		$data["c_show"]							= $c_show;
		$data["dc_user_update_id"]				= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
		$data["d_update"]						= date("Y-m-d H:i:s");

		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "") ? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		$arrValue[] = $id;
		$sql	= "UPDATE {$table} SET " . substr($addField, 1) . " WHERE dc_cheque_id = ?";
		$db->BeginTran();
		$para	= $db->QueryParam($sql, $arrValue);
		if ($para) {
			$db->CommitTran();
			$re = array(
				"success"	=> "success",
				"msg"		=> "success"
			);
		} else {
			$db->RollBackTran();
			$re = array("msg" => "error");
		}
		break;
	case "DELETE":

		$dc = $db->GetDataBySQL("
			SELECT
				a.dc_cheque_id
				,COUNT(b.dc_cheque_id) AS count_cheque
			FROM dbo.dc_cheque a
			LEFT JOIN (
				SELECT aa.* FROM (
					SELECT
						aaa.dc_cheque_id
					FROM dbo.imp_expense_dtl_cheque aaa
					UNION ALL
					SELECT
						aaa.dc_cheque_id
					FROM dbo.imp_expense_vsn_dtl_cheque aaa
				) aa
			) b ON a.dc_cheque_id = b.dc_cheque_id
			WHERE a.i_delete = 2 AND a.dc_cheque_id = ?
			GROUP BY a.dc_cheque_id;", array($id));

		if ($dc["count_cheque"] == 0) {
			// FLD
			$data["i_delete"]					= 1;
			$data["dc_user_update_id"]			= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
			$data["d_update"]					= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : NULL;
				$addField .= ", {$fld} = ?";
			}
			$arrValue[] = $id;
			$sql	= "UPDATE {$table} SET " . substr($addField, 1) . " WHERE dc_cheque_id = ?";
			$db->BeginTran();
			$para	= $db->QueryParam($sql, $arrValue);
		} else {
			$msg = "สถานะเช็คจ่ายแล้วไม่สามารถยกเลิกได้";
		}
		if (@$para) {
			$db->CommitTran();
			$re = array(
				"success"		=> true,
				"msg"			=> "success"
			);
		} else {
			$db->RollBackTran();
			$re = array(
				"success"		=> false,
				"msg"			=> $msg
			);
		}
		echo json_encode($re);
		exit;
		break;
	default:
		break;
}


$db->BeginTran();
$para	= $db->QueryParam($sql, $arrValue);

if ($para) {
	$db->CommitTran();
	$re = array(
		"success"	=> "success",
		"msg"		=> "success"
	);
} else {
	$db->RollBackTran();
	$re = array("msg" => "error");
}

echo json_encode($re);
exit;

<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();


$root		= "data";
$data		= array();

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();
$arr_stmt    = array();
$msg = "";

// echo $_REQUEST["i_year"] ;
$Arr_dc_cost_id = json_decode($_REQUEST["dc_cost_id_s"], true);
// print_r($Arr_dc_cost_id);

// exit;

$db->BeginTran();
switch ($mode) {
	case "ADD":
		$para = $db->QueryParam("DELETE " . DB_CENTER . "dc_user_cost_sys WHERE c_code_sys = ? AND dc_user_id = ?", array($_REQUEST["c_code_sys"], $_REQUEST["id"]));
		$arr_stmt[] = $para === false ? 0 : 1;
		if ($Arr_dc_cost_id) {
			foreach ($Arr_dc_cost_id as $dc_cost_id) {
				$msg	= "";
				$data["dc_user_id"]           = $_REQUEST["id"];
				$data["dc_cost_id"]           = $dc_cost_id;
				$data["i_type_view"]          = $_REQUEST["i_type_view"];
				$data["c_code_sys"]           = $_REQUEST["c_code_sys"];

				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "") ? $value : null;
					$addField .= ", {$fld}";
					$addValue .= ", ?";
				}

				$sql	= "
					SET NOCOUNT ON
					INSERT INTO " . DB_CENTER . "dc_user_cost_sys (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
					SELECT @@IDENTITY as id;";

				$para	= $db->QueryParam($sql, $arrValue);
				$arr_stmt[] = $para === false ? 0 : 1;
				$ss_id	= $db->Fetch($para);
				$id		= $ss_id["id"];

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //
			}

			if (in_array(0, $arr_stmt)) $msg = $arr_stmt;
			if ($msg == "") {
				$re = array(
					"success"					=> true,
					"id"						=> $id,
					"msg"						=> ""
				);
				$db->CommitTran();
			} else {
				$re = array(
					"success"					=> false,
					"msg"						=> $msg
				);
				$db->RollBackTran();
			}
		} else {
			$re = array(
				"success"					=> true,
				"id"						=> $_REQUEST["id"],
				"msg"						=> ""
			);
			$db->CommitTran();
		}

		break;
}
echo json_encode($re);
exit;

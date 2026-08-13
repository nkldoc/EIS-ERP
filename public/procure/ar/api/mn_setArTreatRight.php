<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ($mode) {

	case "EDIT":
		$msg = "";
		$Arr = json_decode($_REQUEST["data"], true);

		if ($msg == "") {
			foreach ($Arr as $fldd) {

				$data["ar_treat_right_group_id"]				= $fldd["ar_treat_right_group_id"];

				if ($fldd["ar_treat_right_id"] > 0) { // EDIT

					foreach ($data as $fldA => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fldA} = ?";
					}

					$arrValue[] = $fldd["ar_treat_right_id"];
					$sql		= "UPDATE dbo.ar_treat_right SET " . substr($addField, 1) . " WHERE ar_treat_right_id = ?;";
					$db->QueryParam($sql, $arrValue);
				}
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //
			}

			$re	= array("success" => true);
		} else {
			$re = array(
				"success"	=> false,
				"msg"		=> $msg
			);
		}
		// =========================================================== //

		break;
}
echo json_encode($re);
exit;

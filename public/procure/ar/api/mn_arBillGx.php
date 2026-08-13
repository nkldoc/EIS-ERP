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

	case "SAVE_DATA":

		$msg = "";

		$d_start = $date->shot_date_from_db($_REQUEST["d_start"]);
		$d_end = $date->shot_date_from_db($_REQUEST["d_end"]);

		$c_name = substr($d_start, 0, -5) . " - " . $d_end;

		if ($_REQUEST["d_start"] == "" || $_REQUEST["d_end"] == "") {
			$msg = "กรุณาเลือกช่วงวันที่แก้ไข";
		} else {
			$i_success_gx = $db->GetDataBySQL("
				SELECT DISTINCT i_success_gx FROM dbo.ar_bill_log
				WHERE d_action_date BETWEEN '{$_REQUEST["d_start"]} 00:00:00.000' AND '{$_REQUEST["d_end"]} 23:59:59.000';", array());
			if ($i_success_gx == 1) {
				$msg = "ประมวลรายการ {$c_name} แล้ว";
			}
		}

		if ($msg == "") {
			if ($_REQUEST["type"] == "bill") { // ประมวลผลใบเรียกเก็บ
				$sql = "
					BEGIN TRANSACTION;
					EXEC SP_AR_PROCESS_BILL_GX
						'{$_REQUEST["d_start"]} 00:00:00.000',
						'{$_REQUEST["d_end"]} 23:59:59.000',
						{$_SESSION["user_id"]},
						{$_SESSION["dc_cost_id"]};
					COMMIT TRANSACTION;";
				echo $sql;
				exit;
				$para	= $db->QueryParam($sql, $arrValue);
			}
		}

		if (@$para) {
			$re = array(
				"success"					=> true,
				"msg"						=> "ประมวลผลรายการเรียบร้อย"
			);
		} else {
			$re = array(
				"success"					=> false,
				"msg"						=> $msg
			);
		}

		break;
}
echo json_encode($re);
exit;

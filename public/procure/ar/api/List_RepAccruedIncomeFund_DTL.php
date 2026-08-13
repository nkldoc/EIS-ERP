<?php
include("../../dc/conf/configDc.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;
$select		= null;
$flds		= null;
$groupBy	= null;

function List_QueryParam()
{

	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy, $CONF_I_FUND_TYPE;

	$totalCount		= 0;

	// $year_s				= (string) (@$_REQUEST["year_s"]);
	// $month_s			= (string) sprintf("%02d%", @$_REQUEST["month_s"], "");
	// $year_e				= (string) (@$_REQUEST["year_e"]);
	// $month_e			= (string) sprintf("%02d%", @$_REQUEST["month_e"], "");

	// if ($_REQUEST["i_cheque"] == 1) { // เช็คที่จ่ายแล้ว
	// 	$con	.= " AND i_cheque = 1";
	// } else if ($_REQUEST["i_cheque"] == 2) { // เฉพาะเช็คค้างจ่าย
	// 	$con	.= " AND i_cheque = 2";
	// 	$con	.= " AND (i_status = 1 OR i_status_bank = 1)";
	// } else if ($_REQUEST["i_cheque"] == 3) { // เฉพาะเช็คยกเลิก
	// 	$con	.= " AND i_cheque = 2";
	// 	$con	.= " AND i_status = 2";
	// }

	$sqlMain	= "
		SET NOCOUNT ON;
		SELECT
			b.dc_cost_debtor_id
			,c.c_name AS c_cost_name
			,b.c_hn
			,b.c_patient
			,b.f_charge
			,b.c_no_charge
			,CONVERT(VARCHAR, b.d_save_charge, 120) as d_save_charge
			FROM dbo.imp_debtor_charge_hdr a
				INNER JOIN dbo.imp_debtor_charge_dtl b ON a.imp_debtor_charge_hdr_id = b.imp_debtor_charge_hdr_id
				LEFT JOIN dbo.dc_cost_debtor c ON b.dc_cost_debtor_id = c.dc_cost_debtor_id
		WHERE a.i_enable = 1;";

	$stmt = $db->QueryParam($sqlMain, array());

	$arrData = array();
	if ($stmt) {
		$no = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"							=> ++$no,
				"c_cost_name"					=> $row["c_cost_name"],
				"c_hn"							=> $row["c_hn"],
				"c_patient" 					=> $row["c_patient"],
				"f_charge"						=> $row["f_charge"],
				"c_no_charge"					=> $row["c_no_charge"],
				"d_save_charge"					=> $date->shot_date_from_db($row["d_save_charge"]),

			);

			${$root}[] = $temp;
		}

		$no = 0;
		// foreach ($arrData as $id => $obj) {


		// }
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}

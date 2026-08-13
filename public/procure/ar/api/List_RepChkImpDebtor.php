<?php
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

	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy;

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
			b.c_no_charge
			,b.f_charge
			,b.d_save_charge
			,b.c_hn
			,b.c_patient
			,b.i_date_admission
		INTO #TMP_CHARGE
		FROM dbo.imp_debtor_charge_hdr a
			INNER JOIN dbo.imp_debtor_charge_dtl b ON a.imp_debtor_charge_hdr_id = b.imp_debtor_charge_hdr_id
		WHERE a.i_enable = 1

		SELECT
			b.c_no_charge
			,b.c_hn
			,b.i_date_admission
			,b.c_no_pay
			,b.f_pay
			,b.d_save_pay
		INTO #TMP_PAY
		FROM dbo.imp_debtor_pay_hdr a
			INNER JOIN dbo.imp_debtor_pay_dtl b ON a.imp_debtor_pay_hdr_id = b.imp_debtor_pay_hdr_id
		WHERE a.i_enable = 1

		SELECT
			a.c_no_charge
			,CONVERT(VARCHAR, a.d_save_charge, 120) AS d_save_charge
			,a.c_hn
			,a.c_patient
			,a.i_date_admission
			,a.f_charge
			,b.c_no_pay
			,CONVERT(VARCHAR, b.d_save_pay, 120) AS d_save_pay
			,b.f_pay
		FROM
		(SELECT * FROM #TMP_CHARGE) a
		FULL JOIN
		(SELECT * FROM #TMP_PAY ) b ON a.c_no_charge = b.c_no_charge AND a.i_date_admission = b.i_date_admission
		ORDER BY a.c_no_charge, a.c_hn;";

	$stmt = $db->QueryParam($sqlMain, array());

	$arrData = array();
	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {
			$arrData[$row["c_no_charge"]]["c_no_charge"] = $row["c_no_charge"];
			$arrData[$row["c_no_charge"]]["data"][$row["i_date_admission"]] = array(
				"c_hn"					=> $row["c_hn"],
				"c_patient" 			=> $row["c_patient"],
				"f_charge"				=> $row["f_charge"],
				"d_save_charge"			=> $row["d_save_charge"],
				"c_no_pay"				=> $row["c_no_pay"],
				"d_save_pay"			=> $row["d_save_pay"],
				"f_pay"					=> $row["f_pay"],

			);
		}


		foreach ($arrData as $c_no_charge => $obj) {
			$no = 0;

			$temp = array(
				"i_type"					=> 1,
				"c_no_charge"				=> $c_no_charge,
			);

			${$root}[] = $temp;

			foreach ($arrData[$c_no_charge]["data"]  as $i_date_admission => $dtl) {
				$temp = array(
					"no"							=> ++$no,
					"i_type"						=> 2,
					"c_hn"							=> $dtl["c_hn"],
					"c_patient"						=> $dtl["c_patient"],
					"f_charge"						=> $dtl["f_charge"],
					"d_save_charge"					=> ($dtl["d_save_charge"] != "") ? $date->shot_date_from_db($dtl["d_save_charge"]) : "",
					"i_date_admission"				=> $i_date_admission,
					"c_no_pay"						=> $dtl["c_no_pay"],
					"d_save_pay"					=> ($dtl["d_save_pay"] != "") ? $date->shot_date_from_db($dtl["d_save_pay"]) : "",
					"f_pay"							=> $dtl["f_pay"],
				);

				${$root}[] = $temp;
			}
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}

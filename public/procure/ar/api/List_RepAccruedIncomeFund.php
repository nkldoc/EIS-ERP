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
			c.i_fund
			,c.dc_debtor_claim_id
			,c.c_name
			,COUNT(b.c_hn) AS i_hn
			,SUM(ISNULL(b.f_charge,0)) AS f_charge
		FROM dbo.imp_debtor_charge_hdr a
			INNER JOIN dbo.imp_debtor_charge_dtl b ON a.imp_debtor_charge_hdr_id = b.imp_debtor_charge_hdr_id
			INNER JOIN dbo.dc_debtor_claim c ON b.dc_debtor_claim_id = c.dc_debtor_claim_id
		WHERE a.i_enable = 1
		GROUP BY c.i_fund, c.dc_debtor_claim_id, c.c_name
		ORDER BY c.c_name;";

	$stmt = $db->QueryParam($sqlMain, array());

	$arrData = array();
	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {
			// $arrData[$row["c_no_charge"]]["c_no_charge"] = $row["c_no_charge"];
			$arrData[$row["dc_debtor_claim_id"]] = array(
				"c_fund"				=> $CONF_I_FUND_TYPE[$row["i_fund"]],
				"c_name"				=> $row["c_name"],
				"i_hn" 					=> $row["i_hn"],
				"f_charge"				=> $row["f_charge"],
			);
		}

		$i_hn = 0;
		$f_charge = 0;
		$c_fund	= "";
		foreach ($arrData as $id => $obj) {
			// $no = 0;
			$temp = array(
				"i_type"					=> 1,
				"c_fund"					=> $obj["c_fund"],
				"c_name"					=> $obj["c_name"],
				"i_hn"						=> $obj["i_hn"],
				"f_charge"					=> $obj["f_charge"],
			);

			${$root}[] = $temp;

			$c_fund = $obj["c_fund"];
			$i_hn += $obj["i_hn"];
			$f_charge += $obj["f_charge"];
		}
		$temp = array(
			"i_type"						=> 2,
			"c_fund"						=> $c_fund,
			"i_hn"							=> $i_hn,
			"f_charge"						=> $f_charge,
		);

		${$root}[] = $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}

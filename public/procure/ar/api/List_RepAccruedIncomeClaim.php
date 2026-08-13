<?php
include("../../dc/conf/configDc.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam()
{

	global $db, $date, $root, $data, $con, $arr_status, $CONF_I_FUND_TYPE;

	$totalCount		= 0;
	$conCheque		= "";
	$conDate		= "";

	// if ($_REQUEST["dc_bank_acc_company_id"] > 0) {
	// 	$conCheque .= " AND a.dc_bank_acc_company_id_source = " . $_REQUEST["dc_bank_acc_company_id"];
	// }
	// if ($_REQUEST["date_start"] != "" && $_REQUEST["date_end"] != "") {
	// 	$conDate	.= " AND a.d_save_jv_date between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
	// }

	$sqlMain = "
		SET NOCOUNT ON;
		SELECT
			ROW_NUMBER() OVER (PARTITION BY c.i_fund ORDER BY c.i_fund, c.c_name DESC,d.c_name DESC) i_is_fund
			,ROW_NUMBER() OVER (PARTITION BY c.dc_debtor_claim_id ORDER BY c.i_fund, c.c_name DESC,d.c_name) i_is_claim
			,ROW_NUMBER() OVER (PARTITION BY c.dc_debtor_claim_id ORDER BY c.i_fund, c.c_name DESC,d.c_name DESC) i_is_claim_desc
			,c.i_fund
			,c.dc_debtor_claim_id
			,c.c_name AS c_name_claim
			,b.dc_cost_debtor_id
			,d.c_name AS c_name_cost
			,COUNT(b.c_hn) AS i_hn
			,SUM(ISNULL(b.f_charge,0)) AS f_charge
		FROM dbo.imp_debtor_charge_hdr a
			INNER JOIN dbo.imp_debtor_charge_dtl b ON a.imp_debtor_charge_hdr_id = b.imp_debtor_charge_hdr_id
			INNER JOIN dbo.dc_debtor_claim c ON b.dc_debtor_claim_id = c.dc_debtor_claim_id AND c.i_enable = 1
			INNER JOIN dbo.dc_cost_debtor d ON b.dc_cost_debtor_id = d.dc_cost_debtor_id AND d.i_enable = 1
		WHERE a.i_enable = 1
		GROUP BY c.i_fund, c.dc_debtor_claim_id, c.c_name, b.dc_cost_debtor_id, d.c_name
		ORDER BY c.i_fund, c.c_name, d.c_name;";

	$arrParam[]	= "";

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		// $sum_dr		= 0;
		// $sum_cr		= 0;
		// // ยอดยกมา
		// $date_start				= date("Y-m-d", strtotime("{$_REQUEST["date_start"]} -1 month"));
		// list($yyyy, $mm, $dd)		= explode("-", $date_start);
		// list($yyyy2, $mm2, $dd2)	= explode("-", $_REQUEST["date_end"]);

		// $f_end_dr = 0;
		// $f_end_cr = 0;
		// $data_f_end	= $db->GetDataBySQL("SELECT
		// 									SUM(ISNULL(aa.f_end_dr,0)-ISNULL(aa.f_end_cr,0)) AS f_end_dr
		// 									,SUM(ISNULL(aa.f_end_cr,0)-ISNULL(aa.f_end_dr,0)) AS f_end_cr 
		// 								FROM gl_balance_cost aa
		// 								WHERE
		// 								(
		// 								aa.dc_acc_id IN (
		// 									SELECT b.dc_acc_id FROM gl_bank a
		// 										INNER JOIN dc_bank_acc_company b ON a.dc_bank_acc_company_id_source = b.dc_bank_acc_company_id
		// 									WHERE 1=1 {$conCheque} )
		// 								) AND aa.c_mm={$mm} AND aa.c_yyyy={$yyyy};", array());

		// if ($data_f_end["f_end_dr"] >= 0) {
		// 	$f_end_dr = $data_f_end["f_end_dr"];
		// 	$f_end_cr = 0;
		// } else if ($data_f_end["f_end_dr"] < 0) {
		// 	$f_end_dr = 0;
		// 	$f_end_cr = $data_f_end["f_end_cr"];
		// }

		while ($row = $db->Fetch($stmt)) {

			// $arrData[$row["i_fund"]] = array(
			// 	"c_fund"				=> $CONF_I_FUND_TYPE[$row["i_fund"]],
			// 	// "c_name"				=> $row["c_name"],
			// 	// "i_hn" 					=> $row["i_hn"],
			// 	// "f_charge"				=> $row["f_charge"],
			// );

			$temp = array(
				"i_is_fund"					=> ($row["i_is_fund"] == 1) ? true : false,
				"i_is_claim"				=> ($row["i_is_claim"] == 1) ? true : false,
				"i_is_claim_desc"			=> ($row["i_is_claim_desc"] == 1) ? true : false,
				"c_fund"					=> $CONF_I_FUND_TYPE[$row["i_fund"]],
				"c_name_claim"				=> $row["c_name_claim"],
				"c_name_cost"				=> $row["c_name_cost"],
				"i_hn"						=> $row["i_hn"],
				"f_charge"					=> $row["f_charge"]
			);
			${$root}[] = $temp;

			// if ($row["row_claim"] == 1) {
			// 	$temp = array(
			// 		"i_type"				=> 2,
			// 		"row_fund"				=> false,
			// 		"row_claim"				=> ($row["row_claim"] == 1) ? true : false,
			// 		"c_fund"				=> $CONF_I_FUND_TYPE[$row["i_fund"]],
			// 		"c_name_claim"			=> $row["c_name_claim"],
			// 		"c_name_cost"			=> $row["c_name_cost"],
			// 		"i_hn"					=> $row["i_hn"],
			// 		"f_charge"				=> $row["f_charge"]
			// 	);
			// 	${$root}[] = $temp;
			// }

			// $temp = array(
			// 	"i_type"				=> 2,
			// 	// 		"numrow"				=> ++$totalCount,
			// 	// 		"d_cheque_date"			=> ($row["i_type"] == 1) ? $date->shot_date_from_db($row["d_cheque_date"]) : "",
			// 	// 		"c_yyyy"				=> ($row["row_year"] == 1) ? $row["c_yyyy"] : "",
			// 	// 		"c_mm"					=> ($row["row_month"] == 1) ? $date->s_month_thai[$row["c_mm"]] : "",
			// 	// 		"c_dd"					=> ($row["row_day"] == 1) ? $row["c_dd"] : "",
			// 	// 		"c_cheque"				=> $row["c_cheque"],
			// 	// 		"c_name"				=> ($row["row_bank"] == 1) ? $row["c_name"] : "''",
			// 	// 		"f_dr"					=> ($row["i_type"] == 1) ? number_format($row["f_dr"], 2) : "",
			// 	// 		"f_cr"					=> ($row["i_type"] == 1) ? "" : number_format($row["f_cr"], 2)
			// );
			// ${$root}[] = $temp;

			// 	$sum_dr	+= $row["f_dr"];
			// 	$sum_cr	+= $row["f_cr"];
		};



		// if ($data_f_end["f_end_dr"] >= 0) {
		// 	$f_cal_end		= ($data_f_end["f_end_dr"] + $sum_dr) - $sum_cr;
		// } else if ($data_f_end["f_end_dr"] < 0) {
		// 	$f_prepare_cal	= -1 * $data_f_end["f_end_cr"];
		// 	$f_cal_end		= ($f_prepare_cal + $sum_dr) - $sum_cr;
		// }

		// $temp = array(
		// 	"i_type"				=> 4,
		// 	"numrow"				=> ++$totalCount,
		// 	"c_name"				=> "รวมเดือน",
		// 	"f_dr"					=> number_format($sum_dr, 2),
		// 	"f_cr"					=> number_format($sum_cr, 2),
		// 	"f_cal_end"				=> number_format($f_cal_end, 2),
		// 	"c_name2"				=> "ยอดยกมา",
		// 	"f_dr2"					=> number_format($f_end_dr, 2),
		// 	"f_cr2"					=> number_format($f_end_cr, 2),
		// 	"c_name3"				=> $date->s_month_thai[$mm] . " " . ($yyyy + 543) . " - " . $date->s_month_thai[$mm2] . " " . ($yyyy2 + 543),
		// 	"f_dr3"					=> number_format($sum_dr + $f_end_dr, 2),
		// 	"f_cr3"					=> number_format($sum_cr + $f_end_cr, 2)
		// );
		// ${$root}[] = $temp;

		// if (is_array($arrData)) {
		// 	foreach ($arrData as $i_fund => $obj) { }
		// }
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}

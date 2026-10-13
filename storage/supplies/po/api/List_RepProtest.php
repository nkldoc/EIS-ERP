<?php
include("../conf/configPo.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;

	$totalCount = 0;

	$con = "";
	if ($_REQUEST["dc_cost_id"] > 0) {
		$con .= " AND b.dc_cost_id = '{$_REQUEST["dc_cost_id"]}'";
	}
	if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		$con .= " AND b.dc_expense_budget_type_id = '{$_REQUEST["dc_expense_budget_type_id"]}'";
	}
	if ($_REQUEST["bg_expense_id"] > 0) {
		$con .= " AND b.bg_expense_id = '{$_REQUEST["bg_expense_id"]}'";
	}
	if ($_REQUEST["po_creditor_id"] > 0) {
		$con .= " AND b.po_creditor_id = '{$_REQUEST["po_creditor_id"]}'";
	}
	if ($_REQUEST["dc_approve_id"] > 0) {
		$con .= " AND bb.dc_user_create_id = '{$_REQUEST["dc_approve_id"]}'";
	}
	if ($_REQUEST["po_parcel_officer_id"] > 0) {
		$con .= " AND bb.po_parcel_officer_id = '{$_REQUEST["po_parcel_officer_id"]}'";
	}

	$sqlMain = "
		SELECT
			ROW_NUMBER() OVER (ORDER BY bb.d_doc_date DESC) AS row
			, c.c_code+' : '+c.c_name AS dc_cost_name
			, d.c_name AS dc_expense_budget_type_name
			, h.c_code+' : '+h.c_name AS bg_expense_name
			, e.c_name AS po_creditor_name
			, a.c_code_ref
			, CONVERT(VARCHAR, b.d_inv_date, 120) AS d_inv_date
			, bb.po_reason_protest_id_s AS po_reason_protest
			, CONVERT(VARCHAR, bb.d_doc_date, 120) AS d_doc_date
			, CONVERT (VARCHAR, bb.d_receive_date, 120) AS d_receive_date
			, f.c_name AS po_parcel_officer_name
			, g.c_full_name AS dc_user
		FROM po_working_hdr a
			INNER JOIN po_working_dtl b ON a.po_working_hdr_id =  b.po_working_hdr_id
			INNER JOIN po_working_item bb ON a.po_working_hdr_id =bb.po_working_hdr_id AND bb.i_status =3
			LEFT JOIN dc_cost c ON b.dc_cost_id = c.dc_cost_id
			LEFT JOIN dc_expense_budget_type d ON b.dc_expense_budget_type_id = d.dc_expense_budget_type_id
			LEFT JOIN po_creditor e ON b.po_creditor_id = e.po_creditor_id
			LEFT JOIN po_parcel_officer f ON f.po_parcel_officer_id = bb.po_parcel_officer_id
			LEFT JOIN dc_user g ON  bb.dc_user_create_id = g.dc_user_id
			LEFT JOIN bg_expense h on b.bg_expense_id = h.bg_expense_id
		WHERE a.i_enable = 1
			AND bb.d_doc_date BETWEEN '{$_REQUEST["d_date_start"]}' AND '{$_REQUEST["d_date_end"]}'
		{$con}";

		//echo $sqlMain; exit;
	$arrParam = array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		$arrDay = array("1" => "จ", "2" => "อ", "3" => "พ", "4" => "พฤ", "5" => "ศ", "6" => "ส", "7" => "อา");
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"								=> 1,
				"no"									=> $row["row"],
				"dc_cost_name"							=> $row["dc_cost_name"],
				"dc_expense_budget_type_name"			=> $row["dc_expense_budget_type_name"],
				"bg_expense_name"						=> $row["bg_expense_name"],
				"po_creditor_name"						=> $row["po_creditor_name"],
				"c_code_ref"							=> $row["c_code_ref"],
				"d_inv_date"							=> ($row["d_inv_date"] != "") ? $date->shot_date_from_db($row["d_inv_date"]) : "",
				"po_reason_protest"						=> $row["po_reason_protest"],
				"d_doc_date"							=> ($row["d_doc_date"] != "") ? $date->shot_date_from_db($row["d_doc_date"]) : "",
				"d_receive_date"						=> ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "",
				"po_parcel_officer_name"				=> $row["po_parcel_officer_name"],
				//"d_doc_date"							=> $row["d_doc_date"],
				//"d_receive_date"						=> $row["d_receive_date"],
				"dc_user"								=> $row["dc_user"]
			);
			${$root}[] = $temp;
		}
	}
	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}

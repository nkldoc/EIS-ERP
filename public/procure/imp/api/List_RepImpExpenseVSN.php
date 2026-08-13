<?php
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

	$ArrSum = array();
	$ArrSumlv4 = array();
	$ArrSumlv5 = array();
	$ArrD	= array(1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ");

	/* ====================== */
	$conn = "";
	$for_id = explode(";", $_REQUEST["dc_expense_budget_type_id"]);
	if (!in_array("0", $for_id)) {
		$in = "";
		if (is_array($for_id)) {
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND a.dc_expense_budget_type_id IN (" . $in . ")" : "";
			$conn .= ($in != "") ? " AND cc.dc_expense_budget_type_id IN (" . $in . ")" : "";
		}
	}

	if ($_REQUEST["i_type_year"] > 0) {
		$con .= " AND b.i_type_year = " . $_REQUEST["i_type_year"] . "AND b.c_budget_year = " . $_REQUEST["c_budget_year"];
		$conn .= " AND cc.i_type_year = " . $_REQUEST["i_type_year"] . " AND cc.c_budget_year = " . $_REQUEST["c_budget_year"];
	}

	if ($_REQUEST["i_show_acc"] == 1) {
		$for_id = explode(";", $_REQUEST["dc_acc_id_parent"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND e.dc_acc_lv4_id IN (" . $in . ")" : "";
				$conn .= ($in != "") ? " AND ff.dc_acc_lv4_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST["i_show_acc"] == 3) {
		$for_id = explode(";", $_REQUEST["dc_acc_id_parent_lv5"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND e.dc_acc_lv5_id IN (" . $in . ")" : "";
				$conn .= ($in != "") ? " AND ff.dc_acc_lv5_id IN (" . $in . ")" : "";
			}
		}
	} else {
		$for_id = explode(";", $_REQUEST["dc_acc_id"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND b.dc_acc_id_report IN (" . $in . ")" : "";
				$conn .= ($in != "") ? " AND ff.dc_acc_id IN (" . $in . ")" : "";
			}
		}
	}

	$for_id = explode(";", $_REQUEST["dc_user_create_id"]);
	if (!in_array("0", $for_id)) {
		$in = "";
		if (is_array($for_id)) {
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND a.dc_user_create_id IN (" . $in . ")" : "";
			$conn .= ($in != "") ? " AND bb.dc_user_create_id IN (" . $in . ")" : "";
		}
	}

	$subSql	= "
		/* =================== BTN ==================== */
		SELECT
			cc.i_return
			,cc.dc_expense_budget_type_id
			,ff.dc_acc_lv4_id
			,ff.dc_acc_lv5_id
			,-SUM(ISNULL(cc.f_cr,0)) AS f_amount
		FROM dbo.gl_bank aa
			INNER JOIN dbo.gl_tran_hdr bb ON aa.gl_tran_hdr_id = bb.gl_tran_hdr_id
			INNER JOIN dbo.gl_tran_dtl cc ON cc.gl_tran_hdr_id = bb.gl_tran_hdr_id
			INNER JOIN dbo.dc_acc dd ON dd.dc_acc_id = cc.dc_acc_id
			INNER JOIN dbo.imp_fix_acc ee ON dd.dc_acc_id = ee.dc_acc_id
			LEFT JOIN dbo.vw_dc_acc_with_parent ff ON cc.dc_acc_id = ff.dc_acc_id
		WHERE aa.i_enable = 1 AND LEFT(aa.c_code,3) = 'btn' AND bb.table_name = 'gl_bank'
			AND bb.i_enable = 1 AND bb.i_is_post > 1 AND LEFT(bb.c_code,1) = 'g'
			AND bb.i_is_close_year = 2
			AND ISNULL(cc.f_cr,0) > 0
			AND bb.i_type = 2
			AND dd.i_enable = 1
			AND CONVERT(DATETIME, bb.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
			{$conn}
		GROUP BY
			cc.dc_expense_budget_type_id
			,ff.dc_acc_lv4_id
			,ff.dc_acc_lv5_id
			,cc.i_return
		UNION ALL
		/* =============== ยกเลิก BTN ================== */
		SELECT
			cc.i_return
			,cc.dc_expense_budget_type_id
			,ff.dc_acc_lv4_id
			,ff.dc_acc_lv5_id
			,-(SUM(ISNULL(cc.f_cr,0))) AS f_amount
		FROM dbo.gl_tran_hdr bb
			INNER JOIN dbo.gl_tran_dtl cc ON bb.gl_tran_hdr_id = cc.gl_tran_hdr_id
			INNER JOIN dbo.dc_acc dd ON cc.dc_acc_id = dd.dc_acc_id
			INNER JOIN dbo.imp_fix_acc ee ON dd.dc_acc_id = ee.dc_acc_id
			LEFT JOIN dbo.vw_dc_acc_with_parent ff ON cc.dc_acc_id = ff.dc_acc_id
		WHERE bb.i_enable = 1 AND bb.i_is_post > 1 AND LEFT(bb.c_code,1) = 'g'
			AND bb.i_is_close_year = 2
			AND bb.i_type = 2
			AND dd.i_enable = 1
			AND ISNULL(cc.f_cr,0) > 0
			AND CONVERT(DATETIME, bb.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
			AND bb.table_name IN ('gl_bank')
			{$conn}
		GROUP BY
			cc.dc_expense_budget_type_id
			,ff.dc_acc_lv4_id
			,ff.dc_acc_lv5_id
			,cc.i_return
		UNION ALL
		/* GX ของ ทุกอย่างที่ไม่ใช่ BTN เฉพาะ ผังบัญชี (manual) */
		SELECT
			cc.i_return
			,cc.dc_expense_budget_type_id
			,ff.dc_acc_lv4_id
			,ff.dc_acc_lv5_id
			,-(SUM(ISNULL(cc.f_cr,0))) AS f_amount
		FROM dbo.gl_tran_hdr bb
			INNER JOIN dbo.gl_tran_dtl cc ON bb.gl_tran_hdr_id = cc.gl_tran_hdr_id
			INNER JOIN dbo.dc_acc dd ON cc.dc_acc_id = dd.dc_acc_id
			INNER JOIN dbo.imp_fix_acc ee ON dd.dc_acc_id = ee.dc_acc_id
			LEFT JOIN dbo.vw_dc_acc_with_parent ff ON cc.dc_acc_id = ff.dc_acc_id
		WHERE
			bb.i_enable = 1 AND bb.i_is_post > 1 AND LEFT(bb.c_code,1) = 'g'
			AND bb.i_is_close_year = 2
			AND ISNULL(cc.f_cr,0) > 0
			AND bb.i_type = 1
			AND dd.i_enable = 1
			AND CONVERT(DATETIME, bb.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
			{$conn}
		GROUP BY
			cc.dc_expense_budget_type_id
			,ff.dc_acc_lv4_id
			,ff.dc_acc_lv5_id
			,cc.i_return
		UNION ALL
		/* =============== ยกเลิก IMP ================== */
		SELECT
			cc.i_return
			,cc.dc_expense_budget_type_id
			,ff.dc_acc_lv4_id
			,ff.dc_acc_lv5_id
			,-(SUM(ISNULL(cc.f_cr,0))) AS f_amount
		FROM dbo.gl_tran_hdr bb
			INNER JOIN dbo.gl_tran_dtl cc ON bb.gl_tran_hdr_id = cc.gl_tran_hdr_id
			INNER JOIN dbo.dc_acc dd ON cc.dc_acc_id = dd.dc_acc_id
			INNER JOIN dbo.imp_fix_acc ee ON dd.dc_acc_id = ee.dc_acc_id
			LEFT JOIN dbo.vw_dc_acc_with_parent ff ON cc.dc_acc_id = ff.dc_acc_id
		WHERE bb.i_enable = 1 AND bb.i_is_post > 1 AND LEFT(bb.c_code,1) = 'g'
			AND bb.i_is_close_year = 2
			AND bb.i_type = 2
			AND dd.i_enable = 1
			AND ISNULL(cc.f_cr,0) > 0
			AND CONVERT(DATETIME, bb.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
			AND bb.table_name IN ('imp_expense_vsn_hdr', 'imp_expense_hdr')
			{$conn}
		GROUP BY
			cc.dc_expense_budget_type_id
			,ff.dc_acc_lv4_id
			,ff.dc_acc_lv5_id
			,cc.i_return";

	if ($subSql != "") {
		$sql = "
			DECLARE @d_begin datetime = '{$_REQUEST["d_date_start"]}';
			DECLARE @d_end datetime = '{$_REQUEST["d_date_end"]}';
			/* ========== BTN ========== */
			SELECT
				a.i_return
				,a.dc_expense_budget_type_id
				,SUM(ISNULL(a.f_amount,0)) AS f_amount
			FROM (
				{$subSql}
			) a
			GROUP BY a.dc_expense_budget_type_id, a.i_return;";
	}

	$stmt = $db->QueryParam($sql, array());

	foreach ($ArrD as $i_return => $c_name) {
		$ArrSum[$i_return]["f_amount"] = 0;
	}
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$ArrSum[$row["i_return"]]["f_amount"] += $row["f_amount"];
		}
	}

	// รายการ
	if ($_REQUEST["d_date_start"] != "" && $_REQUEST["d_date_end"] != "") {
		$con .= " AND b.d_doc BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date_end"]}'+' 23:59:59',102)";
	}
	if ($_REQUEST["dc_expense_acc_vsn_id"] > 0) {
		$con .= " AND b.dc_expense_acc_vsn_id = " . $_REQUEST["dc_expense_acc_vsn_id"];
	}

	if ($_REQUEST["i_cal_gl"] > 0) {
		$con .= " AND b.i_cal_gl = " . $_REQUEST["i_cal_gl"];
	}

	if ($_REQUEST["i_system"] > 0) {
		$con .= " AND a.i_system = " . $_REQUEST["i_system"];
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			b.imp_expense_vsn_dtl_id
			,a.c_code AS c_code_impv
			,d.dc_expense_budget_type_id
			,d.c_name AS dc_expense_budget_type_name
			,b.dc_expense_acc_vsn_id
			,c.c_name AS dc_expense_acc_vsn_name
			,e.dc_acc_lv4_id
			,e.c_name_lv4 AS acc_name_lv4
			,e.c_code_lv4 AS acc_code_lv4
			,e.dc_acc_lv5_id
			,e.c_name_lv5 AS acc_name_lv5
			,e.c_code_lv5 AS acc_code_lv5
			,e.dc_acc_id
			,e.c_code+' '+e.c_name AS acc_name
			,CONVERT(VARCHAR, b.d_doc, 120) AS d_doc
			,b.i_type_year
			,b.c_budget_year
			,b.c_approve
			,b.c_request
			,b.c_creditor						
			,b.c_expense_group_main
			,b.c_acc_item
			,b.f_inv
			,b.f_tax_personal
			,b.f_social_security
			,b.f_prov_fund
			,b.f_fine
			,b.f_total
			,CONVERT(VARCHAR, b.d_cheque, 120) AS d_cheque
			,b.c_cheque
			,b.c_booking
			,e.i_group
			,b.i_status
		FROM imp_expense_vsn_hdr a
			INNER JOIN dbo.vw_imp_expense_vsn_dtl_items b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
			LEFT JOIN dc_expense_acc_vsn c ON b.dc_expense_acc_vsn_id = c.dc_expense_acc_vsn_id
			LEFT JOIN dc_expense_budget_type d ON a.dc_expense_budget_type_id = d.dc_expense_budget_type_id
			LEFT JOIN vw_dc_acc_with_parent e ON b.dc_acc_id_report = e.dc_acc_id
		WHERE a.i_enable = ? AND LEFT(a.c_code,4) = 'IMPV'
			{$con}
		ORDER BY
			CASE WHEN e.c_name_lv4 IS NULL THEN 1 ELSE 0 END, e.c_name_lv4,
			CASE WHEN e.c_name_lv5 IS NULL THEN 1 ELSE 0 END, e.c_name_lv5,
			e.c_name;";

	$arrParam[] = STATUS_ENABLE;

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	$sum_f_inv						= 0;
	$sum_f_tax_personal				= 0;
	$sum_f_social_security			= 0;
	$sum_f_prov_fund				= 0;
	$sum_f_fine						= 0;
	$sum_f_total					= 0;
	$s_sum_f_inv					= 0;

	if ($stmt) {
		$no = 0;
		while ($row = $db->Fetch($stmt)) {
			$no++;
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["acc_name_lv4"] = $row["acc_name_lv4"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["acc_code_lv4"] = $row["acc_code_lv4"];

			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["acc_name_lv5"] = $row["acc_name_lv5"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["acc_code_lv5"] = $row["acc_code_lv5"];

			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["c_code_impv"] = $row["c_code_impv"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["dc_expense_budget_type_name"] = $row["dc_expense_budget_type_name"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["dc_expense_acc_vsn_name"] = $row["dc_expense_acc_vsn_name"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["acc_name_lv4"] = $row["acc_name_lv4"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["acc_name_lv5"] = $row["acc_name_lv5"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["dc_acc_id"] = $row["dc_acc_id"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["acc_name"] = $row["acc_name"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["d_doc"] = ($row["d_doc"] != "") ? $date->shot_date_from_db($row["d_doc"]) : "";
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["c_budget_year"] = ($row["i_type_year"] == 1) ? ($row["c_budget_year"] + 543) : ($row["c_budget_year"] + 543) . " (เหลื่อมปี)";
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["c_approve"] = $row["c_approve"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["c_request"] = $row["c_request"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["c_creditor"] = $row["c_creditor"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["c_expense_group_main"] = $row["c_expense_group_main"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["c_acc_item"] = $row["c_acc_item"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["f_inv"] = $row["f_inv"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["f_tax_personal"] = $row["f_tax_personal"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["f_social_security"] = $row["f_social_security"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["f_prov_fund"] = $row["f_prov_fund"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["f_fine"] = $row["f_fine"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["f_total"] = $row["f_total"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["d_cheque"] = ($row["d_cheque"] != "") ? $date->shot_date_from_db($row["d_cheque"]) : "";
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["c_cheque"] = $row["c_cheque"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["c_booking"] = $row["c_booking"];
			$ArrExpenseVSNDtl[$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$no]["i_status"] = $row["i_status"];
		}

		if (isset($ArrExpenseVSNDtl)) {
			foreach ($ArrExpenseVSNDtl as $dc_acc_lv4_id => $obj_acc_lv4) {

				// LV4
				$f_inv						= 0;
				$f_tax_personal				= 0;
				$f_social_security			= 0;
				$f_prov_fund				= 0;
				$f_fine						= 0;
				$f_total					= 0;

				foreach ($obj_acc_lv4["data"] as $dc_acc_lv5_id => $obj_acc_lv5) {

					// LV5
					$f_inv_lv5						= 0;
					$f_tax_personal_lv5				= 0;
					$f_social_security_lv5			= 0;
					$f_prov_fund_lv5				= 0;
					$f_fine_lv5						= 0;
					$f_total_lv5					= 0;

					foreach ($obj_acc_lv5["data"] as $imp_expense_vsn_dtl_id => $obj) {

						$temp = array(
							"i_type"								=> 1,
							"c_code_impv"							=> $obj["c_code_impv"],
							"dc_expense_budget_type_name"			=> $obj["dc_expense_budget_type_name"],
							"dc_expense_acc_vsn_name"				=> $obj["dc_expense_acc_vsn_name"],
							"acc_name_lv4"							=> $obj["acc_name_lv4"],
							"acc_name_lv5"							=> $obj["acc_name_lv5"],
							"acc_name"								=> $obj["acc_name"],
							"d_doc"									=> $obj["d_doc"],
							"c_budget_year"							=> $obj["c_budget_year"],
							"c_approve"								=> $obj["c_approve"],
							"c_request"								=> $obj["c_request"],
							"c_creditor"							=> $obj["c_creditor"],
							"c_expense_group_main"					=> $obj["c_expense_group_main"],
							"c_acc_item"							=> $obj["c_acc_item"],
							"f_inv"									=> $obj["f_inv"],
							"f_tax_personal"						=> $obj["f_tax_personal"],
							"f_social_security"						=> $obj["f_social_security"],
							"f_prov_fund"							=> $obj["f_prov_fund"],
							"f_fine"								=> $obj["f_fine"],
							"f_total"								=> $obj["f_total"],
							"d_cheque"								=> $obj["d_cheque"],
							"c_cheque"								=> $obj["c_cheque"],
							"c_booking"								=> $obj["c_booking"],
							"i_status"								=> $obj["i_status"]
						);
						${$root}[] = $temp;

						// SUM_LV4
						$f_inv							+= $obj["f_inv"];
						$f_tax_personal					+= $obj["f_tax_personal"];
						$f_social_security				+= $obj["f_social_security"];
						$f_prov_fund					+= $obj["f_prov_fund"];
						$f_fine							+= $obj["f_fine"];
						$f_total						+= $obj["f_total"];
						// SUM_LV5
						$f_inv_lv5						+= $obj["f_inv"];
						$f_tax_personal_lv5				+= $obj["f_tax_personal"];
						$f_social_security_lv5			+= $obj["f_social_security"];
						$f_prov_fund_lv5				+= $obj["f_prov_fund"];
						$f_fine_lv5						+= $obj["f_fine"];
						$f_total_lv5					+= $obj["f_total"];
						// SUM_TOTAL
						$sum_f_inv						+= $obj["f_inv"];
						$sum_f_tax_personal				+= $obj["f_tax_personal"];
						$sum_f_social_security			+= $obj["f_social_security"];
						$sum_f_prov_fund				+= $obj["f_prov_fund"];
						$sum_f_fine						+= $obj["f_fine"];
						$sum_f_total					+= $obj["f_total"];
					}

					// SUM LV5
					$temp = array(
						"i_type"						=> 4,
						"acc_name_lv5"					=> ($obj_acc_lv5["acc_name_lv5"] == "") ? "- ไม่ระบุบัญชีคุม LV5 -" : $obj_acc_lv5["acc_code_lv5"] . " " . $obj_acc_lv5["acc_name_lv5"],
						"f_inv"							=> $f_inv_lv5,
						"f_tax_personal"				=> $f_tax_personal_lv5,
						"f_social_security"				=> $f_social_security_lv5,
						"f_prov_fund"					=> $f_prov_fund_lv5,
						"f_fine"						=> $f_fine_lv5,
						"f_total"						=> $f_total_lv5
					);

					${$root}[] = $temp;
				}

				$temp = array(
					"i_type"						=> 2,
					"acc_name_lv4"					=> ($obj_acc_lv4["acc_name_lv4"] == "") ? "- ไม่ระบุบัญชีคุม -" : $obj_acc_lv4["acc_code_lv4"] . " " . $obj_acc_lv4["acc_name_lv4"],
					"f_inv"							=> $f_inv,
					"f_tax_personal"				=> $f_tax_personal,
					"f_social_security"				=> $f_social_security,
					"f_prov_fund"					=> $f_prov_fund,
					"f_fine"						=> $f_fine,
					"f_total"						=> $f_total
				);
				${$root}[] = $temp;
			}
		}
	}

	$temp = array(
		"i_type"						=> 3,
		"f_inv"							=> $sum_f_inv,
		"f_tax_personal"				=> $sum_f_tax_personal,
		"f_social_security"				=> $sum_f_social_security,
		"f_prov_fund"					=> $sum_f_prov_fund,
		"f_fine"						=> $sum_f_fine,
		"f_total"						=> $sum_f_total
	);
	${$root}[] = $temp;

	foreach ($ArrD as $i_return => $c_name) {
		// หักส่งคืน, ปรับปรุง, ไม่ระบุ
		if ($_REQUEST["i_btn{$i_return}"] == 1) {
			if ($ArrSum[$i_return]["f_amount"] != 0) {
				$temp = array(
					"i_type"							=> 9,
					"c_name"							=> $c_name,
					"i_return"							=> $i_return,
					"f_inv"								=> abs($ArrSum[$i_return]["f_amount"]),
					"f_total"							=> abs($ArrSum[$i_return]["f_amount"])
				);
				${$root}[] = $temp;

				$s_sum_f_inv += abs($ArrSum[$i_return]["f_amount"]);
			}
		}
	}

	if ($s_sum_f_inv > 0) {
		$temp = array(
			"i_type"						=> 10,
			"c_name"						=> "รวมทั้งสิ้น (หลัง)",
			"f_inv"							=> $sum_f_inv - $s_sum_f_inv,
			"f_tax_personal"				=> $sum_f_tax_personal,
			"f_social_security"				=> $sum_f_social_security,
			"f_prov_fund"					=> $sum_f_prov_fund,
			"f_fine"						=> $sum_f_fine,
			"f_total"						=> $sum_f_total - $s_sum_f_inv
		);
		${$root}[] = $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
